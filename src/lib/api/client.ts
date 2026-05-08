"use client"

import { useAuthStore } from "@/stores/auth.store"

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000"

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message)
  }
}

let isRefreshing = false
let refreshQueue: Array<() => void> = []

type ApiOptions = RequestInit & { skipRefresh?: boolean }

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { skipRefresh, ...init } = opts
  const token = useAuthStore.getState().accessToken

  const res = await fetch(`${BASE}/api/v1${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })

  if (res.status === 401 && !skipRefresh) {
    await refreshTokenOnce()
    return api<T>(path, { ...opts, skipRefresh: true })
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      body?.error?.code ?? "INTERNAL",
      body?.error?.message ?? res.statusText,
    )
  }

  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>)
}

async function refreshTokenOnce(): Promise<void> {
  if (isRefreshing) {
    return new Promise<void>(resolve => refreshQueue.push(resolve))
  }
  isRefreshing = true
  try {
    const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
    if (!res.ok) {
      useAuthStore.getState().clear()
      if (typeof window !== "undefined") {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`
      }
      throw new ApiError(res.status, "UNAUTHORIZED", "refresh failed")
    }
    const { accessToken } = (await res.json()) as { accessToken: string }
    useAuthStore.getState().setAccess(accessToken)
  } finally {
    isRefreshing = false
    refreshQueue.forEach(r => r())
    refreshQueue = []
  }
}
