"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, Trophy, ChevronRight } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

// ─── Years range ──────────────────────────────────────────────────────────────

const YEARS = Array.from({ length: 10 }, (_, i) => 2015 + i) // 2015..2024

// ─── Year card ────────────────────────────────────────────────────────────────

function YearCard({ year, index, allAnime }: { year: number; index: number; allAnime: Anime[] }) {
  const top = allAnime.filter(a => a.year === year).sort((a, b) => b.rating - a.rating)[0] ?? null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/best/${year}`} className="group block h-full">
        <div className="relative h-64 rounded-2xl overflow-hidden border border-border group-hover:border-white/25 transition-all">
          {top ? (
            <>
              <Image
                src={top.image}
                alt={top.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-surface-2" />
          )}

          {/* Year badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm border border-border text-sm font-black text-muted uppercase tracking-widest">
            {year}
          </div>

          {/* #1 badge */}
          {top && (
            <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg bg-accent text-black text-[9px] font-black uppercase tracking-wider">
              <Trophy size={9} /> #1
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {top ? (
              <>
                <p className="text-xs font-black uppercase italic tracking-tight text-foreground leading-tight line-clamp-2 group-hover:text-foreground transition-colors">
                  {top.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-accent-bright fill-accent-bright" />
                    <span className="text-accent-bright font-black text-[10px]">{top.rating}</span>
                  </div>
                  <span className="text-subtle text-[9px]">·</span>
                  <span className="text-subtle text-[9px] font-bold">{top.studio}</span>
                </div>
              </>
            ) : (
              <p className="text-xs text-subtle font-bold italic">No entries yet</p>
            )}
          </div>

          {/* Hover arrow */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/90 text-black text-[10px] font-black uppercase tracking-widest">
              View {year} <ChevronRight size={12} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BestOfPage() {
  const { data: browseData, isLoading } = useBrowseAnime({ limit: 50 })
  const allAnime = (browseData?.data ?? []).map(mapDTO)
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-subtle text-sm">Loading…</div>
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="relative border-b border-border py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/15 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-accent-bright mb-4"
          >
            Kaiveron — Editorial
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none text-foreground"
          >
            Best<span className="text-accent">.</span>
            <br />
            <span className="text-subtle">By Year</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-muted text-sm max-w-xl leading-relaxed"
          >
            A decade of anime ranked. Explore the #1 rated anime for every year from 2015 to 2024,
            curated by the Kaiveron community.
          </motion.p>
        </div>
      </div>

      {/* Year grid */}
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="flex items-center gap-3 mb-8">
          <Trophy size={14} className="text-accent-bright" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-subtle">
            2015 — 2024
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {YEARS.map((year, i) => (
            <YearCard key={year} year={year} index={i} allAnime={allAnime} />
          ))}
        </div>
      </div>
    </div>
  )
}
