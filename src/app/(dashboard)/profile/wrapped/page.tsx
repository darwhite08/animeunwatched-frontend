"use client"

import { useState, useMemo } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Share2, ChevronRight, Star, Flame, Trophy, Clock, Zap, BarChart2 } from "lucide-react"
import ShareCard from "@/components/ui/ShareCard"
import { useToast } from "@/stores/toast.store"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}
const TOP_GENRE = "Seinen"
const TOTAL_HOURS = 1420
const EPISODES_WATCHED = 3842
const STREAK_BEST = 45
const REVIEWS_WRITTEN = 12
const CURRENT_YEAR = 2024

// STAT_CARDS is now dynamic inside the component

export default function WrappedPage() {
  const [slide, setSlide] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")
  const { data: browseData, isLoading: animeLoading } = useBrowseAnime({ limit: 20 })

  const realStats = useMemo(() => {
    const entries = listData?.data ?? []
    const totalEps = entries.reduce((s, e) => s + e.episodesSeen, 0)
    const totalHrs = Math.round(totalEps * 24 / 60)
    const bestStreak = Math.min(365, Math.floor((user?.reputation ?? 0) / 6))
    return { totalHrs: totalHrs || TOTAL_HOURS, totalEps: totalEps || EPISODES_WATCHED, bestStreak: bestStreak || STREAK_BEST }
  }, [listData, user])

  const topAnime = (browseData?.data ?? []).map(mapDTO).filter(a => a.rating >= 8.8).slice(0, 5)

  const STAT_CARDS = [
    { icon: Clock,     label: "Hours watched",   value: realStats.totalHrs.toLocaleString(),    color: "from-indigo-600/30 to-indigo-900/10",  text: "text-amber-400" },
    { icon: BarChart2, label: "Episodes logged",  value: realStats.totalEps.toLocaleString(),    color: "from-violet-600/30 to-violet-900/10",  text: "text-violet-400" },
    { icon: Flame,     label: "Best streak",      value: `${realStats.bestStreak} days`,         color: "from-orange-600/30 to-orange-900/10",  text: "text-orange-400" },
    { icon: Star,      label: "Reviews written",  value: String(REVIEWS_WRITTEN),                color: "from-amber-600/30 to-amber-900/10",    text: "text-amber-400"  },
  ]

  const SLIDES = [
    "stats",
    "top-anime",
    "genre-dna",
    "achievements",
    "share",
  ] as const

  const isLast = slide === SLIDES.length - 1

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Background glows that shift per slide */}
      <motion.div
        key={slide}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[160px] rounded-full ${
          slide === 0 ? "bg-amber-600/15" :
          slide === 1 ? "bg-violet-600/15" :
          slide === 2 ? "bg-amber-600/10"  :
          slide === 3 ? "bg-emerald-600/10" :
                        "bg-amber-600/20"
        }`} />
      </motion.div>

      {/* Progress dots */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`h-1.5 rounded-full transition-all ${i === slide ? "w-8 bg-amber-500" : "w-1.5 bg-white/20"}`}
          />
        ))}
      </div>

      {/* Slides */}
      <div className="relative z-10 w-full max-w-xl">
        <AnimatePresence mode="wait">

          {/* Slide 0 — Stats */}
          {slide === 0 && (
            <motion.div key="stats" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }} className="space-y-8 text-center">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">{CURRENT_YEAR} Wrapped</p>
                <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">Your Year<br/>in Anime<span style={{color:"#f59e0b"}}>.</span></h1>
                <p className="text-white/35 text-sm mt-3">A lot happened. Here's the data.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {STAT_CARDS.map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i*0.1 }}
                    className={`p-6 rounded-2xl bg-gradient-to-br ${s.color} border border-white/5 text-left`}
                  >
                    <s.icon size={20} className={`${s.text} mb-3`} />
                    <p className="text-3xl font-black text-white tracking-tighter">{s.value}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Slide 1 — Top Anime */}
          {slide === 1 && (
            <motion.div key="top" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }} className="space-y-6">
              <div className="text-center">
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-violet-400/60 mb-2">Your Top 5</p>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">Favourite<br/>Anime of {CURRENT_YEAR}</h2>
              </div>
              {animeLoading && <div className="text-white/30 text-sm text-center py-4">Loading…</div>}
              <div className="space-y-3">
                {topAnime.map((anime, i) => (
                  <motion.div key={anime.id} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.08 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/8"
                  >
                    <span className="text-2xl font-black text-white/20 w-7 shrink-0">#{i+1}</span>
                    <div className="relative h-12 w-9 rounded-lg overflow-hidden shrink-0">
                      <Image src={anime.image} alt={anime.title} fill className="object-cover" sizes="36px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white truncate">{anime.title}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">{anime.studio}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star size={11} fill="#f59e0b" className="text-amber-400" />
                      <span className="text-sm font-black text-white">{anime.rating.toFixed(1)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Slide 2 — Genre DNA */}
          {slide === 2 && (
            <motion.div key="genre" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }} className="space-y-8 text-center">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">Your DNA</p>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">You Are<br/>A {TOP_GENRE}<br/>Otaku<span className="text-amber-400">.</span></h2>
                <p className="text-white/35 text-sm mt-3">68% of your watches were {TOP_GENRE} this year.</p>
              </div>
              {[
                { genre:"Seinen",       pct:68, color:"from-amber-500 to-yellow-400"   },
                { genre:"Action",       pct:52, color:"from-indigo-500 to-blue-400"    },
                { genre:"Psychological",pct:41, color:"from-purple-500 to-pink-400"    },
                { genre:"Fantasy",      pct:28, color:"from-emerald-500 to-teal-400"   },
                { genre:"Romance",      pct:12, color:"from-rose-500 to-red-400"       },
              ].map((g, i) => (
                <motion.div key={g.genre} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i*0.1 }} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-white/60 uppercase tracking-wider">{g.genre}</span>
                    <span className="text-white/40">{g.pct}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width:0 }} animate={{ width:`${g.pct}%` }} transition={{ delay:i*0.1+0.2, duration:0.8, ease:"easeOut" }}
                      className={`h-full bg-gradient-to-r ${g.color} rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Slide 3 — Achievements */}
          {slide === 3 && (
            <motion.div key="achieve" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }} className="space-y-6 text-center">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-emerald-400/60 mb-2">Milestones</p>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">What You<br/>Unlocked<span className="text-emerald-400">.</span></h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { emoji:"🔥", label:"Fire Walker",      desc:"10-day streak" },
                  { emoji:"⚔️", label:"Centurion",        desc:"100 anime archived" },
                  { emoji:"📝", label:"The Critic",       desc:"First review written" },
                  { emoji:"👥", label:"Social Butterfly", desc:"Followed 5 users" },
                ].map((b, i) => (
                  <motion.div key={b.label} initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.1, type:"spring", stiffness:200 }}
                    className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2"
                  >
                    <span className="text-3xl">{b.emoji}</span>
                    <p className="font-black text-white text-sm">{b.label}</p>
                    <p className="text-[10px] text-white/40">{b.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Slide 4 — Share */}
          {slide === 4 && (
            <motion.div key="share" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-30 }} className="space-y-8 text-center">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">Share your story</p>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic text-white">
                  That was<br/>{CURRENT_YEAR}<span style={{color:"#f59e0b"}}>.</span>
                </h2>
                <p className="text-white/35 text-sm mt-3">Share your Anime Wrapped with the world.</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => setShareOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                >
                  <Share2 size={14} /> Share My {CURRENT_YEAR} Wrapped
                </button>
                <Link href="/dashboard" className="block text-center text-xs text-white/30 hover:text-white/60 transition-colors font-bold uppercase tracking-widest">
                  Back to Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        {!isLast ? (
          <motion.button
            whileHover={{ scale:1.05 }}
            whileTap={{ scale:0.95 }}
            onClick={() => setSlide(s => s + 1)}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/10 border border-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-md"
          >
            Next <ChevronRight size={13} />
          </motion.button>
        ) : null}
      </div>

      <ShareCard
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`My ${CURRENT_YEAR} Anime Wrapped`}
        subtitle={`${realStats.totalHrs}h watched · ${realStats.totalEps} episodes · ${realStats.bestStreak}-day streak`}
        url={`https://kaiveron.app/wrapped`}
        type="profile"
      />
    </div>
  )
}
