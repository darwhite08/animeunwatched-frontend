import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"

export const feedKey     = ["posts/feed"]    as const
export const discoverKey = ["posts/discover"] as const
export const postKey     = (id: string)   => ["post", id] as const
export const commentsKey = (id: string)   => ["post/comments", id] as const

export function useFeed() {
  return useInfiniteQuery({
    queryKey: feedKey,
    queryFn:  ({ pageParam }) => ep.getFeed(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.nextCursor ?? undefined,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: postKey(postId) }),
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
    mutationFn: (content: string) => ep.createComment(postId, content),
    onSuccess:  () => qc.invalidateQueries({ queryKey: commentsKey(postId) }),
  })
}
