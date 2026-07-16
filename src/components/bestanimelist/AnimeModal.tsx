"use client"

import { X, Check, Plus } from "lucide-react"
import { Star, Clock, Monitor, ShareNetwork, ArrowUpRight } from "@phosphor-icons/react"
import Image from "next/image"
import Link from "next/link"
import type { Anime } from "@/lib/data/anime"
import { useUpsertEntry, useRemoveEntry, useMyListAnimeIds } from "@/hooks/useLists"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import { Sheet } from "@/components/ui/Sheet"

interface AnimeModalProps {
  isOpen: boolean
  onClose: () => void
  anime: Anime | null
}

export default function AnimeModal({ isOpen, onClose, anime }: AnimeModalProps) {
  const { push } = useToast()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const listIds = useMyListAnimeIds()
  const upsert = useUpsertEntry()
  const removeEntry = useRemoveEntry()
  const inList = anime ? listIds.has(anime.id) : false
  const busy = upsert.isPending || removeEntry.isPending

  const handleToggleList = () => {
    if (!anime || busy) return
    if (!isAuthenticated) {
      push("Sign in to save anime to your watchlist", "info")
      return
    }
    if (inList) {
      removeEntry.mutate(anime.id, {
        onSuccess: () => push(`Removed "${anime.title}" from watchlist`, "info"),
        onError:   () => push("Couldn't update. Try again.", "error"),
      })
    } else {
      upsert.mutate(
        { animeId: anime.id, status: "PLAN_TO_WATCH", episodesSeen: 0 },
        {
          onSuccess: () => push(`Added "${anime.title}" to watchlist!`, "success"),
          onError:   () => push("Couldn't add. Try again.", "error"),
        },
      )
    }
  }

  const handleShare = async () => {
    if (!anime) return
    try {
      await navigator.clipboard.writeText(`${anime.title} — rated ${anime.rating}/10 on Kaiveron`)
      push("Copied to clipboard", "success")
    } catch {
      push("Could not copy", "error")
    }
  }

  return (
    <Sheet open={isOpen && anime !== null} onClose={onClose} ariaLabel={anime?.title} className="sm:max-w-3xl">
      {anime && (
        <div className="relative">
          {/* Cover */}
          <div className="relative h-[240px] sm:h-[300px]">
            <Image
              src={anime.image}
              alt={anime.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 42rem"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)]/30 to-transparent" />

            {/* Rank badge — gold */}
            <div className="absolute top-5 left-5 px-3 py-1.5 backdrop-blur-md rounded-xl text-[10px] font-black uppercase italic"
              style={{
                background: "color-mix(in srgb, var(--app-accent) 15%, transparent)",
                border: "1px solid color-mix(in srgb, var(--app-accent) 35%, transparent)",
                color: "var(--app-accent-bright)",
                boxShadow: "0 2px 12px color-mix(in srgb, var(--app-accent) 15%, transparent)",
              }}>
              #{anime.rank} Neural Ranked
            </div>

            {/* Close — 44px tap target */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-foreground hover:bg-black/60 active:scale-90 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Info */}
          <div className="px-6 pt-5 sm:px-8 sm:pt-6">
            <div className="space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{ background: "color-mix(in srgb, var(--app-accent) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--app-accent) 30%, transparent)" }}>
                  <Star size={12} weight="fill" className="text-accent-bright" />
                  <span className="text-xs font-black text-accent-bright">{anime.rating.toFixed(1)}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  anime.status === "airing"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-surface border-border text-muted"
                }`}>
                  {/* "Airing"/"Completed" reads wrong for films — movies release. */}
                  {anime.type?.toLowerCase() === "movie"
                    ? (anime.status === "airing" ? "Releasing" : "Released")
                    : (anime.status === "airing" ? "Airing" : "Completed")}
                </span>
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-accent/10 border border-accent/20 text-accent-bright">
                  {anime.type}
                </span>
              </div>

              {/* Title */}
              <div>
                {anime.titleJapanese && (
                  <p className="text-[10px] font-black text-subtle uppercase tracking-widest mb-1">
                    {anime.titleJapanese}
                  </p>
                )}
                <h2 className="text-3xl sm:text-4xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                  {anime.title}
                </h2>
              </div>

              {/* Meta row — each item only renders when it has a real value, so
                  we never show a stray "0" (missing year) or an empty studio. */}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[10px] font-black text-muted uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Clock size={11} />
                  {anime.type?.toLowerCase() === "movie"
                    ? "Movie"
                    : anime.episodes
                      ? `${anime.episodes} Episodes`
                      : "Ongoing"}
                </span>
                {anime.studio && (
                  <span className="flex items-center gap-1.5">
                    <Monitor size={11} />
                    {anime.studio}
                  </span>
                )}
                {anime.year ? <span className="text-subtle">{anime.year}</span> : null}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {anime.genres.map(g => (
                  <span key={g} className="px-3 py-1 rounded-full bg-surface border border-border text-[9px] font-black uppercase tracking-wider text-muted">
                    {g}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <p className="text-muted text-sm leading-relaxed font-medium">
                {anime.synopsis}
              </p>
            </div>

            {/* Actions — pinned to the bottom of the scroll area so they're
                always visible no matter how long the synopsis runs. */}
            <div className="sticky bottom-0 z-10 -mx-6 sm:-mx-8 mt-6 flex flex-wrap gap-3 border-t border-border bg-background/95 px-6 sm:px-8 pt-4 pb-5 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <button
                onClick={handleToggleList}
                className={`flex-1 min-w-[140px] min-h-11 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all ${
                  inList
                    ? "bg-emerald-600 text-foreground hover:bg-emerald-700"
                    : ""
                }`}
                style={!inList ? {
                  background: "linear-gradient(135deg, var(--app-accent), #d97706)",
                  color: "var(--app-bg)",
                  boxShadow: "0 4px 20px color-mix(in srgb, var(--app-accent) 35%, transparent)",
                } : undefined}
              >
                {inList ? <><Check size={15} /> In Watchlist</> : <><Plus size={15} /> Add to List</>}
              </button>

              <Link
                href={`/anime/${anime.id}`}
                className="flex min-h-11 items-center gap-2 px-4 py-3.5 rounded-2xl border border-border bg-surface text-muted hover:bg-surface hover:text-foreground active:scale-[0.98] transition-all text-xs font-black uppercase tracking-widest"
              >
                <ArrowUpRight size={14} weight="bold" /> Full Page
              </Link>

              <button
                onClick={handleShare}
                aria-label="Copy to clipboard"
                className="flex h-11 w-11 items-center justify-center bg-surface border border-border rounded-2xl text-muted hover:bg-surface hover:text-foreground active:scale-90 transition-all"
                title="Copy to clipboard"
              >
                <ShareNetwork size={18} weight="duotone" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  )
}
