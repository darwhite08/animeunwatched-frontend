import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"
import { useAuthStore } from "@/stores/auth.store"

export const feedKey     = ["posts/feed"]    as const
export const discoverKey = ["posts/discover"] as const
export const trendingKey = (limit: number) => ["posts/trending", limit] as const
export const postKey     = (id: string)   => ["post", id] as const
export const commentsKey = (id: string)   => ["post/comments", id] as const

export function useFeed() {
  // The "Following" feed is auth-only — don't fire it for guests.
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return useInfiniteQuery({
    queryKey: feedKey,
    queryFn:  ({ pageParam }) => ep.getFeed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.nextCursor ?? undefined,
    enabled: isAuthenticated,
  })
}

export function useDiscover() {
  return useInfiniteQuery({
    queryKey: discoverKey,
    queryFn:  ({ pageParam }) => ep.getDiscover(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.nextCursor ?? undefined,
  })
}

/** Algorithm-ranked trending feed.
 *  Backend: posts.service.getTrending — HN-style score, follow boost,
 *  diversity cap, 60s cache. Not cursor-paginated; returns top `limit`.
 *  Auto-refresh every 60s to match backend cache TTL. */
export function useTrending(limit = 20) {
  return useQuery({
    queryKey:        trendingKey(limit),
    queryFn:         () => ep.getTrending(limit),
    staleTime:       60_000,
    refetchInterval: 60_000,
  })
}

/** "Not interested" — hide a post from the viewer's trending feed.
 *  Invalidates trending so the hidden post disappears immediately,
 *  not on the next 60s refresh. */
export function useHidePost(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => ep.hidePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts/trending"] })
    },
  })
}

export function useUnhidePost(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => ep.unhidePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts/trending"] })
    },
  })
}

/** Personalised anime "For You". Auto-refresh every 15 min to match
 *  backend cache TTL. Disabled when the user isn't authenticated. */
export function useForYouAnime(limit = 20, enabled = true) {
  return useQuery({
    queryKey:        ["anime/for-you", limit],
    queryFn:         () => ep.getForYouAnime(limit),
    enabled,
    staleTime:       15 * 60_000,
    refetchInterval: 15 * 60_000,
  })
}

/** Who-to-follow. 10-min refresh to match backend cache TTL. */
export function useWhoToFollow(limit = 5, enabled = true) {
  return useQuery({
    queryKey:        ["users/suggestions", limit],
    queryFn:         () => ep.getWhoToFollow(limit),
    enabled,
    staleTime:       10 * 60_000,
    refetchInterval: 10 * 60_000,
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: postKey(id),
    queryFn:  () => ep.getPost(id),
    enabled:  !!id,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ep.createPost,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: feedKey })
      qc.invalidateQueries({ queryKey: discoverKey })
      void import("@/lib/analytics/ga").then(({ track }) => track("post_created"))
    },
  })
}

export function useDeletePost(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => ep.deletePost(postId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: feedKey })
      qc.invalidateQueries({ queryKey: discoverKey })
    },
  })
}

export function useLikePost(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ like }: { like: boolean }) =>
      like ? ep.likePost(postId) : ep.unlikePost(postId),
    onSuccess: () => {
      // Invalidate both the single post + any feed queries that include it
      // so the authoritative count from /like trickles everywhere.
      qc.invalidateQueries({ queryKey: postKey(postId) })
      qc.invalidateQueries({ queryKey: feedKey })
      qc.invalidateQueries({ queryKey: discoverKey })
    },
  })
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: commentsKey(postId),
    queryFn:  () => ep.getComments(postId),
    enabled:  !!postId,
  })
}

export function useCreateComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: string | { content: string; parentCommentId?: string }) => {
      const dto = typeof input === "string" ? { content: input } : input
      return ep.createComment(postId, dto.content, dto.parentCommentId)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey(postId) }),
  })
}

/** Like a comment with optimistic counter bump. */
export function useLikeComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => ep.likeComment(commentId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: commentsKey(postId) }),
  })
}

export function useUnlikeComment(postId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => ep.unlikeComment(commentId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: commentsKey(postId) }),
  })
}

export function useCommentReplies(commentId: string | null) {
  return useQuery({
    queryKey: ["comment-replies", commentId],
    queryFn:  () => ep.getCommentReplies(commentId as string),
    enabled:  !!commentId,
  })
}

export function useUserPosts(username: string, page = 1) {
  const { api } = require("@/lib/api/client")
  return useQuery({
    queryKey:  ["user-posts", username, page],
    queryFn:   () => api(`/users/${username}/posts?page=${page}&limit=20`),
    enabled:   !!username,
    staleTime: 60_000,
  })
}
