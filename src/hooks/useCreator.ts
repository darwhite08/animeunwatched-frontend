import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth.store"

export type CreatorStats = {
  publishedBlogs: number
  totalViews: number
  postCount: number
  reputation: number
}

export type ContentItem = {
  id: string
  slug: string
  title: string
  status: string
  publishedAt: string | null
  createdAt: string
  mockViews: number
}

export function useCreatorStats() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  return useQuery({
    queryKey: ["creator/stats"],
    queryFn: () => api<CreatorStats>("/creator/stats"),
    enabled: isAuth,
    staleTime: 60_000,
  })
}

export type CreatorAccess = {
  hasAccess: boolean
  granted?: boolean
  reasons: string[]
  followers: number
  reputation: number
  publishedBlogs: number
}

/**
 * Whether the signed-in user may author creator content (blogs, polls).
 * Mirrors the Creator Studio gate. `isCreator` is false for guests and for
 * regular members who haven't qualified, true once they have access.
 */
export function useCreatorAccess() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  const q = useQuery({
    queryKey: ["creator/access"],
    queryFn: () => api<CreatorAccess>("/creator/access"),
    enabled: isAuth,
    staleTime: 5 * 60_000,
  })
  return {
    ...q,
    isCreator: isAuth && q.data?.hasAccess === true,
    // While loading (or logged out) we treat as non-creator so create UI stays hidden.
    isResolved: !isAuth || q.isSuccess || q.isError,
  }
}

export function useCreatorContent() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  return useQuery({
    queryKey: ["creator/content"],
    queryFn: () => api<{ data: ContentItem[] }>("/creator/content"),
    enabled: isAuth,
    staleTime: 60_000,
  })
}

export type CreatorDailyPoint = {
  day:      string  // YYYY-MM-DD
  posts:    number
  likes:    number
  comments: number
}

export function useCreatorDaily() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  return useQuery({
    queryKey: ["creator/daily"],
    queryFn:  () => api<{ data: CreatorDailyPoint[] }>("/creator/daily"),
    enabled:  isAuth,
    staleTime: 60_000,
  })
}
