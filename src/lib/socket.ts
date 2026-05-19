"use client"

import { io, type Socket } from "socket.io-client"
import { useAuthStore } from "@/stores/auth.store"

// Socket.IO connects directly to the backend on port 4000 (always HTTP).
// The backend is HTTP — Chrome allows ws:// from https:// pages to localhost as a special exception.
// For LAN IP (phone), Chrome also allows mixed WebSockets in dev when the user clicks "proceed"
// on the self-signed cert warning.
function getSocketUrl(): string {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000"
  const host = window.location.hostname
  return `http://${host}:4000`
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
