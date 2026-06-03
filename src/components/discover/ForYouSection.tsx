"use client"

/**
 * "For You" anime recommendations — personalised carousel.
 *
 * Backed by GET /api/v1/anime/for-you — see anime.service.getForYou.
 * Builds the viewer's taste profile from their watchlist (genre / studio
 * affinities + preferred era), scores candidates not in their list,
 * caps 2 per studio for variety. Cold-start (empty list) → globally
 * top-rated as a fallback.
 *
 * Renders nothing when the viewer isn't authenticated (no taste signal).
 */

import Link from "next/link"
import Image from "next/image"
import { Sparkles, ArrowRight, Star } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useForYouAnime } from "@/hooks/usePosts"

export function ForYouSection({ limit = 12 }: { limit?: number }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const { data, isLoading } = useForYouAnime(limit, isAuthenticated)

  if (!isAuthenticated) return null

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-foreground">
            <Sparkles size={18} className="text-accent-bright" />
            For you<span style={{ color: "var(--app-accent)" }}>.</span>
          </h2>
          <p className="text-xs text-subtle mt-1">
            Picked from your taste profile — genres + studios + era you actually watch.
          </p>
        </div>
        <Link
          href="/bestanimelist"
          className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-accent-bright/80 hover:text-accent-bright transition-colors"
        >
          Browse all <ArrowRight size={11} />
        </Link>
      </header>

      {/* Mobile: 2 cols × ~165px posters fit a 375px viewport with room
          for gaps; gap tightens to 2 on the smallest screens. Each
          breakpoint adds one column up to 6 on desktop. */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-surface-2 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && (data?.data ?? []).length === 0 && (
        <div className="p-5 sm:p-6 rounded-2xl border border-border bg-surface text-sm sm:text-xs text-muted leading-relaxed">
          Add a few anime to your list to seed personalised recommendations.{" "}
          <Link href="/bestanimelist" className="text-accent-bright hover:underline whitespace-nowrap">
            Browse the catalog →
          </Link>
        </div>
      )}

      {!isLoading && (data?.data ?? []).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {(data?.data ?? []).map((a) => (
            <Link
              key={a.malId}
              href={`/anime/${a.malId}`}
              className="group relative aspect-[2/3] rounded-xl overflow-hidden border border-border bg-surface-2 active:scale-[0.98] hover:border-accent/40 transition-all touch-manipulation"
            >
              {a.imageUrl ? (
                <Image
                  src={a.imageUrl}
                  alt={a.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-subtle px-2 text-center">
                  {a.title}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 sm:p-2.5">
                <div className="flex items-center gap-1 text-[10px] sm:text-[9px] font-black text-accent-bright">
                  <Star size={10} fill="currentColor" className="sm:w-[9px] sm:h-[9px]" />
                  {(a.score ?? 0).toFixed(1)}
                </div>
                <div className="text-[11px] sm:text-[11px] font-bold text-foreground line-clamp-2 mt-0.5">
                  {a.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
