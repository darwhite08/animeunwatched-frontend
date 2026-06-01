"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Star, ChevronLeft, ChevronRight, Trophy, Medal, Award } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroCard({ anime, rank }: { anime: Anime; rank: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden rounded-3xl border border-accent/20 bg-zinc-900/60"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover opacity-20 scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/80 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 p-8 md:p-12">
        {/* Cover */}
        <div className="relative h-56 w-40 shrink-0 rounded-2xl overflow-hidden border border-border shadow-2xl">
          <Image src={anime.image} alt={anime.title} fill className="object-cover" sizes="160px" />
          {/* #1 badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-accent text-black text-[10px] font-black uppercase tracking-wider shadow-lg">
            <Trophy size={10} /> #{rank}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4 flex-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-bright mb-2">
              Editorial Pick — Best of the Year
            </p>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground leading-none">
              {anime.title}
            </h2>
            <p className="text-subtle text-sm mt-1 font-bold">{anime.titleJapanese}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Star size={16} className="text-accent-bright fill-amber-400" />
              <span className="text-accent-bright font-black text-lg">{anime.rating}</span>
              <span className="text-subtle text-sm">/10</span>
            </div>
            <span className="text-subtle">·</span>
            <span className="text-muted text-sm font-bold">{anime.studio}</span>
            <span className="text-subtle">·</span>
            <span className="text-muted text-sm font-bold">{anime.episodes ?? "?"} eps</span>
          </div>

          <p className="text-muted text-sm leading-relaxed max-w-xl">{anime.synopsis}</p>

          <div className="flex flex-wrap gap-2">
            {anime.genres.map((g) => (
              <span key={g} className="px-3 py-1 rounded-full bg-surface border border-border text-[10px] font-bold text-muted uppercase tracking-widest">
                {g}
              </span>
            ))}
          </div>

          <Link
            href={`/anime/${anime.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent hover:bg-accent-bright text-black text-[11px] font-black uppercase tracking-widest transition-all"
          >
            View Anime <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

const MEDAL_ICONS = [
  <Medal key="2" size={14} className="text-slate-300" />,
  <Medal key="3" size={14} className="text-accent" />,
  <Award key="4" size={14} className="text-accent-bright" />,
  <Award key="5" size={14} className="text-accent-bright" />,
]

function RankedRow({ anime, rank, index }: { anime: Anime; rank: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex items-center gap-5 p-4 rounded-2xl bg-surface border border-border hover:border-border hover:bg-white/[0.04] transition-all group"
    >
      {/* Rank badge */}
      <div className="flex items-center justify-center w-8 h-8 shrink-0">
        {MEDAL_ICONS[index] ?? <span className="text-subtle font-black text-sm">#{rank}</span>}
      </div>

      {/* Cover */}
      <div className="relative h-14 w-10 shrink-0 rounded-lg overflow-hidden">
        <Image src={anime.image} alt={anime.title} fill className="object-cover" sizes="40px" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black uppercase italic tracking-tight text-foreground truncate group-hover:text-accent-bright transition-colors">
          {anime.title}
        </p>
        <p className="text-[10px] text-subtle font-bold mt-0.5">{anime.studio}</p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 shrink-0">
        <Star size={12} className="text-accent-bright fill-amber-400" />
        <span className="text-accent-bright font-black text-sm">{anime.rating}</span>
      </div>

      <Link href={`/anime/${anime.id}`} className="shrink-0 text-subtle hover:text-foreground transition-colors">
        <ChevronRight size={16} />
      </Link>
    </motion.div>
  )
}

function AnimeGridCard({ anime, index }: { anime: Anime; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-2xl overflow-hidden border border-border hover:border-border bg-zinc-900/40 transition-all"
    >
      <div className="relative h-40 w-full">
        <Image src={anime.image} alt={anime.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 25vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-xs font-black uppercase italic text-foreground leading-tight truncate">{anime.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={9} className="text-accent-bright fill-amber-400" />
            <span className="text-accent-bright font-black text-[10px]">{anime.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BestOfYearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearStr } = use(params)
  const year = Number(yearStr)
  const { data: browseData, isLoading } = useBrowseAnime({ year, limit: 30 })
  const animeList = (browseData?.data ?? []).map(mapDTO).sort((a, b) => b.rating - a.rating)
  const hasData = animeList.length > 0
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-subtle text-sm">Loading…</div>

  const hero = animeList[0]
  const medalists = animeList.slice(1, 5)
  const rest = animeList.slice(5)

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* ── Cinematic header ── */}
      <div className="relative border-b border-border py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent" />
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
            className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none text-foreground"
          >
            Best of<span style={{color:"var(--app-accent)"}}>.</span>
            <br />
            <span className="text-subtle">{year}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-muted text-sm max-w-xl leading-relaxed"
          >
            Our editorial ranking of the finest anime to air in {year}, ordered by community rating and critical acclaim.
            {hasData
              ? ` ${animeList.length} title${animeList.length !== 1 ? "s" : ""} made the archive.`
              : " No entries found for this year."}
          </motion.p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 pt-12 space-y-12">

        {!hasData ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center border border-dashed border-border rounded-[3rem] space-y-6"
          >
            <p className="text-subtle font-black uppercase tracking-widest text-sm">
              No anime from {year} in our archive.
            </p>
            <p className="text-subtle text-xs">
              Try{" "}
              <Link href={`/best/${year - 1}`} className="text-accent-bright hover:text-accent-bright underline transition-colors">
                {year - 1}
              </Link>{" "}
              instead.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Hero — #1 */}
            <HeroCard anime={hero} rank={1} />

            {/* Ranked #2–#5 */}
            {medalists.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-subtle">
                  Runners Up
                </h2>
                <div className="space-y-3">
                  {medalists.map((anime, i) => (
                    <RankedRow key={anime.id} anime={anime} rank={i + 2} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Grid for the rest */}
            {rest.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-subtle">
                  Also from {year}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {rest.map((anime, i) => (
                    <AnimeGridCard key={anime.id} anime={anime} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Year navigation ── */}
        <div className="flex items-center justify-between pt-8 border-t border-border">
          <Link
            href={`/best/${year - 1}`}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-surface text-muted hover:text-foreground hover:border-border text-[11px] font-black uppercase tracking-widest transition-all"
          >
            <ChevronLeft size={14} /> Best of {year - 1}
          </Link>
          <Link
            href="/bestanimelist"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-bright hover:text-accent-bright transition-colors"
          >
            All Years
          </Link>
          <Link
            href={`/best/${year + 1}`}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-surface text-muted hover:text-foreground hover:border-border text-[11px] font-black uppercase tracking-widest transition-all"
          >
            Best of {year + 1} <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
