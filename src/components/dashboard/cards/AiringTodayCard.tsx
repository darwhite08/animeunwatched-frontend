"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Tv2, CalendarCheck, ChevronRight } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import { useMemo } from "react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Deterministically assign airing day from malId so it's consistent per session
function getAiringDay(malId: number): number {
  return malId % 7
}

export default function AiringTodayCard() {
  const today = new Date().getDay()
  const { data, isLoading } = useBrowseAnime({ status: "Airing", limit: 35 })

  const todayAnime = useMemo(() => {
    const all = data?.data ?? []
    return all.filter((a: AnimeDTO) => getAiringDay(a.malId) === today).slice(0, 5)
  }, [data, today])

  const tomorrowAnime = useMemo(() => {
    const all = data?.data ?? []
    const tomorrow = (today + 1) % 7
    return all.filter((a: AnimeDTO) => getAiringDay(a.malId) === tomorrow).slice(0, 3)
  }, [data, today])

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] relative overflow-hidden group">
      <div className="absolute -left-6 -top-6 w-32 h-32 bg-violet-500/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-violet-500/10 transition-colors duration-700" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Tv2 size={14} className="text-violet-400" />
          <h4 className="text-xs font-black uppercase tracking-[0.28em] text-white/30">Airing Today</h4>
          <span className="ml-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-400">
            {DAYS[today]}
          </span>
        </div>
        <Link href="/calendar" className="text-[9px] font-black uppercase tracking-widest text-violet-400/60 hover:text-violet-400 transition-colors flex items-center gap-1">
          Full Schedule <ChevronRight size={10} />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-7 rounded-lg bg-white/5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-2/3 bg-white/8 rounded-full" />
                <div className="h-2 w-1/3 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : todayAnime.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <CalendarCheck size={20} className="mx-auto text-white/15" />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No data for today</p>
          <Link href="/calendar" className="text-[9px] text-violet-400 hover:text-violet-300 font-black uppercase tracking-widest">
            View Full Schedule →
          </Link>
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {todayAnime.map((anime: AnimeDTO, i: number) => (
            <motion.div
              key={anime.malId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/anime/${anime.malId}`}
                className="group/item flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer">
                {anime.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={anime.imageUrl}
                    alt={anime.title}
                    className="h-10 w-7 rounded-lg object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                ) : (
                  <div className="h-10 w-7 rounded-lg bg-violet-500/15 border border-violet-500/20 shrink-0 flex items-center justify-center">
                    <Tv2 size={10} className="text-violet-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white/75 group-hover/item:text-white transition-colors leading-tight truncate">
                    {anime.title}
                  </p>
                  <p className="text-[9px] text-white/25 font-bold mt-0.5">
                    {anime.studios?.[0] ?? "Unknown Studio"} · {anime.type ?? "TV"}
                  </p>
                </div>
                {anime.score && (
                  <span className="text-[9px] font-black text-amber-400/70 shrink-0">★ {anime.score.toFixed(1)}</span>
                )}
              </Link>
            </motion.div>
          ))}

          {tomorrowAnime.length > 0 && (
            <div className="pt-3 border-t border-white/5 space-y-1.5">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/15">Tomorrow ({DAYS[(today + 1) % 7]})</p>
              {tomorrowAnime.map((anime: AnimeDTO) => (
                <Link key={anime.malId} href={`/anime/${anime.malId}`}
                  className="flex items-center gap-2 text-[10px] text-white/25 hover:text-white/50 transition-colors truncate font-medium">
                  <span className="h-1 w-1 rounded-full bg-white/20 shrink-0" />
                  {anime.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
