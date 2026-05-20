"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Layers } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import AnimeCard from "@/components/bestanimelist/AnimeCard"
import AnimeModal from "@/components/bestanimelist/AnimeModal"
import type { Anime } from "@/lib/data/anime"
import type { AnimeDTO } from "@/lib/api/types"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

/* ── Genre tag chip ── */
function GenreChip({ genre }: { genre: string }) {
  return (
    <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-amber-400">
      {genre}
    </span>
  )
}

/* ── Page ── */
export default function SimilarAnimePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }    = use(params)
  const [selected, setSelected] = useState<Anime | null>(null)
  const { data: browseData, isLoading } = useBrowseAnime({ limit: 10 })
  const allAnime = (browseData?.data ?? []).map(mapDTO)

  const anime = allAnime.find(a => a.id === id)
  if (!isLoading && !anime) notFound()
  if (isLoading || !anime) return <div className="min-h-screen bg-[#020202] flex items-center justify-center text-white/30 text-sm">Loading…</div>

  // Find similar: shared genres, different id, rating >= 7.5, sorted by rating desc
  const similar = allAnime
    .filter(a => {
      if (a.id === id) return false
      if (a.rating < 7.5) return false
      return a.genres.some(g => anime.genres.includes(g))
    })
    .sort((a, b) => b.rating - a.rating)

  const sharedGenresFor = (candidate: Anime) =>
    candidate.genres.filter(g => anime.genres.includes(g))

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25 mb-8">
          <Link href="/bestanimelist" className="hover:text-white/60 transition-colors">
            Anime Archive
          </Link>
          <ChevronRight size={11} className="text-white/15" />
          <Link
            href={`/anime/${anime.id}`}
            className="hover:text-white/60 transition-colors truncate max-w-[200px]"
          >
            {anime.title}
          </Link>
          <ChevronRight size={11} className="text-white/15" />
          <span className="text-amber-400">Similar Anime</span>
        </nav>

        {/* Anime mini-header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/8 mb-10"
        >
          <Link href={`/anime/${anime.id}`} className="relative h-20 w-14 rounded-xl overflow-hidden shrink-0 group">
            <Image
              src={anime.image}
              alt={anime.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="56px"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/anime/${anime.id}`}>
              <h1 className="text-xl font-black uppercase italic tracking-tighter text-white hover:text-amber-300 transition-colors leading-tight truncate">
                {anime.title}
              </h1>
            </Link>
            <p className="text-[10px] text-white/30 mt-0.5 font-mono">{anime.titleJapanese}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {anime.genres.map(g => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-wider text-white/40"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-3">
            Recommendations
          </p>
          <h2 className="text-5xl font-black tracking-tighter uppercase italic text-white leading-none">
            Anime Similar to<br />
            <span className="text-amber-400">{anime.title}</span>
            <span style={{color:"#f59e0b"}}>.</span>
          </h2>
          <p className="text-white/35 text-sm mt-3">
            {similar.length} titles matched · rated ≥ 7.5 · sorted by rating
          </p>
        </motion.div>

        {/* Why similar — genre chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-3 flex-wrap mb-10"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/30">
            <Layers size={13} className="text-amber-400" />
            Matching genres:
          </div>
          {anime.genres.map(g => (
            <GenreChip key={g} genre={g} />
          ))}
        </motion.div>

        {/* Results grid */}
        {similar.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {similar.map((a, i) => {
              const common = sharedGenresFor(a)
              return (
                <div key={a.id} className="space-y-2">
                  <AnimeCard anime={a} index={i} onClick={setSelected} />
                  {/* Shared genre tags under each card */}
                  <div className="flex flex-wrap gap-1 px-1">
                    {common.slice(0, 2).map(g => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-full bg-indigo-500/8 border border-indigo-500/15 text-[8px] font-black uppercase tracking-wider text-amber-400/70"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-white/20 text-sm font-bold">No similar anime found with rating ≥ 7.5.</p>
            <Link
              href="/bestanimelist"
              className="inline-flex items-center gap-2 mt-4 px-5 py-3 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 text-[11px] font-black uppercase tracking-widest text-amber-400 hover:bg-indigo-600/25 transition-all"
            >
              Browse All Anime <ChevronRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* Anime detail modal */}
      <AnimeModal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        anime={selected}
      />
    </div>
  )
}
