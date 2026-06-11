import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

export type ReactionSummary = { emoji: string; count: number; reactedByMe: boolean }

// The "like" affordance is a single heart reaction on top of the generic
// reaction system the backend exposes for threads + replies.
export const LIKE_EMOJI = "❤️"

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
  author: { id: string; username: string; displayName: string; avatarUrl: string | null; verifiedKind?: "USER" | "CREATOR" | "STUDIO" | null }
  _count?: { replies: number }
  club?: { slug: string; name: string } | null
  anime?: { malId: number; title: string; titleEnglish: string | null } | null
  reactions?: ReactionSummary[]
}

type Reply = {
  id: string
  threadId: string
  authorId: string
  parentId: string | null
  content: string
  createdAt: string
  author: { id: string; username: string; displayName: string; avatarUrl: string | null; verifiedKind?: "USER" | "CREATOR" | "STUDIO" | null }
  reactions?: ReactionSummary[]
}

/** Toggle one emoji in a reaction summary list (optimistic). */
function toggleReaction(reactions: ReactionSummary[] = [], emoji: string): ReactionSummary[] {
  const idx = reactions.findIndex(r => r.emoji === emoji)
  if (idx === -1) return [...reactions, { emoji, count: 1, reactedByMe: true }]
  const cur = reactions[idx]
  const next: ReactionSummary = {
    emoji,
    count: cur.reactedByMe ? cur.count - 1 : cur.count + 1,
    reactedByMe: !cur.reactedByMe,
  }
  const out = [...reactions]
  if (next.count <= 0) out.splice(idx, 1)
  else out[idx] = next
  return out
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: repliesKey(threadId) })
      qc.invalidateQueries({ queryKey: threadKey(threadId) }) // refresh the reply count
    },
  })
}

/** Like (heart-react) the thread itself. Optimistic + reconciled on settle. */
export function useReactThread(threadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (emoji: string = LIKE_EMOJI) =>
      api<{ reactions: ReactionSummary[] }>(`/threads/${threadId}/reaction`, {
        method: "PUT",
        body: JSON.stringify({ emoji }),
      }),
    onMutate: async (emoji = LIKE_EMOJI) => {
      await qc.cancelQueries({ queryKey: threadKey(threadId) })
      const prev = qc.getQueryData<{ thread: Thread }>(threadKey(threadId))
      if (prev) {
        qc.setQueryData<{ thread: Thread }>(threadKey(threadId), {
          ...prev,
          thread: { ...prev.thread, reactions: toggleReaction(prev.thread.reactions, emoji) },
        })
      }
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(threadKey(threadId), ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: threadKey(threadId) }),
  })
}

/** Like (heart-react) a single reply within a thread. Optimistic. */
export function useReactReply(threadId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ replyId, emoji = LIKE_EMOJI }: { replyId: string; emoji?: string }) =>
      api<{ reactions: ReactionSummary[] }>(`/threads/replies/${replyId}/reaction`, {
        method: "PUT",
        body: JSON.stringify({ emoji }),
      }),
    onMutate: async ({ replyId, emoji = LIKE_EMOJI }) => {
      await qc.cancelQueries({ queryKey: repliesKey(threadId) })
      const prev = qc.getQueryData<Paginated<Reply>>(repliesKey(threadId))
      if (prev) {
        qc.setQueryData<Paginated<Reply>>(repliesKey(threadId), {
          ...prev,
          data: prev.data.map(r =>
            r.id === replyId ? { ...r, reactions: toggleReaction(r.reactions, emoji) } : r
          ),
        })
      }
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(repliesKey(threadId), ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: repliesKey(threadId) }),
  })
}

export function useClubThreads(clubSlug: string, page = 1) {
  return useQuery({
    queryKey: ["club-threads", clubSlug, page],
    queryFn:  () => api<Paginated<Thread>>(`/clubs/${clubSlug}/threads?page=${page}&limit=20`),
    enabled:  !!clubSlug,
  })
}

export function useCreateClubThread(clubSlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { title: string; content: string }) =>
      api<{ thread: Thread }>(`/clubs/${clubSlug}/threads`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["club-threads", clubSlug] }),
  })
}

export function useCreateAnimeThread(malId: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { title: string; content: string }) =>
      api<{ thread: Thread }>(`/anime/${malId}/threads`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["anime-threads", String(malId)] }),
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (postId: string) =>
      api<void>(`/posts/${postId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts/feed"] })
      qc.invalidateQueries({ queryKey: ["posts/discover"] })
    },
  })
}
