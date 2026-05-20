"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Flame, ChevronRight, Star, TrendingUp, ListPlus, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Anime } from "@/lib/data/anime"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"

const mapDTO = (a: AnimeDTO, i: number): Anime => ({
  id: String(a.malId),
  title: a.title,
  titleJapanese: a.titleJapanese ?? "",
  rating: a.score ?? 0,
  year: a.year ?? 0,
  episodes: a.episodes,
  type: (["TV", "Movie", "OVA"] as const).includes(a.type as any) ? a.type as any : "TV",
  status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished",
  studio: a.studios[0] ?? "Unknown",
  genres: a.genres,
  synopsis: a.synopsis ?? "",
  image: a.imageUrl ?? "",
  tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")),
  category: "all",
  rank: i + 1,
})

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ── horizontal scroll section ── */
interface SectionProps {
  title: string
  icon: React.ReactNode
  accent: string
  items: Anime[]
  onSelect: (a: Anime) => void
  viewAllHref?: string
}

function HorizontalSection({ title, icon, accent, items, onSelect, viewAllHref = "/bestanimelist" }: SectionProps) {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5 px-6">
        <div className="flex items-center gap-3">
          <span className={accent}>{icon}</span>
          <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">{title}</h2>
        </div>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
        >
          View All <ChevronRight size={13} />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="overflow-x-auto scrollbar-none px-6">
        <div className="flex gap-4 md:grid md:grid-cols-6 md:gap-5 min-w-max md:min-w-0">
          {items.map((anime, i) => (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(anime)}
              className="group relative cursor-pointer shrink-0 w-36 md:w-auto"
            >
              {/* Rank number */}
              <div className="absolute -top-3 -left-1 z-10 text-3xl font-black italic text-white/5 select-none">
                {i + 1}
              </div>

              {/* Card */}
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 group-hover:border-white/15 transition-colors bg-[#0a0a0a]">
                <Image
                  src={anime.image}
                  alt={anime.title}
                  fill
                  className="object-cover brightness-75 group-hover:brightness-50 group-hover:scale-105 transition-all duration-500"
                  sizes="(max-width: 768px) 144px, 20vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={9} fill="#f59e0b" className="text-amber-400" />
                    <span className="text-[9px] font-black text-amber-400">{anime.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase italic text-white leading-tight line-clamp-2">
                    {anime.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── page ── */
export default function PopularAnimePage() {
  const [selected, setSelected] = useState<Anime | null>(null)

  const { data: browseData, isLoading } = useBrowseAnime({ limit: 24 })
  const animeList = useMemo(() => (browseData?.data ?? []).map(mapDTO), [browseData])

  // "Most Watched" — top 6 by rating (mock as watch count proxy)
  const mostWatched = useMemo(
    () => [...animeList].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [animeList],
  )

  // "Most Added to Lists" — random 6
  const mostAdded = useMemo(() => shuffle(animeList).slice(0, 6), [animeList])

  // "Most Reviewed" — top 6 by rating (second ranking set, different order)
  const mostReviewed = useMemo(
    () => [...animeList].sort((a, b) => b.rating - a.rating || a.rank - b.rank).slice(6, 12),
    [animeList],
  )

  if (isLoading) return null

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <Flame size={16} className="text-amber-400" />
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60">
            Community Pulse
          </p>
        </div>
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none mb-2">
          Trending in the Archive<span className="text-amber-500">.</span>
        </h1>
        <p className="text-white/35 text-sm">What the community is watching, adding, and reviewing right now</p>
      </div>

      {/* Sections */}
      <div className="max-w-7xl mx-auto space-y-16">
        <HorizontalSection
          title="Most Watched This Week"
          icon={<TrendingUp size={18} />}
          accent="text-amber-400"
          items={mostWatched}
          onSelect={setSelected}
          viewAllHref="/bestanimelist"
        />

        <HorizontalSection
          title="Most Added to Lists"
          icon={<ListPlus size={18} />}
          accent="text-amber-400"
          items={mostAdded}
          onSelect={setSelected}
          viewAllHref="/bestanimelist"
        />

        <HorizontalSection
          title="Most Reviewed"
          icon={<MessageSquare size={18} />}
          accent="text-violet-400"
          items={mostReviewed}
          onSelect={setSelected}
          viewAllHref="/reviews"
        />
      </div>

      <AnimeModal isOpen={selected !== null} onClose={() => setSelected(null)} anime={selected} />
    </div>
  )
}
