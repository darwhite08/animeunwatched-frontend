import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"

export const userKey     = (username: string) => ["user", username]   as const
export const followersKey = (username: string) => ["user/followers", username] as const
export const followingKey = (username: string) => ["user/following", username] as const

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: userKey(username),
    queryFn:  () => ep.getUser(username),
    enabled:  !!username,
  })
}

export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ep.updateMe,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["auth/me"] }),
  })
}

export function useUpdateSlug() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => ep.updateSlug(slug),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["auth/me"] }),
  })
}

export function useFollow(username: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ follow }: { follow: boolean }) =>
      follow ? ep.follow(username) : ep.unfollow(username),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKey(username) }),
  })
}

export function useFollowers(username: string) {
  return useQuery({
    queryKey: followersKey(username),
    queryFn:  () => ep.getFollowers(username),
    enabled:  !!username,
  })
}

export function useFollowing(username: string) {
  return useQuery({
    queryKey: followingKey(username),
    queryFn:  () => ep.getFollowing(username),
    enabled:  !!username,
  })
}
