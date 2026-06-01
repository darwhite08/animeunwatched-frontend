"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import { Flame, Star, ChevronRight, Radio } from "lucide-react"

function mapDTO(a: AnimeDTO, i: number) {
  return { id: String(a.malId), title: a.title, rating: a.score ?? 0, studio: a.studios[0] ?? "Unknown", image: a.imageUrl ?? "", status: a.status?.toLowerCase().includes("airing") ? "airing" as const : "finished" as const }
}

export default function AiringNow() {
  const { data, isLoading } = useBrowseAnime({ limit: 20 })
  const AIRING = (data?.data ?? []).map(mapDTO).filter(a => a.status === "airing").slice(0, 6)
  if (isLoading) {
    return (
      <section className="py-24 bg-background relative overflow-hidden border-y border-white/[0.03] flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </section>
    )
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden border-y border-white/[0.03]">
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      {/* Glow */}
      <motion.div
        animate={{ opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400"
            >
              <Radio size={12} className="animate-pulse" /> Currently Airing
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none"
            >
              What's Airing<span className="text-emerald-400">.</span>
            </motion.h2>
            <p className="text-subtle text-sm">New episodes dropping this season</p>
          </div>

          <Link
            href="/anime/season/2024/fall"
            className="hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-surface text-xs font-black uppercase tracking-widest text-muted hover:text-foreground hover:bg-white/[0.06] transition-all"
          >
            Full Season <ChevronRight size={13} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {AIRING.map((anime, i) => (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/anime/${anime.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3">
                  <Image
                    src={anime.image}
                    alt={anime.title}
                    fill
                    className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-500 scale-105 group-hover:scale-100"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  />
                  {/* Live badge */}
                  <div className="absolute top-3 left-3">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[8px] font-black text-emerald-400">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-border">
                    <Star size={10} fill="var(--app-accent)" className="text-accent-bright" />
                    <span className="text-[9px] font-black text-foreground">{anime.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs font-black text-muted group-hover:text-foreground transition-colors line-clamp-2 leading-tight">
                  {anime.title}
                </p>
                <p className="text-[9px] text-subtle mt-0.5 uppercase tracking-wider">{anime.studio}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/anime/season/2024/fall"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-surface text-xs font-black uppercase tracking-widest text-muted hover:text-foreground transition-all"
          >
            Full Season <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}
