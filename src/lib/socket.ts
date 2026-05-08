"use client"

import { io, type Socket } from "socket.io-client"
import { useAuthStore } from "@/stores/auth.store"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000"

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
    console.log("[Socket] connected:", socket?.id)
  })

  socket.on("disconnect", (reason) => {
    console.log("[Socket] disconnected:", reason)
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
