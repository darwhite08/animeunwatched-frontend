"use client"

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getActivityFeed, likeActivity, unlikeActivity, repostActivity, unrepostActivity,
  createActivity, deleteActivity, type FeedType, type CreateActivityBody,
} from "@/lib/api/endpoints"
import type { Activity, CursorPaginated } from "@/lib/api/types"

const FEED_KEY = (type: FeedType, userId?: string) =>
  userId ? ["activities/feed", type, userId] as const : ["activities/feed", type] as const

/**
 * Infinite cursor-paginated activity feed.
 * `type` selects following / global / profile; pass `userId` for profile.
 */
export function useActivityFeed(type: FeedType = "global", userId?: string) {
  return useInfiniteQuery<CursorPaginated<Activity>>({
    queryKey: FEED_KEY(type, userId),
    queryFn: ({ pageParam }) =>
      getActivityFeed(type, pageParam as string | undefined, userId),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.nextCursor ?? undefined,
    staleTime: 30_000,
  })
}

/* ── Optimistic engagement mutations ────────────────────────────────────── */

/**
 * Walks every cached feed page and applies `mutate` to any activity whose id
 * matches. Returns a snapshot of the previous data so callbacks can restore
 * on error.
 */
function updateAllFeeds(
  qc: ReturnType<typeof useQueryClient>,
  activityId: string,
  mutate: (a: Activity) => Activity,
) {
  const queries = qc.getQueriesData<{ pages: CursorPaginated<Activity>[]; pageParams: unknown[] }>({
    queryKey: ["activities/feed"],
  })
  const snapshot = queries.map(([key, data]) => [key, data] as const)
  for (const [key, data] of queries) {
    if (!data?.pages) continue
    qc.setQueryData(key, {
      ...data,
      pages: data.pages.map(page => ({
        ...page,
        data: page.data.map(a => (a.id === activityId ? mutate(a) : a)),
      })),
    })
  }
  return snapshot
}

function restoreSnapshot(
  qc: ReturnType<typeof useQueryClient>,
  snapshot: ReadonlyArray<readonly [unknown, unknown]>,
) {
  for (const [key, data] of snapshot) qc.setQueryData(key as readonly unknown[], data)
}

export function useLikeActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => likeActivity(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["activities/feed"] })
      const snapshot = updateAllFeeds(qc, id, a =>
        a.isLikedByMe ? a : { ...a, isLikedByMe: true, likeCount: a.likeCount + 1 }
      )
      return { snapshot }
    },
    onError: (_e, _id, ctx) => ctx && restoreSnapshot(qc, ctx.snapshot),
  })
}

export function useUnlikeActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unlikeActivity(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["activities/feed"] })
      const snapshot = updateAllFeeds(qc, id, a =>
        !a.isLikedByMe ? a : { ...a, isLikedByMe: false, likeCount: Math.max(0, a.likeCount - 1) }
      )
      return { snapshot }
    },
    onError: (_e, _id, ctx) => ctx && restoreSnapshot(qc, ctx.snapshot),
  })
}

export function useRepostActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: string }) => repostActivity(id, body),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: ["activities/feed"] })
      const snapshot = updateAllFeeds(qc, id, a =>
        a.isRepostedByMe ? a : { ...a, isRepostedByMe: true, repostCount: a.repostCount + 1 }
      )
      return { snapshot }
    },
    onError: (_e, _vars, ctx) => ctx && restoreSnapshot(qc, ctx.snapshot),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities/feed"] }),
  })
}

export function useUnrepostActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unrepostActivity(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["activities/feed"] })
      const snapshot = updateAllFeeds(qc, id, a =>
        !a.isRepostedByMe ? a : { ...a, isRepostedByMe: false, repostCount: Math.max(0, a.repostCount - 1) }
      )
      return { snapshot }
    },
    onError: (_e, _id, ctx) => ctx && restoreSnapshot(qc, ctx.snapshot),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities/feed"] }),
  })
}

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateActivityBody) => createActivity(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities/feed"] }),
  })
}

export function useDeleteActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities/feed"] }),
  })
}
