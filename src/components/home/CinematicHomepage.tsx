"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Zap, Star, Users, Flame, Trophy, Play, ChevronDown, Sparkles, Command } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import { AnimatedCounterText } from "@/components/ui/AnimatedCounter"
import CinematicHero from "@/components/home/CinematicHero"

/* ─── Analytics hook ─── */
function usePlatformUserCount() {
  return useQuery<number>({
    queryKey: ["analytics/stats/users"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE ?? ""}/api/v1/analytics/stats`,
        { credentials: "include" },
      )
      if (!res.ok) throw new Error("unavailable")
      const json = await res.json()
      const stats = json.stats ?? json
      return (stats.users as number) ?? 12402
    },
    placeholderData: 12402,
    retry: false,
    staleTime: 60_000,
  })
}

function mapDTO(a: AnimeDTO) {
  return {
    id: String(a.malId),
    title: a.title,
    rating: a.score ?? 0,
    image: a.imageUrl ?? "",
    status: a.status?.toLowerCase().includes("airing") ? "airing" as const : "finished" as const,
  }
}

/* ─── SECTION 1: DISCOVERY ─── */
function DiscoverySection() {
  const CATEGORIES = [
    { label: "Hidden Gems",   count: 487 },
    { label: "Dark Fantasy",  count: 312 },
    { label: "Psychological", count: 198 },
    { label: "Underrated",    count: 654 },
  ]

  const { data: discoveryData } = useBrowseAnime({ limit: 20 })
  const FEATURED = [...(discoveryData?.data ?? [])]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 6)
    .map(mapDTO)

  return (
    <section className="min-h-screen py-24 bg-[#08080f] relative z-[1] overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full space-y-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[clamp(2rem,5vw,4.5rem)] font-bold tracking-tight text-white leading-tight"
            >
              Discover the<br />
              <span className="text-amber-400">undiscovered.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/35 text-sm max-w-xs leading-relaxed"
          >
            We match you to anime based on how you actually think — not what everyone else is watching.
          </motion.p>
        </div>

        {/* Category cards — monochrome */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(({ label, count }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative p-7 rounded-[2rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] cursor-pointer overflow-hidden h-48 transition-all duration-300"
            >
              <AnimatedCounterText value={count} className="text-5xl font-black tracking-tighter text-white mb-1" />
              <p className="text-[9px] text-white/20 font-mono mb-2">anime</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white/60 transition-colors">{label}</p>
              <ArrowRight size={16} className="text-white/20 group-hover:text-white/50 absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 duration-300" />
            </motion.div>
          ))}
        </div>

        {/* Anime grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {FEATURED.map((anime, i) => (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -12, scale: 1.04 }}
              className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image
                src={anime.image}
                alt={anime.title}
                fill
                className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-500 scale-105 group-hover:scale-100"
                sizes="200px"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-[9px] font-black text-white uppercase tracking-tight truncate">{anime.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={8} fill="currentColor" className="text-white/50" />
                  <span className="text-[8px] text-white/40">{anime.rating.toFixed(1)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/bestanimelist"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.08] text-sm font-medium text-white/40 hover:text-white/70 hover:border-white/[0.15] hover:bg-white/[0.03] transition-all"
          >
            View full catalog <ArrowRight size={13} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── SECTION 2: AI ORACLE ─── */
function AIOracleSection() {
  const PROMPTS = [
    { short: "Psychological thriller", full: "A slow-burn psychological thriller with no happy ending",  results: [
      { title: "Monster",                score: 9.1, genre: "Psychological", match: 98, grad: "from-slate-800 to-indigo-950"   },
      { title: "Paranoia Agent",         score: 8.8, genre: "Thriller",      match: 95, grad: "from-violet-950 to-slate-900"  },
      { title: "Serial Experiments Lain",score: 8.5, genre: "Sci-Fi",        match: 91, grad: "from-blue-950 to-slate-900"    },
    ]},
    { short: "Hidden power MC",        full: "Overpowered MC who hides their strength from everyone",    results: [
      { title: "One Punch Man",          score: 8.7, genre: "Action",        match: 97, grad: "from-yellow-950 to-slate-900"  },
      { title: "Mob Psycho 100",         score: 9.0, genre: "Supernatural",  match: 94, grad: "from-indigo-950 to-slate-900"  },
      { title: "The Irregular at Magic", score: 7.5, genre: "Fantasy",       match: 88, grad: "from-emerald-950 to-slate-900" },
    ]},
    { short: "Forgotten 2000s gems",   full: "Hidden gems from the 2000s that nobody talks about",       results: [
      { title: "Haibane Renmei",         score: 8.1, genre: "Slice of Life", match: 96, grad: "from-amber-950 to-slate-900"   },
      { title: "Kino's Journey",         score: 8.0, genre: "Adventure",     match: 93, grad: "from-teal-950 to-slate-900"    },
      { title: "Texhnolyze",             score: 8.1, genre: "Sci-Fi Noir",   match: 89, grad: "from-gray-900 to-slate-950"    },
    ]},
    { short: "Romance gut-punch",      full: "Romance that hits like a truck in the last episode",       results: [
      { title: "Clannad: After Story",   score: 9.0, genre: "Drama",         match: 99, grad: "from-rose-950 to-slate-900"    },
      { title: "Anohana",                score: 8.7, genre: "Drama",         match: 95, grad: "from-pink-950 to-slate-900"    },
      { title: "Your Lie in April",      score: 8.7, genre: "Music / Drama", match: 93, grad: "from-orange-950 to-slate-900"  },
    ]},
  ]
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive(i => (i + 1) % PROMPTS.length), 4000)
    return () => clearInterval(id)
  }, [PROMPTS.length])

  return (
    <section className="min-h-screen py-24 relative z-[2] overflow-hidden bg-[#06060f] flex items-center">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 50% 60% at 72% 50%, rgba(79,70,229,0.07) 0%, transparent 60%)",
      }} />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── LEFT ── */}
          <div className="space-y-10">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[11px] font-medium uppercase tracking-[0.25em] text-indigo-400/60 mb-4"
              >
                AI Discovery
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[clamp(2rem,4.2vw,3.8rem)] font-bold tracking-tight text-white leading-tight mb-5"
              >
                Tell us how you<br />
                <span className="text-amber-400">want to feel.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-white/35 text-base leading-relaxed max-w-[40ch]"
              >
                Forget genre tags. Our AI matches anime to your mood — a vibe, a feeling, a moment you're chasing.
              </motion.p>
            </div>

            {/* Example prompts */}
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/20 mb-3">Try asking for</p>
              {PROMPTS.map((p, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setActive(i)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                    active === i
                      ? "bg-indigo-600/10 border-indigo-500/30 text-white/80"
                      : "bg-white/[0.02] border-white/[0.06] text-white/35 hover:bg-white/[0.04] hover:border-white/[0.1] hover:text-white/55"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active === i ? "bg-indigo-400" : "bg-white/15"}`} />
                  <span className="text-[13px] font-medium">&ldquo;{p.full}&rdquo;</span>
                </motion.button>
              ))}
            </div>

            <Link href="/ai-discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide text-black transition-all" style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)",boxShadow:"0 4px 20px rgba(245,158,11,0.35)"}}
            >
              <Sparkles size={13} /> Try AI discovery
            </Link>
          </div>

          {/* ── RIGHT — discovery card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <div className="rounded-2xl bg-white/[0.025] border border-white/[0.08] overflow-hidden" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.55)" }}>

              {/* Header */}
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-400" />
                  <span className="text-[11px] font-semibold text-white/55">Neural Oracle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[9px] text-emerald-400/70 font-medium">Live</span>
                </div>
              </div>

              {/* Active prompt */}
              <div className="px-5 pt-5 pb-4">
                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/20 mb-2.5">Searching for</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={active}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="text-[16px] font-semibold text-white/90 leading-snug"
                  >
                    &ldquo;{PROMPTS[active].full}&rdquo;
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Quick-select pills */}
              <div className="px-5 pb-5 flex flex-wrap gap-1.5">
                {PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      active === i
                        ? "bg-amber-500 text-black"
                        : "bg-white/[0.03] text-white/30 border border-white/[0.07] hover:bg-white/[0.06] hover:text-white/55"
                    }`}
                  >
                    {p.short}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="border-t border-white/[0.06]">
                <div className="px-5 py-3 flex items-center justify-between bg-white/[0.01]">
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/20">Top matches</p>
                  <span className="text-[9px] text-indigo-400/50 font-medium">3 results</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {PROMPTS[active].results.map(({ title, score, genre, match, grad }, i) => (
                      <div
                        key={title}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer border-t border-white/[0.04]"
                      >
                        {/* Poster thumbnail */}
                        <div className={`w-9 h-[52px] rounded-lg shrink-0 bg-gradient-to-b ${grad} border border-white/[0.08] overflow-hidden relative`}>
                          <div className="absolute inset-0 flex items-end justify-start p-1">
                            <span className="text-[7px] font-bold text-white/30 leading-none">{title.slice(0, 3).toUpperCase()}</span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white/80 truncate mb-0.5">{title}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              <Star size={8} className="fill-amber-400/70 text-amber-400/70" />
                              <span className="text-[9px] text-white/35 font-medium">{score}</span>
                            </div>
                            <span className="text-[7px] text-white/12">·</span>
                            <span className="text-[9px] text-white/25">{genre}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-bold text-amber-400">{match}%</p>
                          <p className="text-[8px] text-white/18">match</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                <div className="px-5 py-3.5 border-t border-white/[0.05] bg-white/[0.01]">
                  <Link href="/ai-discover" className="text-[11px] text-indigo-400/60 hover:text-amber-400 transition-colors font-medium inline-flex items-center gap-1">
                    Open AI discovery <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── SECTION 3: COMMUNITY ─── */
function CommunitySection() {
  const { data: discoverPosts } = useBrowseAnime({ limit: 1 })
  const animeTotalApprox = discoverPosts?.meta?.total ?? 310

  return (
    <section className="min-h-screen py-24 bg-[#08080f] relative z-[2] overflow-hidden flex items-center">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 50% 55% at 85% 50%, rgba(79,70,229,0.05) 0%, transparent 60%)",
      }} />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div className="space-y-8">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[11px] font-medium uppercase tracking-[0.25em] text-indigo-400/60 mb-4"
              >
                Community
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[clamp(2rem,4.5vw,4rem)] font-bold tracking-tight text-white leading-tight mb-5"
              >
                Every episode<br />
                <span className="text-amber-400">builds your legacy.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-white/35 text-base leading-relaxed max-w-md"
              >
                Earn XP for every episode you watch. Build streaks, unlock titles, and compete on a global leaderboard that rewards dedication — not just activity.
              </motion.p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Flame,  label: "Daily Streaks",    desc: "Watch daily to compound XP.",     color: "text-orange-400", bg: "bg-orange-500/[0.12]", border: "border-orange-500/[0.18]" },
                { icon: Trophy, label: "Leaderboard",      desc: "Rank globally by season.",         color: "text-amber-400",  bg: "bg-amber-500/[0.12]",  border: "border-amber-500/[0.18]"  },
                { icon: Star,   label: "Badges & Titles",  desc: "100+ achievements to unlock.",     color: "text-violet-400", bg: "bg-violet-500/[0.12]", border: "border-violet-500/[0.18]" },
                { icon: Users,  label: "Social Feed",      desc: "Follow fans with similar taste.",  color: "text-amber-400", bg: "bg-indigo-500/[0.12]", border: "border-indigo-500/[0.18]" },
              ].map(({ icon: Icon, label, desc, color, bg, border }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className={`p-4 rounded-xl bg-white/[0.04] border ${border} hover:bg-white/[0.06] transition-all`}
                >
                  <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center mb-3`}>
                    <Icon size={14} className={color} />
                  </div>
                  <p className="text-[13px] font-semibold text-white/85 mb-1">{label}</p>
                  <p className="text-[11px] text-white/40 leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center pt-6 border-t border-white/[0.06]"
            >
              {[
                { v: "4.2M",                              l: "Episodes tracked"     },
                { v: `${animeTotalApprox}+`,               l: "Anime catalogued"     },
                { v: "8.4",                               l: "Avg community rating"  },
              ].map(({ v, l }, i) => (
                <div key={l} className={`${i > 0 ? "pl-5 ml-5 border-l border-white/[0.06]" : ""}`}>
                  <p className="text-base font-bold text-white tracking-tight">{v}</p>
                  <p className="text-[11px] text-white/25 mt-0.5">{l}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex gap-3"
            >
              <Link href="/leaderboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide text-black transition-all" style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)",boxShadow:"0 4px 20px rgba(245,158,11,0.35)"}}
              >
                <Trophy size={13} /> View leaderboard
              </Link>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.1] text-sm font-medium text-white/45 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                Join free
              </Link>
            </motion.div>
          </div>

          {/* Right — leaderboard widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="space-y-3"
          >
            {/* Top fan spotlight */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] to-orange-500/[0.04] border border-amber-500/[0.14]">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/25 to-orange-500/15 border border-amber-400/20 flex items-center justify-center text-base font-bold text-amber-300">
                  O
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-[#08080f] flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">1</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">Otaku_Arch</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/20 text-amber-400/80 font-medium">Legendary</span>
                </div>
                <p className="text-[11px] text-white/35 mt-0.5">42-day streak · 1.2M XP this season</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-orange-400">🔥 42</p>
                <p className="text-[9px] text-white/20">day streak</p>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="rounded-2xl bg-white/[0.025] border border-white/[0.08] overflow-hidden" style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
              <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                <span className="text-[11px] font-semibold text-white/50">Top fans this week</span>
                <Trophy size={12} className="text-amber-400/50" />
              </div>
              <div className="divide-y divide-white/[0.04]">
                {[
                  { rank: 1, name: "Otaku_Arch",    title: "Legendary",   xp: "1.2M", pct: 88, streak: 42, accent: "bg-amber-500/55"   },
                  { rank: 2, name: "ShadowWatcher", title: "Arch-Mage",   xp: "840K", pct: 70, streak: 31, accent: "bg-indigo-500/50"  },
                  { rank: 3, name: "Void_Seeker",   title: "Elite Jonin", xp: "620K", pct: 55, streak: 22, accent: "bg-indigo-500/40"  },
                  { rank: 4, name: "NightOwl_88",   title: "Jonin",       xp: "410K", pct: 40, streak: 17, accent: "bg-indigo-500/30"  },
                ].map(({ rank, name, title, xp, pct, streak, accent }, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <span className={`text-[12px] font-bold w-4 text-center shrink-0 ${
                      rank === 1 ? "text-amber-400" : rank === 2 ? "text-white/50" : "text-white/25"
                    }`}>{rank}</span>

                    <div className="w-8 h-8 rounded-xl bg-white/[0.07] border border-white/[0.07] flex items-center justify-center text-[11px] font-bold text-white/60 shrink-0">
                      {name[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-[12px] font-semibold text-white/80">{name}</p>
                        <span className="text-[8px] text-white/25 bg-white/[0.06] px-1.5 py-0.5 rounded shrink-0">{title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${accent}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] text-white/20 font-mono shrink-0">{xp}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-1">
                      <p className="text-[11px] font-semibold text-orange-400/80">{streak}d</p>
                      <p className="text-[8px] text-white/15 mt-0.5">streak</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-white/[0.05] bg-white/[0.01]">
                <Link href="/leaderboard" className="text-[11px] text-indigo-400/60 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors">
                  View full leaderboard <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ─── SECTION 4: FEATURE SHOWCASE ─── */
function ShowcaseSection() {
  const FEATURES = [
    {
      tag: "Track",
      title: "Your archive, perfectly organized.",
      desc: "Every anime you've watched, rated, and reviewed — one place. Status badges, progress, and personal scores.",
      href: "/watchlist",
      accent: "indigo",
      preview: (
        <div className="space-y-2.5">
          {[
            { title: "Attack on Titan", ep: "12 / 25", pct: 48,  grad: "from-slate-700 to-gray-900",    status: "Watching"   },
            { title: "Frieren",          ep: "8 / 28",  pct: 29,  grad: "from-green-900 to-teal-950",    status: "Watching"   },
            { title: "Steins;Gate",      ep: "24 / 24", pct: 100, grad: "from-indigo-900 to-slate-900",  status: "Completed"  },
          ].map(({ title, ep, pct, grad, status }) => (
            <div key={title} className="flex items-center gap-3">
              <div className={`w-7 h-10 rounded-md bg-gradient-to-b ${grad} shrink-0 border border-white/[0.08] flex items-end justify-start p-0.5`}>
                <span className="text-[5px] font-bold text-white/30 leading-none">{title.slice(0,3).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-[10px] font-medium text-white/75 truncate">{title}</span>
                  <span className="text-[8px] text-white/25 shrink-0 ml-2">{ep}</span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full">
                  <div className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500/70" : "bg-indigo-500/70"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className={`text-[8px] font-medium shrink-0 ${pct === 100 ? "text-emerald-400/60" : "text-indigo-400/50"}`}>{status}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      tag: "Compete",
      title: "Rise through the Pantheon.",
      desc: "XP from every episode. Streaks that compound. Real rankings built on what you've actually watched.",
      href: "/leaderboard",
      accent: "amber",
      preview: (
        <div className="space-y-2">
          {[
            { rank: 1, name: "Otaku_Arch", xp: "1.2M", delta: null },
            { rank: 2, name: "ShadowWatch", xp: "840K", delta: null },
            { rank: 3, name: "You", xp: "320K", delta: "↑2" },
          ].map(({ rank, name, xp, delta }) => (
            <div key={name} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${name === "You" ? "bg-amber-500/[0.08] border border-amber-500/[0.15]" : "bg-white/[0.03]"}`}>
              <span className="text-[11px] font-bold text-white/30 w-4 text-right">{rank}</span>
              <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-white/50">{name[0]}</div>
              <span className="flex-1 text-[11px] font-medium text-white/70">{name}</span>
              {delta && <span className="text-[9px] text-amber-400 font-bold">{delta}</span>}
              <span className="text-[9px] text-white/25 font-mono">{xp}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      tag: "Create",
      title: "Publish. Build an audience.",
      desc: "Write reviews, long-form blogs, host polls. The Creator Studio turns your anime knowledge into influence.",
      href: "/creators",
      accent: "violet",
      preview: (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] font-semibold text-white/70 mb-1">My Frieren Review</p>
            <p className="text-[9px] text-white/35 leading-relaxed line-clamp-2">"A masterpiece about the passage of time — slow, elegant, and devastating..."</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[8px] text-white/20">★★★★★</span>
              <span className="text-[8px] text-white/20">· 142 likes · 28 comments</span>
            </div>
          </div>
          <div className="flex gap-2">
            {["Blog", "Poll", "Review"].map(t => (
              <span key={t} className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] text-white/35">{t}</span>
            ))}
          </div>
        </div>
      ),
    },
  ]

  return (
    <section className="py-28 bg-[#08080f] relative z-[2]">
      <div className="max-w-7xl mx-auto px-6 w-full">

        <div className="mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(1.8rem,4vw,3.5rem)] font-bold tracking-tight text-white"
          >
            Everything you need,<br />
            <span className="text-amber-400">in one place.</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {FEATURES.map(({ tag, title, desc, href, accent, preview }, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.045] transition-all duration-300 flex flex-col gap-6"
            >
              <div>
                <span className={`inline-block text-[10px] font-semibold uppercase tracking-[0.15em] mb-3 px-2.5 py-1 rounded-md ${
                  accent === "indigo" ? "text-indigo-300/80 bg-indigo-500/10" :
                  accent === "amber" ? "text-amber-300/80 bg-amber-500/10" : "text-violet-300/80 bg-violet-500/10"
                }`}>{tag}</span>
                <h3 className="text-[15px] font-semibold text-white leading-snug mb-2.5">{title}</h3>
                <p className="text-[13px] text-white/35 leading-relaxed">{desc}</p>
              </div>

              {/* Mock preview */}
              <div className="flex-1 p-4 rounded-xl bg-black/20 border border-white/[0.05]">
                {preview}
              </div>

              <Link
                href={href}
                className={`inline-flex items-center gap-1.5 text-[13px] font-medium transition-all ${
                  accent === "indigo" ? "text-indigo-400/60 hover:text-amber-400" :
                  accent === "amber" ? "text-amber-400/60 hover:text-amber-400" : "text-violet-400/60 hover:text-violet-400"
                }`}
              >
                Explore <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── SECTION 5: FINAL CTA ─── */
function FinalCTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1])
  const { data: userCount = 12402 } = usePlatformUserCount()

  const FEATURES = [
    "Track every episode",
    "AI-powered discovery",
    "Global leaderboard",
    "Creator studio",
    "Daily streaks & XP",
    "Free forever",
  ]

  return (
    <section ref={ref} className="py-36 flex items-center justify-center bg-[#06060f] relative z-[2] overflow-hidden">
      {/* Ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.07, 0.13, 0.07] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600 blur-[180px] rounded-full pointer-events-none"
      />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <motion.div style={{ scale, opacity }} className="relative z-10 w-full max-w-3xl mx-auto px-6">

        {/* Platform badge */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <Sparkles size={11} className="text-amber-400" />
            <span className="text-[11px] font-medium text-white/45">Kaiveron · Open Beta</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-[clamp(2.2rem,6vw,5rem)] font-bold tracking-tight leading-tight text-white mb-4">
            Your anime archive,<br />
            <span className="text-amber-400">starting today.</span>
          </h2>
          <p className="text-white/35 text-base max-w-md mx-auto leading-relaxed">
            The social platform built for serious anime fans. Track, rate, discover, and compete — all in one place.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FEATURES.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-[11px] font-medium text-white/45">
              <span className="w-1 h-1 rounded-full bg-indigo-400/70 shrink-0" />
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <Link href="/register"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-black uppercase tracking-wide text-black transition-all"
            style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 4px 30px rgba(245,158,11,0.4)" }}
          >
            Create your free account
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div className="flex items-center gap-3 text-[11px] text-white/20">
            <span>Free forever</span>
            <span className="text-white/10">·</span>
            <span>No credit card required</span>
            <span className="text-white/10">·</span>
            <span>Join in under 30 seconds</span>
          </div>
        </div>

        {/* Social proof + stats */}
        <div className="mt-14 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["O","S","V","N","C"].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600/40 to-violet-600/30 border-2 border-[#06060f] flex items-center justify-center text-[9px] font-bold text-white/60">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/25">
                Joined by <span className="text-white/50 font-medium">{userCount >= 1000 ? userCount.toLocaleString() : "1,000+"}</span> fans
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-5 text-center">
              {[
                { v: "4.2M", l: "Episodes tracked" },
                { v: "310+", l: "Anime catalogued"  },
                { v: "8.4★", l: "Avg rating"        },
              ].map(({ v, l }, i) => (
                <div key={l} className={`${i > 0 ? "pl-5 border-l border-white/[0.06]" : ""}`}>
                  <p className="text-sm font-bold text-white/70">{v}</p>
                  <p className="text-[10px] text-white/20 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ─── ROOT ─── */
export default function CinematicHomepage() {
  return (
    <main className="bg-[#06060f] text-white overflow-x-hidden">
      <ScrollProgressBar />
      <CinematicHero />
      <DiscoverySection />
      <AIOracleSection />
      <CommunitySection />
      <ShowcaseSection />
      <FinalCTASection />
    </main>
  )
}

const CHAPTERS = ["Hero", "Discovery", "AI Oracle", "Community", "Showcase", "Begin"]

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const activeChapter = useTransform(scrollYProgress, [0, 0.15, 0.32, 0.50, 0.68, 0.85, 1], [0, 0, 1, 2, 3, 4, 5])
  const [chapter, setChapter] = useState(0)

  useEffect(() => {
    const unsub = activeChapter.on("change", v => setChapter(Math.round(Math.min(5, v))))
    return unsub
  }, [activeChapter])

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-indigo-500 z-[200] origin-left opacity-60"
        style={{ scaleX }}
      />
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[150] hidden lg:flex flex-col gap-3">
        {CHAPTERS.map((name, i) => (
          <button
            key={name}
            onClick={() => {
              const pct = [0, 0.18, 0.35, 0.52, 0.68, 0.88][i]
              window.scrollTo({ top: document.body.scrollHeight * pct, behavior: "smooth" })
            }}
            title={name}
            className="group flex items-center gap-2 justify-end"
          >
            <motion.span
              className="text-[8px] font-black uppercase tracking-widest text-white/0 group-hover:text-white/35 transition-all"
              animate={{ opacity: chapter === i ? 1 : 0, x: chapter === i ? 0 : 8 }}
            >
              {name}
            </motion.span>
            <motion.div
              animate={{
                width: chapter === i ? 16 : 4,
                backgroundColor: chapter === i ? "rgba(99,102,241,0.8)" : "rgba(255,255,255,0.12)",
              }}
              className="h-1 rounded-full"
            />
          </button>
        ))}
      </div>
    </>
  )
}
