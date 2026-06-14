"use client"

import { use, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Play, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"

interface JikanEpisode {
  mal_id: number
  title: string
  title_romanji: string | null
  aired: string | null
  score: number | null
  filler: boolean
  recap: boolean
  duration: number | null
}

interface JikanEpisodesResponse {
  data: JikanEpisode[]
  pagination: { last_visible_page: number; has_next_page: boolean }
}

export default function EpisodesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params)
  const malId    = parseInt(id, 10)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["anime-episodes", id, page],
    queryFn:  () => api<JikanEpisodesResponse>(`/anime/${malId}/episodes?page=${page}`),
    staleTime: 30 * 60_000,
    enabled:   !isNaN(malId),
  })

  const episodes   = data?.data ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.last_visible_page ?? 1

  function formatDate(iso: string | null) {
    if (!iso) return "TBA"
    try { return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) }
    catch { return iso }
  }

  function formatDuration(secs: number | null) {
    if (!secs) return "—"
    const m = Math.floor(secs / 60)
    return `${m} min`
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 pt-6">
      <div className="max-w-4xl mx-auto px-6">
        <Link href={`/anime/${id}`}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-colors mb-8 group">
          <ChevronLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" /> Back to Anime
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Play size={20} className="text-accent-bright" />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">Episodes<span style={{ color: "var(--app-accent)" }}>.</span></h1>
          </div>
          {!isLoading && pagination && (
            <span className="text-xs text-subtle">Page {page} / {totalPages}</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24"><Loader2 size={28} className="animate-spin text-accent-bright" /></div>
        ) : episodes.length === 0 ? (
          <p className="text-center py-24 text-subtle text-sm">No episode data available for this anime.</p>
        ) : (
          <>
            <div className="space-y-2">
              {episodes.map((ep, i) => (
                <motion.div key={ep.mal_id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-surface hover:border-white/20 transition-all group">
                  {/* Episode number */}
                  <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-accent-bright">{ep.mal_id}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground truncate">
                      {ep.title || ep.title_romanji || `Episode ${ep.mal_id}`}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-[9px] text-subtle">
                      <span>{formatDate(ep.aired)}</span>
                      <span>{formatDuration(ep.duration)}</span>
                      {ep.filler && <span className="px-1.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-400">Filler</span>}
                      {ep.recap && <span className="px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400">Recap</span>}
                    </div>
                  </div>

                  {ep.score && (
                    <span className="text-xs font-black text-accent-bright shrink-0">★ {ep.score.toFixed(1)}</span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-xl border border-border text-muted hover:text-foreground hover:border-border transition-all disabled:opacity-30">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-muted font-black">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={!pagination?.has_next_page}
                  className="p-2 rounded-xl border border-border text-muted hover:text-foreground hover:border-border transition-all disabled:opacity-30">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
