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

export function useCreatorContent() {
  const isAuth = useAuthStore(s => s.isAuthenticated)
  return useQuery({
    queryKey: ["creator/content"],
    queryFn: () => api<{ data: ContentItem[] }>("/creator/content"),
    enabled: isAuth,
    staleTime: 60_000,
  })
}
