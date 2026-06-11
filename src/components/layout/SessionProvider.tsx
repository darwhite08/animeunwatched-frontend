"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth.store"
import { connectSocket, disconnectSocket, updateSocketToken } from "@/lib/socket"
import { preloadNotificationAudio } from "@/lib/audio/notifications"
import { getOrCreateKeyPair, isE2EAvailable } from "@/lib/e2e-crypto"
import * as ep from "@/lib/api/endpoints"
import { RealtimeListeners } from "./RealtimeListeners"

const BASE = ""

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setAccess, setUser, setSessionReady, clear } = useAuthStore()
  const qc = useQueryClient()
  const bootstrapped = useRef(false)

  // Preload notification sounds + arm the gesture-unlock listener so the
  // browser's autoplay policy doesn't silence ringtones / chimes the first
  // time a socket event tries to play one.
  useEffect(() => {
    preloadNotificationAudio()
  }, [])

  // Bootstrap session from refresh cookie on page load.
  // setSessionReady() is called in every code path so layouts can reliably
  // wait for it before making auth-dependent decisions (e.g. slug redirect).
  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    fetch(`${BASE}/api/v1/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          clear()
          setSessionReady()   // confirmed: not authenticated
          return null
        }
        const { accessToken } = (await res.json()) as { accessToken: string }
        setAccess(accessToken)
        connectSocket(accessToken)
        return fetch(`${BASE}/api/v1/auth/me`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      })
      .then(async (res) => {
        if (!res?.ok) {
          // Refresh succeeded but /me failed → DON'T leave isAuthenticated=true
          // with user=null (that deadlocks the (user) ↔ (auth) layouts into a
          // blank /login loop). Treat as unauthenticated and let login render.
          clear()
          setSessionReady()
          return
        }
        const { user } = await res.json()
        setUser(user)
        setSessionReady()     // fully authenticated — user.slug is now available

      })
      .catch(() => {
        clear()
        setSessionReady()     // network error
      })
  }, [setAccess, setUser, setSessionReady, clear])

  // Self-heal: a session that predates the user-slug backfill carries slug=null,
  // which makes every /user/[slug]/* link fall back to /login. Re-fetch /auth/me
  // once so the now-backfilled slug lands in the store.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const slug = useAuthStore((s) => s.user?.slug)
  useEffect(() => {
    if (!isAuthenticated || slug) return
    ep.me()
      .then((r) => { if (r?.user?.slug) setUser(r.user) })
      .catch(() => {})
  }, [isAuthenticated, slug, setUser])

  // Reconnect socket when access token rotates + ensure E2E key is registered
  // when an authenticated session begins (covers cookie bootstrap, login,
  // register, oauth callback — every path that sets accessToken).
  useEffect(() => {
    const keyEnsuredFor = { token: null as string | null }
    const ensureKeyOnce = async (token: string) => {
      if (!isE2EAvailable || keyEnsuredFor.token === token) return
      keyEnsuredFor.token = token
      try {
        const { publicKeyJwk } = await getOrCreateKeyPair()
        await ep.uploadPublicKey(publicKeyJwk)
      } catch {
        keyEnsuredFor.token = null // allow retry on next token change
      }
    }
    const unsub = useAuthStore.subscribe((state, prev) => {
      if (state.accessToken && state.accessToken !== prev.accessToken) {
        updateSocketToken(state.accessToken)
        void ensureKeyOnce(state.accessToken)
      }
      // Session just became authenticated (cookie bootstrap on refresh, or
      // login). Many GETs use optionalAuth and return 200 unauthenticated, so
      // queries that fired before the token arrived cached impersonal data
      // (reactedByMe=false, likedByMe=false, isMember=false…). Refetch them now
      // that requests will carry the token.
      if (state.accessToken && !prev.accessToken) {
        void qc.invalidateQueries()
      }
      if (!state.accessToken && prev.accessToken) {
        disconnectSocket()
        keyEnsuredFor.token = null
        // Logged out — drop personalized state from the cache.
        void qc.invalidateQueries()
      }
    })
    return unsub
  }, [qc])

  return (
    <>
      <RealtimeListeners />
      {children}
    </>
  )
}
