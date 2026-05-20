"use client"

import { useAuthStore } from "@/stores/auth.store"

/**
 * Returns a `/user/[slug]/[path]` URL for the currently authenticated user.
 * Falls back to /login if the user is not authenticated or has no slug yet.
 *
 * Usage:
 *   const dashPath = useUserPath("dashboard")   // "/user/hemant-sharma/dashboard"
 *   const watchPath = useUserPath("watchlist")   // "/user/hemant-sharma/watchlist"
 *   router.push(dashPath)
 */
export function useUserPath(path: string): string {
  const slug = useAuthStore(s => s.user?.slug)
  if (!slug) return "/login"
  const clean = path.startsWith("/") ? path.slice(1) : path
  return `/user/${slug}/${clean}`
}

/**
 * Pure function version — use when slug is already known (e.g. in server contexts).
 */
export function userPath(slug: string, path: string): string {
  const clean = path.startsWith("/") ? path.slice(1) : path
  return `/user/${slug}/${clean}`
}
