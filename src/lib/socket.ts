"use client"

import { io, type Socket } from "socket.io-client"
import { useAuthStore } from "@/stores/auth.store"

// Socket URL resolution:
// - localhost / LAN IP: connect directly to port 4000 (dev mode)
// - Any other host (production Vercel): use NEXT_PUBLIC_SOCKET_URL → hard-coded Render URL
const RENDER_BACKEND = "https://kaiveron-backend.onrender.com"

function getSocketUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL
  if (typeof window === "undefined") return envUrl ?? RENDER_BACKEND
  const host = window.location.hostname
  const isLocal = host === "localhost" || /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(host)
  if (isLocal) return `http://${host}:4000`
  // Production: prefer env var, fall back to hard-coded Render URL (never localhost)
  return envUrl ?? RENDER_BACKEND
}
const SOCKET_URL = getSocketUrl()

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function forceReconnect(): void {
  if (!socket) return
  if (socket.connected) return
  socket.connect()
}

export function connectSocket(accessToken: string): Socket {
  // If socket exists but is exhausted/disconnected, destroy and recreate
  if (socket && !socket.connected) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    path: "/socket/v1",
    auth: { token: accessToken },
    // polling first, then upgrade to websocket — required for Render's proxy layer.
    // websocket-only mode fails silently on Render free tier because their load
    // balancer needs the HTTP handshake (polling) to establish the upgrade.
    transports: ["polling", "websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity, // never give up — Render cold starts can take 30s
    reconnectionDelay: 3000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  })

  socket.on("connect", () => {
    if (process.env.NODE_ENV !== "production") console.log("[Socket] connected:", socket?.id)
  })

  socket.on("disconnect", (reason) => {
    if (process.env.NODE_ENV !== "production") console.log("[Socket] disconnected:", reason)
  })

  socket.on("connect_error", (err) => {
    console.warn("[Socket] error:", err.message)
    // If the server rejects our token, the access token is stale/invalid.
    // Force a full page reload — SessionProvider will try to refresh the token;
    // if the refresh cookie is also invalid (JWT secret rotated), the user is
    // redirected to /login with a fresh session.
    if (err.message === "unauthorized" || err.message === "jwt expired" || err.message === "invalid signature") {
      console.warn("[Socket] Auth failed — reloading to refresh session")
      socket?.removeAllListeners()
      socket?.disconnect()
      socket = null
      // Small delay so we don't reload mid-render
      setTimeout(() => {
        if (typeof window !== "undefined") window.location.reload()
      }, 1500)
    }
  })

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function updateSocketToken(accessToken: string): void {
  if (!socket) return
  socket.auth = { token: accessToken }
  if (!socket.connected) socket.connect()
}
