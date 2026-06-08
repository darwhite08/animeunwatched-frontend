import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

type Club = {
  id: string
  slug: string
  name: string
  description: string | null
  category: string | null
  ownerId: string
  reputation: number
  createdAt?: string
  bannerUrl?: string | null
  avatarUrl?: string | null
  rules?: string | null
  welcomeMessage?: string | null
  isMember?: boolean
  myRole?: "USER" | "MOD" | "ADMIN" | null
  needsOnboarding?: boolean
  owner?: { id: string; username: string; displayName: string; avatarUrl: string | null }
  _count: { members: number; threads: number }
}

export const clubsKey = ["clubs"] as const
export const clubKey  = (slug: string) => ["club", slug] as const

export function useClubs(page = 1, q?: string, category?: string) {
  const query = q?.trim() ?? ""
  const cat = category?.trim() ?? ""
  return useQuery({
    queryKey: [...clubsKey, page, query, cat],
    queryFn:  () => api<Paginated<Club>>(`/clubs?page=${page}${query ? `&q=${encodeURIComponent(query)}` : ""}${cat ? `&category=${encodeURIComponent(cat)}` : ""}`),
    staleTime: query || cat ? 30_000 : 60_000,
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
    mutationFn: (body: { name: string; slug: string; description?: string; category?: string }) =>
      api<{ club: Club }>("/clubs", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubsKey }),
  })
}

export function useUpdateClub(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name?: string; description?: string; category?: string; rules?: string; welcomeMessage?: string; bannerUrl?: string | null; avatarUrl?: string | null }) =>
      api<{ club: Club }>(`/clubs/${slug}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKey(slug) }),
  })
}

export function useLeaveClub(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api<void>(`/clubs/${slug}/membership`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: clubKey(slug) }); qc.invalidateQueries({ queryKey: clubsKey }) },
  })
}

export function useSetClubRole(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "USER" | "MOD" | "ADMIN" }) =>
      api(`/clubs/${slug}/members/${userId}`, { method: "PATCH", body: JSON.stringify({ role }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["club-members", slug] }),
  })
}

// ── Clubs 2.0 ────────────────────────────────────────────────────────────────
export type ClubEvent = {
  id: string; clubId: string; title: string; description: string | null
  kind: "WATCH_PARTY" | "AMA" | "GAME_NIGHT" | "GENERAL"
  animeMalId: number | null; episodeNumber: number | null
  startsAt: string; endsAt: string | null; location: string | null
  creator: { id: string; username: string; displayName: string; avatarUrl: string | null }
  rsvpCounts: { GOING: number; MAYBE: number; NOT_GOING: number }
  myRsvp: "GOING" | "MAYBE" | "NOT_GOING" | null
}

export function useClubEvents(slug: string, filter: "upcoming" | "past" = "upcoming") {
  return useQuery({
    queryKey: ["club-events", slug, filter],
    queryFn: () => api<{ events: ClubEvent[] }>(`/clubs/${slug}/events?filter=${filter}`).then((r) => r.events),
    enabled: !!slug, staleTime: 30_000,
  })
}
export function useCreateClubEvent(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api<ClubEvent>(`/clubs/${slug}/events`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["club-events", slug] }),
  })
}
export function useRsvpEvent(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: "GOING" | "MAYBE" | "NOT_GOING" }) =>
      api(`/events/${eventId}/rsvp`, { method: "PUT", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["club-events", slug] }),
  })
}
export function useDeleteEvent(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => api(`/events/${eventId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["club-events", slug] }),
  })
}
export function useClubLeaderboard(slug: string, period: "week" | "all" = "all") {
  return useQuery({
    queryKey: ["club-leaderboard", slug, period],
    queryFn: () => api<{ leaderboard: { rank: number; xp: number; role: string; user: { id: string; username: string; displayName: string; avatarUrl: string | null } }[] }>(`/clubs/${slug}/leaderboard?period=${period}`).then((r) => r.leaderboard),
    enabled: !!slug, staleTime: 30_000,
  })
}
export function useOnboardClub(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api(`/clubs/${slug}/onboard`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: clubKey(slug) }),
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
