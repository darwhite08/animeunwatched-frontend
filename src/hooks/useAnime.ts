import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"
import type { WatchStatus } from "@/lib/api/types"

export const animeKey  = (malId: number)   => ["anime",    malId]   as const
export const browseKey = (params: object)  => ["anime/browse", params] as const
export const searchKey = (q: string)       => ["anime/search", q]  as const
export const seasonKey = (y: number, s: string) => ["anime/season", y, s] as const

export function useAnime(malId: number) {
  return useQuery({
    queryKey: animeKey(malId),
    queryFn:  () => ep.getAnime(malId),
    enabled:  malId > 0,
  })
}

export function useBrowseAnime(params: Parameters<typeof ep.browseAnime>[0]) {
  return useQuery({
    queryKey: browseKey(params),
    queryFn:  () => ep.browseAnime(params),
  })
}

export function useSearchAnimeApi(q: string) {
  return useQuery({
    queryKey: searchKey(q),
    queryFn:  () => ep.searchAnimeApi(q),
    enabled:  q.length >= 2,
  })
}

export function useSeasonal(year: number, season: string) {
  return useQuery({
    queryKey: seasonKey(year, season),
    queryFn:  () => ep.getSeasonal(year, season),
  })
}

export function useUpsertListEntry(malId: number | string) {
  const qc = useQueryClient()
  const numericMalId = typeof malId === "string" ? parseInt(malId, 10) : malId
  return useMutation({
    mutationFn: ({ status, ...rest }: { status: WatchStatus; score?: number; episodesSeen?: number }) =>
      ep.upsertListEntry(String(malId), { status, ...rest }),
    onSuccess: () => qc.invalidateQueries({ queryKey: animeKey(numericMalId) }),
  })
}

export function useRemoveListEntry(malId: number | string) {
  const qc = useQueryClient()
  const numericMalId = typeof malId === "string" ? parseInt(malId, 10) : malId
  return useMutation({
    mutationFn: () => ep.removeListEntry(String(malId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: animeKey(numericMalId) }),
  })
}
