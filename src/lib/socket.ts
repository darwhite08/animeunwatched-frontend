"use client"

import { io, type Socket } from "socket.io-client"
import { useAuthStore } from "@/stores/auth.store"

// Socket URL resolution:
// - Server-side (SSR): use NEXT_PUBLIC_SOCKET_URL env var
// - localhost / LAN IP: connect directly to port 4000 (dev mode)
// - Any other host (production Vercel): use NEXT_PUBLIC_SOCKET_URL env var (Render backend)
function getSocketUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL
  if (typeof window === "undefined") return envUrl ?? "http://localhost:4000"
  const host = window.location.hostname
  const isLocal = host === "localhost" || /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(host)
  if (isLocal) return `http://${host}:4000`
  // Production: use env var (Render backend supports WebSockets on standard port)
  return envUrl ?? "http://localhost:4000"
}
const SOCKET_URL = getSocketUrl()

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket(accessToken: string): Socket {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    path: "/socket/v1",
    auth: { token: accessToken },
    transports: ["websocket"],
    autoConnect: true,
  })

  socket.on("connect", () => {
    if (process.env.NODE_ENV !== "production") console.log("[Socket] connected:", socket?.id)
  })

  socket.on("disconnect", (reason) => {
    if (process.env.NODE_ENV !== "production") console.log("[Socket] disconnected:", reason)
  })

  socket.on("connect_error", (err) => {
    console.warn("[Socket] error:", err.message)
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
