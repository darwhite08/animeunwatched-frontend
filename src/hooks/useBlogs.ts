import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated, BlogStatus } from "@/lib/api/types"

type Blog = {
  id: string; slug: string; authorId: string; title: string; body: string
  status: BlogStatus; publishedAt: string | null; createdAt: string; updatedAt: string
  author: { id: string; username: string; displayName: string; avatarUrl: string | null }
}

export const blogsKey  = ["blogs"]               as const
export const blogKey   = (slug: string) => ["blog", slug] as const

export function useBlogs(page = 1) {
  return useQuery({
    queryKey: [...blogsKey, page],
    queryFn:  () => api<Paginated<Blog>>(`/blogs?page=${page}`),
  })
}

export function useBlog(slug: string) {
  return useQuery({
    queryKey: blogKey(slug),
    queryFn:  () => api<{ blog: Blog }>(`/blogs/${slug}`),
    enabled:  !!slug,
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
