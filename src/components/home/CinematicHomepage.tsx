"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Zap, Star, Users, Flame, Trophy, Play, ChevronDown, Sparkles, Command } from "lucide-react"
import { useBrowseAnime, useAnime } from "@/hooks/useAnime"
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

/* ─── AI result row with real anime poster ─── */
function AIResultRow({
  title, malId, score, genre, match, grad, index,
}: {
  title: string
  malId: number
  score: number
  genre: string
  match: number
  grad: string
  index: number
}) {
  // Defer query to after client mount — keeps SSR pure (no network) and
  // avoids "Internal Server Error" from a server-side fetch that can't
  // resolve relative URLs or reach the backend.
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const query = useAnime(mounted ? malId : 0) // 0 → enabled:false in useAnime
  const imageUrl = query.data && "anime" in query.data && query.data.anime
    ? query.data.anime.imageUrl
    : null
  const [imgErr, setImgErr] = useState(false)
  const showImage = !!imageUrl && !imgErr

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="group flex items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-colors cursor-pointer border-t border-white/[0.04] relative"
    >
      <span className="text-[9px] font-bold tabular-nums text-white/20 w-3 shrink-0">{String(index + 1).padStart(2, "0")}</span>

      {/* Poster thumbnail — real anime cover with gradient fallback */}
      <div className={`relative w-10 h-14 rounded-md shrink-0 ${showImage ? "bg-black/40" : `bg-gradient-to-b ${grad}`} border border-white/[0.1] overflow-hidden`}>
        {showImage && (
          // Plain <img> intentionally — bypasses next/image domain validation
          // since the URL host is dynamic (Jikan can return cdn.myanimelist.net,
          // cdn.noitatnemucod.net, etc. depending on the catalog provider).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        )}
        <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
          background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.08) 45%, transparent 60%)",
        }} />
        {!showImage && (
          <div className="absolute inset-x-0 bottom-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
            <span className="text-[7.5px] font-black text-white/55 leading-none tracking-tight">{title.slice(0, 3).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-bold text-white/90 truncate mb-1 group-hover:text-amber-200 transition-colors">{title}</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star size={9} className="fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-white/55 font-semibold tabular-nums">{score}</span>
          </div>
          <span className="text-[6px] text-white/15">●</span>
          <span className="text-[10px] text-white/35 font-medium">{genre}</span>
        </div>
      </div>

      <div className="text-right shrink-0 flex flex-col items-end">
        <p className="text-[16px] font-black leading-none tabular-nums" style={{
          backgroundImage: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>{match}<span className="text-[10px]">%</span></p>
        <div className="mt-1.5 h-[3px] w-12 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${match}%` }}
            transition={{ duration: 0.8, delay: index * 0.08, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }}
          />
        </div>
      </div>
    </motion.div>
  )
}

/* ─── SECTION 2: AI ORACLE ─── */
function AIOracleSection() {
  const PROMPTS = [
    { short: "Psychological thriller", full: "A slow-burn psychological thriller with no happy ending",  results: [
      { title: "Monster",                 malId: 19,    score: 9.1, genre: "Psychological", match: 98, grad: "from-slate-800 to-indigo-950"   },
      { title: "Paranoia Agent",          malId: 323,   score: 8.8, genre: "Thriller",      match: 95, grad: "from-violet-950 to-slate-900"  },
      { title: "Serial Experiments Lain", malId: 339,   score: 8.5, genre: "Sci-Fi",        match: 91, grad: "from-blue-950 to-slate-900"    },
    ]},
    { short: "Hidden power MC",        full: "Overpowered MC who hides their strength from everyone",    results: [
      { title: "One Punch Man",           malId: 30276, score: 8.7, genre: "Action",        match: 97, grad: "from-yellow-950 to-slate-900"  },
      { title: "Mob Psycho 100",          malId: 32182, score: 9.0, genre: "Supernatural",  match: 94, grad: "from-indigo-950 to-slate-900"  },
      { title: "The Irregular at Magic",  malId: 20785, score: 7.5, genre: "Fantasy",       match: 88, grad: "from-emerald-950 to-slate-900" },
    ]},
    { short: "Forgotten 2000s gems",   full: "Hidden gems from the 2000s that nobody talks about",       results: [
      { title: "Haibane Renmei",          malId: 387,   score: 8.1, genre: "Slice of Life", match: 96, grad: "from-amber-950 to-slate-900"   },
      { title: "Kino's Journey",          malId: 543,   score: 8.0, genre: "Adventure",     match: 93, grad: "from-teal-950 to-slate-900"    },
      { title: "Texhnolyze",              malId: 22,    score: 8.1, genre: "Sci-Fi Noir",   match: 89, grad: "from-gray-900 to-slate-950"    },
    ]},
    { short: "Romance gut-punch",      full: "Romance that hits like a truck in the last episode",       results: [
      { title: "Clannad: After Story",    malId: 4181,  score: 9.0, genre: "Drama",         match: 99, grad: "from-rose-950 to-slate-900"    },
      { title: "Anohana",                 malId: 9989,  score: 8.7, genre: "Drama",         match: 95, grad: "from-pink-950 to-slate-900"    },
      { title: "Your Lie in April",       malId: 23273, score: 8.7, genre: "Music / Drama", match: 93, grad: "from-orange-950 to-slate-900"  },
    ]},
  ]
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive(i => (i + 1) % PROMPTS.length), 4000)
    return () => clearInterval(id)
  }, [PROMPTS.length])

  return (
    <section className="min-h-screen py-28 relative z-[2] overflow-hidden bg-[#050509] flex items-center">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 70% at 78% 50%, rgba(245,158,11,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 10% 30%, rgba(99,102,241,0.04) 0%, transparent 55%)",
      }} />
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)",
      }} />

      <div className="max-w-7xl mx-auto px-6 w-full relative">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-16 lg:gap-20 items-center">

          {/* ── LEFT ── */}
          <div className="space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/15 bg-amber-500/[0.04] mb-7"
              >
                <span className="relative inline-flex h-1.5 w-1.5">
                  <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute inset-0 rounded-full bg-amber-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300/80">AI Discovery</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[clamp(2.4rem,4.4vw,4rem)] font-black tracking-[-0.025em] text-white leading-[1.02] mb-6"
              >
                Tell us how you<br />
                <span
                  className="italic"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fde68a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  want to feel.
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-white/45 text-[15px] leading-relaxed max-w-[42ch]"
              >
                Forget genre tags. Our AI matches anime to your mood — a vibe,
                a feeling, the exact moment you&apos;re chasing.
              </motion.p>
            </div>

            {/* Example prompts */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/30">Try asking for</p>
                <span className="h-px flex-1 bg-gradient-to-r from-white/8 to-transparent" />
              </div>
              <div className="space-y-2">
                {PROMPTS.map((p, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setActive(i)}
                    className={`group w-full text-left pl-4 pr-5 py-3.5 rounded-xl border transition-all flex items-center gap-3.5 relative overflow-hidden ${
                      active === i
                        ? "border-amber-500/30 bg-gradient-to-r from-amber-500/[0.06] to-transparent text-white/90"
                        : "border-white/[0.06] bg-white/[0.015] text-white/40 hover:border-white/[0.12] hover:bg-white/[0.03] hover:text-white/70"
                    }`}
                  >
                    {/* Active indicator bar */}
                    {active === i && (
                      <motion.span
                        layoutId="prompt-bar"
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-amber-400"
                      />
                    )}
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                      active === i ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-white/15 group-hover:bg-white/30"
                    }`} />
                    <span className="text-[13px] font-medium leading-snug">&ldquo;{p.full}&rdquo;</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <Link href="/ai-discover"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-[0.18em] text-black transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                boxShadow: "0 8px 28px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              <Sparkles size={13} className="group-hover:rotate-12 transition-transform" />
              Try AI Discovery
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* ── RIGHT — discovery card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            {/* Glow halo */}
            <div className="absolute -inset-px rounded-[20px] pointer-events-none" style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(255,255,255,0.02) 35%, rgba(99,102,241,0.10))",
              filter: "blur(2px)",
            }} />

            <div className="relative rounded-[18px] bg-gradient-to-b from-[#0d0d18]/95 to-[#08080f]/95 border border-white/[0.08] overflow-hidden backdrop-blur-xl"
              style={{ boxShadow: "0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02) inset" }}
            >

              {/* Header */}
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-7 w-7 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
                    <Sparkles size={12} className="text-amber-400" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[11.5px] font-bold text-white/85">Neural Oracle</span>
                    <span className="text-[8.5px] font-medium uppercase tracking-[0.2em] text-white/30 mt-0.5">v2.4 · matching engine</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-emerald-500/15 bg-emerald-500/[0.06]">
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <motion.span animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute inset-0 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-[9px] text-emerald-300/85 font-bold uppercase tracking-[0.15em]">Live</span>
                </div>
              </div>

              {/* Active prompt */}
              <div className="px-6 pt-5 pb-5 relative">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.22em] text-white/25 mb-3">Searching for</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.28 }}
                    className="flex items-start gap-2"
                  >
                    <p className="text-[15.5px] font-semibold text-white/95 leading-snug tracking-[-0.01em]">
                      &ldquo;{PROMPTS[active].full}&rdquo;
                    </p>
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-[2px] h-[18px] bg-amber-400 mt-[3px] shrink-0"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Quick-select pills */}
              <div className="px-6 pb-5 flex flex-wrap gap-1.5">
                {PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-[0.04em] transition-all ${
                      active === i
                        ? "bg-amber-500 text-black shadow-[0_2px_12px_rgba(245,158,11,0.35)]"
                        : "bg-white/[0.025] text-white/40 border border-white/[0.07] hover:bg-white/[0.06] hover:text-white/70 hover:border-white/[0.12]"
                    }`}
                  >
                    {p.short}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="border-t border-white/[0.06]">
                <div className="px-6 py-3 flex items-center justify-between bg-white/[0.015]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Top Matches</p>
                  <span className="text-[9.5px] text-amber-400/70 font-bold tabular-nums">3 results</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {PROMPTS[active].results.map((result, i) => (
                      <AIResultRow key={result.title} {...result} index={i} />
                    ))}
                  </motion.div>
                </AnimatePresence>

                <Link
                  href="/ai-discover"
                  className="group flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-[11px] font-bold text-amber-400/80 group-hover:text-amber-300 transition-colors uppercase tracking-[0.18em]">
                    Open AI Discovery
                  </span>
                  <span className="flex items-center gap-1 text-amber-400/60 group-hover:text-amber-300 transition-all group-hover:translate-x-0.5">
                    <ArrowRight size={12} />
                  </span>
                </Link>
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
  const animeTotalApprox = discoverPosts?.meta?.total ?? 30161

  return (
    <section className="min-h-screen py-28 bg-[#06060d] relative z-[2] overflow-hidden flex items-center">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 70% at 88% 50%, rgba(245,158,11,0.05) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 8% 30%, rgba(99,102,241,0.04) 0%, transparent 55%)",
      }} />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)",
      }} />

      <div className="max-w-7xl mx-auto px-6 w-full relative">
        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-16 lg:gap-20 items-center">

          {/* Left */}
          <div className="space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/15 bg-amber-500/[0.04] mb-7"
              >
                <span className="relative inline-flex h-1.5 w-1.5">
                  <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute inset-0 rounded-full bg-amber-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300/80">Community</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[clamp(2.4rem,4.6vw,4rem)] font-black tracking-[-0.025em] text-white leading-[1.02] mb-6"
              >
                Every episode<br />
                <span
                  className="italic"
                  style={{
                    backgroundImage: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fde68a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  builds your legacy.
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-white/45 text-[15px] leading-relaxed max-w-[42ch]"
              >
                Earn XP for every episode you watch. Build streaks, unlock titles,
                and compete on a global leaderboard that rewards dedication —
                not just activity.
              </motion.p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Flame,  label: "Daily Streaks",   desc: "Watch daily to compound XP.",    iconColor: "text-orange-400",  iconBg: "from-orange-500/20 to-orange-600/5",  ring: "border-orange-500/20" },
                { icon: Trophy, label: "Leaderboard",     desc: "Rank globally by season.",       iconColor: "text-amber-400",   iconBg: "from-amber-500/20 to-amber-600/5",    ring: "border-amber-500/20"  },
                { icon: Star,   label: "Badges & Titles", desc: "100+ achievements to unlock.",   iconColor: "text-violet-400",  iconBg: "from-violet-500/20 to-violet-600/5",  ring: "border-violet-500/20" },
                { icon: Users,  label: "Social Feed",     desc: "Follow fans with similar taste.", iconColor: "text-emerald-400", iconBg: "from-emerald-500/20 to-emerald-600/5", ring: "border-emerald-500/20" },
              ].map(({ icon: Icon, label, desc, iconColor, iconBg, ring }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -2 }}
                  className="group relative p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.07] hover:border-white/[0.14] transition-colors overflow-hidden"
                >
                  <div className="absolute -top-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${iconBg} border ${ring} flex items-center justify-center mb-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`}>
                    <Icon size={14} className={iconColor} />
                  </div>
                  <p className="text-[13px] font-bold text-white/90 mb-1 tracking-[-0.005em]">{label}</p>
                  <p className="text-[11px] text-white/40 leading-snug">{desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 pt-7 border-t border-white/[0.06]"
            >
              {[
                { v: "4.2M",                              l: "Episodes tracked"      },
                { v: `${animeTotalApprox.toLocaleString()}+`, l: "Anime catalogued"  },
                { v: "8.4",                               l: "Avg community rating"  },
              ].map(({ v, l }, i) => (
                <div key={l} className={`${i > 0 ? "pl-6 border-l border-white/[0.05]" : ""}`}>
                  <p className="text-[22px] font-black text-white tracking-[-0.02em] leading-none tabular-nums">{v}</p>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/30 mt-2">{l}</p>
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
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-[0.18em] text-black transition-all hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg,#fbbf24,#f59e0b)",
                  boxShadow: "0 8px 28px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
                }}
              >
                <Trophy size={13} className="group-hover:rotate-[-6deg] transition-transform" />
                View Leaderboard
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] text-[12px] font-bold uppercase tracking-[0.18em] text-white/55 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
              >
                Join Free
              </Link>
            </motion.div>
          </div>

          {/* Right — leaderboard widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative space-y-3"
          >
            {/* Glow halo */}
            <div className="absolute -inset-px rounded-[20px] pointer-events-none" style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(255,255,255,0.02) 35%, rgba(99,102,241,0.10))",
              filter: "blur(2px)",
            }} />

            {/* Top fan spotlight */}
            <div className="relative flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/[0.10] via-amber-500/[0.04] to-transparent border border-amber-500/[0.18] overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-500/15 border border-amber-400/25 flex items-center justify-center text-lg font-black text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                  O
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-[#06060d] flex items-center justify-center shadow-md">
                  <span className="text-[8.5px] font-black text-black">1</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 relative">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-white tracking-[-0.01em]">Otaku_Arch</p>
                  <span className="text-[8.5px] px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25 text-amber-300/90 font-bold uppercase tracking-[0.1em]">Legendary</span>
                </div>
                <p className="text-[11.5px] text-white/45 mt-1 font-medium">42-day streak · 1.2M XP this season</p>
              </div>
              <div className="text-right shrink-0 relative">
                <div className="flex items-baseline gap-1 justify-end">
                  <Flame size={14} className="text-orange-400" fill="currentColor" />
                  <p className="text-[22px] font-black text-orange-300 leading-none tabular-nums" style={{
                    backgroundImage: "linear-gradient(135deg, #fb923c, #f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>42</p>
                </div>
                <p className="text-[9px] text-white/30 font-medium uppercase tracking-[0.14em] mt-1">day streak</p>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#0d0d18]/95 to-[#08080f]/95 border border-white/[0.08] overflow-hidden backdrop-blur-xl"
              style={{ boxShadow: "0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02) inset" }}
            >
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.18em]">Top fans this week</span>
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                  <Trophy size={12} className="text-amber-400" />
                </div>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {[
                  { rank: 1, name: "Otaku_Arch",    title: "Legendary",   xp: "1.2M", pct: 88, streak: 42 },
                  { rank: 2, name: "ShadowWatcher", title: "Arch-Mage",   xp: "840K", pct: 70, streak: 31 },
                  { rank: 3, name: "Void_Seeker",   title: "Elite Jonin", xp: "620K", pct: 55, streak: 22 },
                  { rank: 4, name: "NightOwl_88",   title: "Jonin",       xp: "410K", pct: 40, streak: 17 },
                ].map(({ rank, name, title, xp, pct, streak }, i) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="group flex items-center gap-3.5 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer relative"
                  >
                    <span className={`text-[12px] font-black w-4 text-center shrink-0 tabular-nums ${
                      rank === 1 ? "text-amber-400" : rank === 2 ? "text-white/55" : rank === 3 ? "text-amber-600/70" : "text-white/25"
                    }`}>{rank}</span>

                    <div className={`relative w-9 h-9 rounded-xl border flex items-center justify-center text-[11px] font-black shrink-0 ${
                      rank === 1 ? "bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-300" : "bg-white/[0.04] border-white/[0.08] text-white/55"
                    }`}>
                      {name[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-[12.5px] font-bold text-white/85 group-hover:text-amber-200 transition-colors tracking-[-0.005em]">{name}</p>
                        <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/35 bg-white/[0.05] border border-white/[0.06] px-1.5 py-0.5 rounded shrink-0">{title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: "linear-gradient(90deg, #fbbf24, #f59e0b)" }}
                          />
                        </div>
                        <span className="text-[9.5px] text-white/30 font-bold shrink-0 tabular-nums">{xp}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-1">
                      <p className="text-[12px] font-bold text-orange-400/85 tabular-nums">{streak}d</p>
                      <p className="text-[8px] text-white/20 font-medium uppercase tracking-[0.12em] mt-0.5">streak</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link
                href="/leaderboard"
                className="group flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
              >
                <span className="text-[11px] font-bold text-amber-400/80 group-hover:text-amber-300 transition-colors uppercase tracking-[0.18em]">
                  View Full Leaderboard
                </span>
                <ArrowRight size={12} className="text-amber-400/60 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
              </Link>
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
                  <div className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500/70" : "bg-amber-500/70"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className={`text-[8px] font-medium shrink-0 ${pct === 100 ? "text-emerald-400/60" : "text-amber-400/50"}`}>{status}</span>
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
    <section className="py-32 bg-[#06060d] relative z-[2] overflow-hidden">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 50% 50% at 50% 30%, rgba(245,158,11,0.04) 0%, transparent 60%)",
      }} />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
        maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%)",
      }} />

      <div className="max-w-7xl mx-auto px-6 w-full relative">

        <div className="mb-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/15 bg-amber-500/[0.04] mb-7"
          >
            <span className="relative inline-flex h-1.5 w-1.5">
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute inset-0 rounded-full bg-amber-400" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300/80">Platform</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2.4rem,4.6vw,4rem)] font-black tracking-[-0.025em] text-white leading-[1.02] mb-5"
          >
            Everything you need,<br />
            <span
              className="italic"
              style={{
                backgroundImage: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fde68a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              in one place.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/45 text-[15px] leading-relaxed max-w-[52ch]"
          >
            Three studios in one platform — built for serious fans who treat
            anime as identity, not entertainment.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {FEATURES.map(({ tag, title, desc, href, accent, preview }, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl overflow-hidden"
            >
              {/* Border halo */}
              <div className="absolute -inset-px rounded-[18px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: `linear-gradient(135deg, ${
                  accent === "indigo" ? "rgba(99,102,241,0.25)" :
                  accent === "amber" ? "rgba(245,158,11,0.30)" : "rgba(139,92,246,0.25)"
                }, rgba(255,255,255,0.02) 40%, transparent)`,
                filter: "blur(2px)",
              }} />

              <div className="relative h-full p-7 rounded-2xl bg-gradient-to-b from-[#0d0d18]/95 to-[#08080f]/95 border border-white/[0.08] backdrop-blur-xl transition-colors group-hover:border-white/[0.14] flex flex-col gap-6"
                style={{ boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset" }}
              >
                {/* Top edge accent */}
                <div className="absolute -top-px left-4 right-4 h-px" style={{
                  background: `linear-gradient(90deg, transparent, ${
                    accent === "indigo" ? "rgba(99,102,241,0.4)" :
                    accent === "amber" ? "rgba(245,158,11,0.5)" : "rgba(139,92,246,0.4)"
                  }, transparent)`,
                }} />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.22em] px-2.5 py-1.5 rounded-md border ${
                      accent === "indigo" ? "text-indigo-300/90 bg-indigo-500/10 border-indigo-500/20" :
                      accent === "amber" ? "text-amber-300/90 bg-amber-500/10 border-amber-500/20" :
                      "text-violet-300/90 bg-violet-500/10 border-violet-500/20"
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        accent === "indigo" ? "bg-indigo-400" :
                        accent === "amber" ? "bg-amber-400" : "bg-violet-400"
                      }`} />
                      {tag}
                    </span>
                    <span className="text-[10px] font-mono text-white/15 tabular-nums">0{i + 1}</span>
                  </div>
                  <h3 className="text-[18px] font-bold text-white leading-tight mb-3 tracking-[-0.015em]">{title}</h3>
                  <p className="text-[13px] text-white/45 leading-relaxed">{desc}</p>
                </div>

                {/* Mock preview */}
                <div className="flex-1 p-4 rounded-xl bg-black/30 border border-white/[0.05] backdrop-blur-sm">
                  {preview}
                </div>

                <Link
                  href={href}
                  className={`group/link inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] transition-all ${
                    accent === "indigo" ? "text-indigo-300/80 hover:text-indigo-200" :
                    accent === "amber" ? "text-amber-300/80 hover:text-amber-200" :
                    "text-violet-300/80 hover:text-violet-200"
                  }`}
                >
                  Explore <ArrowRight size={11} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600 blur-[180px] rounded-full pointer-events-none"
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
                { v: "30K+", l: "Anime catalogued"  },
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
        className="fixed top-0 left-0 right-0 h-[2px] bg-amber-500 z-[200] origin-left opacity-60"
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
