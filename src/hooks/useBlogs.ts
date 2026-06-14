import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated, BlogStatus } from "@/lib/api/types"

export type Blog = {
  id: string; slug: string; authorId: string; title: string; body: string
  status: BlogStatus; publishedAt: string | null; createdAt: string; updatedAt: string
  author: { id: string; username: string; displayName: string; avatarUrl: string | null; verifiedKind?: "USER" | "CREATOR" | "STUDIO" | null }
  category?: string | null; hasSpoilers?: boolean; animeMalId?: number | null; animeTitle?: string | null
  coverImage?: string | null
  viewCount?: number
  likeCount?: number
  likedByMe?: boolean
}

export const blogsKey  = ["blogs"]               as const
export const blogKey   = (slug: string) => ["blog", slug] as const

export type BlogSort = "trending" | "top" | "latest"

export function useBlogs(page = 1, sort: BlogSort = "trending") {
  return useQuery({
    queryKey: [...blogsKey, page, sort],
    queryFn:  () => api<Paginated<Blog>>(`/blogs?page=${page}&sort=${sort}`),
  })
}

export function useBlog(slug: string, initialBlog?: Blog) {
  return useQuery({
    queryKey: blogKey(slug),
    queryFn:  () => api<{ blog: Blog }>(`/blogs/${slug}`),
    enabled:  !!slug,
    // Seeded from the server component so the article body is in the SSR HTML
    // (crawlable / link-previewable) and there's no client-fetch flash.
    initialData: initialBlog ? { blog: initialBlog } : undefined,
  })
}

export function useCreateBlog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { title: string; body: string; status?: BlogStatus }) =>
      api<{ blog: Blog }>("/blogs", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: blogsKey }),
  })
}

export function useUpdateBlog(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { title?: string; body?: string; status?: BlogStatus }) =>
      api<{ blog: Blog }>(`/blogs/${slug}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogsKey })
      qc.invalidateQueries({ queryKey: blogKey(slug) })
    },
  })
}

export function useDeleteBlog(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api<void>(`/blogs/${slug}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogsKey })
      qc.removeQueries({ queryKey: blogKey(slug) })
    },
  })
}
