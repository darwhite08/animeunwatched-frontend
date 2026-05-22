import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

type Club = {
  id: string
  slug: string
  name: string
  description: string | null
  ownerId: string
  reputation: number
  _count: { members: number; threads: number }
}

export const clubsKey = ["clubs"] as const
export const clubKey  = (slug: string) => ["club", slug] as const

export function useClubs(page = 1, q?: string) {
  const query = q?.trim() ?? ""
  return useQuery({
    queryKey: [...clubsKey, page, query],
    queryFn:  () => api<Paginated<Club>>(`/clubs?page=${page}${query ? `&q=${encodeURIComponent(query)}` : ""}`),
    staleTime: query ? 30_000 : 60_000,
  })
}

export function useSearchClubs(q: string) {
  const query = q.trim()
  return useQuery({
    queryKey: [...clubsKey, "search", query],
    queryFn:  () => api<Paginated<Club>>(`/clubs?limit=8&q=${encodeURIComponent(query)}`),
    enabled:  query.length >= 1,
    staleTime: 30_000,
  })
}

export function useClub(slug: string) {
  return useQuery({
    queryKey: clubKey(slug),
    queryFn:  () => api<{ club: Club }>(`/clubs/${slug}`),
    enabled:  !!slug,
  })
}

export function useJoinClub(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ join }: { join: boolean }) =>
      api<void>(`/clubs/${slug}/${join ? "join" : "membership"}`, {
        method: join ? "POST" : "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKey(slug) }),
  })
}

export function useCreateClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; slug: string; description?: string }) =>
      api<{ club: Club }>("/clubs", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubsKey }),
  })
}

type ClubMember = {
  userId: string
  clubId: string
  role: "USER" | "MOD" | "ADMIN"
  joinedAt: string
  user: { id: string; username: string; displayName: string; avatarUrl: string | null; reputation: number }
}

export function useClubMembers(slug: string, page = 1) {
  return useQuery({
    queryKey: ["club-members", slug, page],
    queryFn: () => api<{ data: ClubMember[]; meta: { total: number } }>(`/clubs/${slug}/members?page=${page}&limit=12`),
    enabled: !!slug,
    staleTime: 60_000,
  })
}
