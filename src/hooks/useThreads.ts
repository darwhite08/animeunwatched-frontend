import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

type Thread = {
  id: string
  title: string
  content: string
  authorId: string
  clubId: string | null
  animeId: string | null
  isPinned: boolean
  isLocked: boolean
  createdAt: string
  updatedAt: string
  author: { id: string; username: string; displayName: string; avatarUrl: string | null }
  _count?: { replies: number }
}

type Reply = {
  id: string
  threadId: string
  authorId: string
  parentId: string | null
  content: string
  createdAt: string
  author: { id: string; username: string; displayName: string; avatarUrl: string | null }
}

export const threadKey  = (id: string) => ["thread",  id] as const
export const repliesKey = (id: string) => ["replies", id] as const

export function useThread(id: string) {
  return useQuery({
    queryKey: threadKey(id),
    queryFn:  () => api<{ thread: Thread }>(`/threads/${id}`),
    enabled:  !!id,
  })
}

export function useReplies(threadId: string) {
  return useQuery({
    queryKey: repliesKey(threadId),
    queryFn:  () => api<Paginated<Reply>>(`/threads/${threadId}/replies`),
    enabled:  !!threadId,
  })
}

export function useCreateReply(threadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { content: string; parentId?: string }) =>
      api<{ reply: Reply }>(`/threads/${threadId}/replies`, {
        method: "POST",
        body:   JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: repliesKey(threadId) }),
  })
}
