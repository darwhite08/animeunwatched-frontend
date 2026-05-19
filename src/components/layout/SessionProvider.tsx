"use client"

import { useEffect, useRef } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { connectSocket, disconnectSocket, updateSocketToken } from "@/lib/socket"

// Use relative /api/v1 path so it works on any device (phone, tablet, desktop)
// Next.js rewrites /api/v1/* to the backend internally
const BASE = ""

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setAccess, setUser, clear } = useAuthStore()
  const bootstrapped = useRef(false)

  // Bootstrap session from refresh cookie on page load
  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    fetch(`${BASE}/api/v1/auth/refresh`, { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) { clear(); return null }
        const { accessToken } = (await res.json()) as { accessToken: string }
        setAccess(accessToken)
        connectSocket(accessToken)
        return fetch(`${BASE}/api/v1/auth/me`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      })
      .then(async (res) => {
        if (!res?.ok) return
        const { user } = await res.json()
        setUser(user)
      })
      .catch(() => clear())
  }, [setAccess, setUser, clear])

  // Reconnect socket when access token changes (after refresh rotation)
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
