"use client"

import { useEffect, useRef } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { connectSocket, disconnectSocket, updateSocketToken } from "@/lib/socket"

const BASE = ""

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setAccess, setUser, setSessionReady, clear } = useAuthStore()
  const bootstrapped = useRef(false)

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
          setSessionReady()   // refresh succeeded but /me failed
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

  // Reconnect socket when access token rotates
  useEffect(() => {
    const unsub = useAuthStore.subscribe((state, prev) => {
      if (state.accessToken && state.accessToken !== prev.accessToken) {
        updateSocketToken(state.accessToken)
      }
      if (!state.accessToken && prev.accessToken) {
        disconnectSocket()
      }
    })
    return unsub
  }, [])

  return <>{children}</>
}
