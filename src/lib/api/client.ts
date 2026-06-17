"use client"

import { useAuthStore } from "@/stores/auth.store"

// When the browser is on localhost, talk directly to the backend.
// When on any other device (phone, tablet), use the Next.js proxy at the same origin
// so only port 3000 needs to be reachable — no direct port 4000 access required.
function getApiBase(): string {
  if (typeof window === "undefined") {
    // Server-side: use the configured backend URL directly
    return process.env.API_BASE ?? "http://localhost:4000"
  }
  const host = window.location.hostname
  if (host === "localhost" || host === "127.0.0.1") {
    // Desktop/localhost: direct backend connection
    return process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000"
  }
  // Phone/tablet on LAN: use relative URL so requests go through the Next.js proxy
  // next.config.ts rewrites /api/v1/* → backend, so only port 3000 is needed
  return ""
}
const BASE = getApiBase()

export type ApiIssue = { path: (string | number)[]; message: string }

export class ApiError extends Error {
  name = "ApiError" as const
  constructor(
    public status: number,
    public code: string,
    message: string,
    public issues?: ApiIssue[],
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
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

  // Only try to refresh + (on failure) bounce to login when the request was made
  // WITH a token — i.e. a real session that may have expired. Guests browsing
  // public pages hit auth-only endpoints and get 401s; those must surface as a
  // plain error (handled per-page / by the sign-in wall), never a login redirect.
  if (res.status === 401 && !skipRefresh && token) {
    await refreshTokenOnce()
    return api<T>(path, { ...opts, skipRefresh: true })
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    // User-friendly rate limit messages (post-launch bot/abuse protection)
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After")
      const msg = retryAfter
        ? `Too many requests. Please wait ${retryAfter} seconds and try again.`
        : body?.error?.message ?? "Too many requests. Please slow down."
      throw new ApiError(429, "RATE_LIMITED", msg)
    }
    throw new ApiError(
      res.status,
      body?.error?.code ?? "INTERNAL",
      body?.error?.message ?? res.statusText,
      body?.error?.issues,
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
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
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
