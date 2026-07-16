import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"
import type { WatchStatus } from "@/lib/api/types"
import { useAuthStore } from "@/stores/auth.store"

export const listKey  = (username: string, status?: WatchStatus) =>
  ["list", username, status] as const

export function useUserList(username: string, status?: WatchStatus) {
  return useQuery({
    queryKey: listKey(username, status),
    queryFn:  () => ep.getList(username, status),
    enabled:  !!username,
  })
}

/**
 * Set of the signed-in user's list anime ids (both the malId-as-string that
 * browse cards use AND the internal cuid), so any "add to watchlist" surface can
 * render the correct in-list ✓ state from the REAL backend list. React Query
 * dedupes the underlying fetch across every card on the page.
 */
export function useMyListAnimeIds(): Set<string> {
  const username = useAuthStore((s) => s.user?.username)
  const { data } = useUserList(username ?? "")
  return useMemo(() => {
    const ids = new Set<string>()
    for (const e of data?.data ?? []) {
      if (e.anime?.malId != null) ids.add(String(e.anime.malId))
      if (e.animeId) ids.add(String(e.animeId))
    }
    return ids
  }, [data])
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
