import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

type SearchType = "anime" | "posts" | "users" | "blogs" | "clubs" | "threads"

type SearchSuggestions = {
  anime: Array<{ malId: number; title: string; imageUrl: string | null }>
  users: Array<{ username: string; displayName: string }>
}

export function useSearchResults(q: string, type: SearchType = "anime", page = 1) {
  return useQuery({
    queryKey: ["search", q, type, page],
    queryFn:  () => api<Paginated<unknown>>(`/search?q=${encodeURIComponent(q)}&type=${type}&page=${page}`),
    enabled:  q.trim().length >= 2,
    staleTime: 30_000,
  })
}

export function useSearchSuggestions(q: string) {
  return useQuery({
    queryKey: ["search/suggestions", q],
    queryFn:  () => api<SearchSuggestions>(`/search/suggestions?q=${encodeURIComponent(q)}`),
    enabled:  q.trim().length >= 1,
    staleTime: 15_000,
  })
}
