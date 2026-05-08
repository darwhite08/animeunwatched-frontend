import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"
import type { WatchStatus } from "@/lib/api/types"

export const listKey  = (username: string, status?: WatchStatus) =>
  ["list", username, status] as const

export function useUserList(username: string, status?: WatchStatus) {
  return useQuery({
    queryKey: listKey(username, status),
    queryFn:  () => ep.getList(username, status),
    enabled:  !!username,
  })
}

export function useUpsertEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ animeId, ...body }: { animeId: string } & Parameters<typeof ep.upsertListEntry>[1]) =>
      ep.upsertListEntry(animeId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list"] })
    },
  })
}

export function useRemoveEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (animeId: string) => ep.removeListEntry(animeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list"] })
    },
  })
}
