import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import type { Paginated } from "@/lib/api/types"

type Review = {
  id: string; animeId: string; authorId: string
  score: number; body: string; hasSpoilers: boolean
  createdAt: string; updatedAt: string
  author: { id: string; username: string; displayName: string; avatarUrl: string | null }
  _count?: { likes: number }
  liked?: boolean
}

export const reviewsKey = (animeId: string) => ["reviews", animeId] as const

export function useAnimeReviews(animeId: string, sort: "helpful" | "recent" = "recent") {
  return useQuery({
    queryKey: [...reviewsKey(animeId), sort],
    queryFn: () => api<Paginated<Review>>(`/anime/${animeId}/reviews?sort=${sort}`),
    enabled: !!animeId,
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { animeId: string; score: number; body: string; hasSpoilers?: boolean }) =>
      api<{ review: Review }>("/reviews", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: reviewsKey(vars.animeId) })
    },
  })
}

export function useLikeReview(reviewId: string, animeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ like }: { like: boolean }) =>
      api<void>(`/reviews/${reviewId}/like`, { method: like ? "POST" : "DELETE" }),
    // Invalidate only the specific anime's reviews, not all reviews
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewsKey(animeId) }),
  })
}

export function useDeleteReview(reviewId: string, animeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api<void>(`/reviews/${reviewId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewsKey(animeId) }),
  })
}
