"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Zap, Star, Users, Flame, Trophy, Play, ChevronDown, Sparkles, Command } from "lucide-react"
import { ANIME_DB } from "@/lib/data/anime"

/* ─── SECTION 1: HERO ─── */
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      mouseX.set((e.clientX / innerWidth - 0.5) * 40)
      mouseY.set((e.clientY / innerHeight - 0.5) * 40)
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [mouseX, mouseY])

  const TOP_AIRING = ANIME_DB.filter(a => a.status === "airing").slice(0, 3)

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden bg-[#020202]">
      {/* Particle field */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px bg-indigo-400/60 rounded-full"
            style={{
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 23 + 10) % 100}%`,
              boxShadow: "0 0 6px 2px rgba(99,102,241,0.4)",
            }}
            animate={{
              y: [0, -(20 + i * 3), 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      {/* Dynamic glow that tracks mouse */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          x: springX,
          y: springY,
          left: "30%",
          top: "20%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          x: useTransform(springX, v => -v * 0.5),
          y: useTransform(springY, v => -v * 0.5),
          right: "15%",
          top: "30%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none" />

      <motion.div style={{ y, opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center min-h-screen">

        {/* LEFT — Copy */}
        <div className="space-y-8 pt-28 lg:pt-0">
          {/* Chapter badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-indigo-300/80">
              Neural Archive Protocol V4.0
            </span>
          </motion.div>

          {/* Mega headline */}
          <div className="space-y-2">
            {["Your Next", "Favorite Anime", "Exists."].map((line, i) => (
              <div key={line} className="overflow-hidden">
                <motion.h1
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`font-black leading-none uppercase tracking-tighter ${
                    i === 1
                      ? "text-[clamp(2.8rem,7vw,6.5rem)] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 italic"
                      : "text-[clamp(2.8rem,7vw,6.5rem)] text-white"
                  }`}
                >
                  {line}
                </motion.h1>
              </div>
            ))}
          </div>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="text-white/45 text-lg leading-relaxed max-w-md font-medium"
          >
            Stop scrolling through the same lists. Let our{" "}
            <span className="text-white/80 italic font-bold">Neural Oracle</span> surface the anime that was made for exactly the way you think.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex flex-wrap gap-4"
          >
            <Link href="/ai-discover"
              className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 text-sm font-black uppercase tracking-widest text-white overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.45)] hover:shadow-[0_0_70px_rgba(99,102,241,0.7)] transition-all hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%] animate-[shimmer_3s_linear_infinite]" />
              <Sparkles size={14} className="relative z-10" />
              <span className="relative z-10">Enter Neural Oracle</span>
              <ArrowRight size={13} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/bestanimelist"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-white/12 bg-white/[0.04] text-sm font-black uppercase tracking-widest text-white/60 backdrop-blur-md hover:bg-white/[0.08] hover:text-white hover:border-white/20 hover:-translate-y-0.5 transition-all"
            >
              <Play size={13} /> Browse Archive
            </Link>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-8 pt-4 border-t border-white/[0.06]"
          >
            {[["12.4k", "Shinobi"], ["1.2M+", "Archives"], ["98.4%", "Accuracy"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-xl font-black tracking-tighter text-white">{v}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-0.5">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Floating UI preview */}
        <div className="relative hidden lg:flex items-center justify-center h-[70vh]">
          {/* Floating anime cards */}
          {TOP_AIRING.map((anime, i) => (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, scale: 0.8, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                x: springX,
                y: springY,
                position: "absolute",
                top: `${[15, 40, 65][i]}%`,
                left: `${[10, 40, 20][i]}%`,
                zIndex: [3, 5, 2][i],
                rotate: [-6, 0, 5][i],
              }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              className="w-40 h-56 rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] cursor-pointer"
            >
              <Image src={anime.image} alt={anime.title} fill className="object-cover" sizes="160px" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                <p className="text-[9px] font-black text-white uppercase tracking-wider truncate">{anime.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={8} fill="#f59e0b" className="text-amber-400" />
                  <span className="text-[8px] text-white/70 font-bold">{anime.rating.toFixed(1)}</span>
                </div>
              </div>
              {/* Live badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[7px] font-black text-emerald-400">LIVE</span>
              </div>
            </motion.div>
          ))}

          {/* Floating XP card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            style={{ x: useTransform(springX, v => v * 0.3), y: useTransform(springY, v => v * 0.3) }}
            className="absolute bottom-[15%] right-[5%] w-52 p-4 rounded-2xl bg-[#0c0c0c]/90 border border-indigo-500/25 backdrop-blur-xl shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 flex items-center justify-center">
                <Zap size={13} className="text-indigo-400" fill="currentColor" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/70">Streak Active</p>
                <p className="text-xs font-black text-white">22 Day Streak 🔥</p>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "78%" }} transition={{ delay: 1.2, duration: 1 }}
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full"
              />
            </div>
            <p className="text-[8px] text-white/25 mt-1.5 font-mono">+840 XP this week</p>
          </motion.div>

          {/* Cmd+K hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="absolute top-[8%] right-[8%] flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md"
          >
            <Command size={11} className="text-white/30" />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">K · Search</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/20">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ChevronDown size={16} className="text-white/20" />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ─── SECTION 2: DISCOVERY ─── */
function DiscoverySection() {
  const CATEGORIES = [
    { label: "Hidden Gems",     count: 487,  color: "from-amber-600/30 to-amber-900/10",  text: "text-amber-400",   border: "border-amber-500/20" },
    { label: "Dark Fantasy",    count: 312,  color: "from-violet-600/30 to-violet-900/10",text: "text-violet-400",  border: "border-violet-500/20"},
    { label: "Psychological",   count: 198,  color: "from-rose-600/30 to-rose-900/10",    text: "text-rose-400",    border: "border-rose-500/20"  },
    { label: "Underrated",      count: 654,  color: "from-emerald-600/30 to-emerald-900/10",text:"text-emerald-400",border: "border-emerald-500/20"},
  ]

  const FEATURED = ANIME_DB.filter(a => a.rating >= 8.8).slice(0, 6)

  return (
    <section className="min-h-screen py-24 bg-[#030303] relative overflow-hidden flex items-center">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-4"
            >
              Chapter 02 — Discovery Engine
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[clamp(2.5rem,6vw,5.5rem)] font-black tracking-tighter text-white uppercase italic leading-none"
            >
              Discover the<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Undiscovered.
              </span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/35 text-sm max-w-xs leading-relaxed"
          >
            The algorithm is dead. We match you to anime based on how you actually think — not what everyone else is watching.
          </motion.p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map(({ label, count, color, text, border }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group relative p-7 rounded-[2rem] bg-gradient-to-br ${color} border ${border} cursor-pointer overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/[0.03]" />
              <p className="text-4xl font-black tracking-tighter text-white mb-1">{count}</p>
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${text}`}>{label}</p>
              <ArrowRight size={16} className={`${text} absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1`} />
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
                  <Star size={8} fill="#f59e0b" className="text-amber-400" />
                  <span className="text-[8px] text-white/60">{anime.rating.toFixed(1)}</span>
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
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            View Full Archive <ArrowRight size={13} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── SECTION 3: AI ORACLE ─── */
function AIOracleSection() {
  const PROMPTS = [
    "A slow-burn psychological thriller with no happy ending",
    "Overpowered MC who hides their strength from everyone",
    "Hidden gems from the 2000s that nobody talks about",
    "Romance that hits like a truck in the last episode",
  ]
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive(i => (i + 1) % PROMPTS.length), 3500)
    return () => clearInterval(id)
  }, [PROMPTS.length])

  return (
    <section className="min-h-screen py-24 relative overflow-hidden bg-[#020202] flex items-center">
      {/* Animated glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.25, 0.12] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600 blur-[160px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-violet-700 blur-[140px] rounded-full pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-6 w-full space-y-16">
        <div className="text-center space-y-6">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60"
          >
            Chapter 03 — Neural Oracle
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[clamp(2.5rem,7vw,6rem)] font-black tracking-tighter text-white uppercase italic leading-none"
          >
            Describe what<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400">
              you want to feel.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/35 text-lg max-w-xl mx-auto"
          >
            The first AI that understands anime by emotional fingerprint, not just genre tags.
          </motion.p>
        </div>

        {/* Interactive prompt UI */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="p-1 rounded-[2.5rem] bg-white/[0.02] border border-white/10 shadow-[0_0_80px_rgba(99,102,241,0.15)] backdrop-blur-2xl">
            {/* Terminal header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
              </div>
              <span className="text-[10px] font-mono text-indigo-400/60 uppercase tracking-widest">Neural Query Interface</span>
            </div>

            {/* Prompt display */}
            <div className="px-6 py-8 min-h-[80px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xl md:text-2xl text-white/80 font-medium leading-relaxed"
                >
                  "{PROMPTS[active]}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Suggestion pills */}
            <div className="px-6 pb-4 flex flex-wrap gap-2">
              {PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${
                    active === i
                      ? "bg-indigo-600 text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"
                  }`}
                >
                  {p.slice(0, 30)}…
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <Link href="/ai-discover"
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-sm font-black uppercase tracking-widest text-white transition-all shadow-[0_0_30px_rgba(99,102,241,0.35)]"
              >
                <Sparkles size={14} /> Execute Search
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Connection nodes visualization */}
        <div className="flex justify-center gap-8 flex-wrap">
          {["Action","Psychological","Romance","Fantasy","Seinen","Sci-Fi","Horror","Comedy"].map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.1 }}
              className="px-5 py-2.5 rounded-full border border-indigo-500/20 bg-indigo-500/8 text-xs font-black uppercase tracking-wider text-indigo-400/80 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/15 transition-all"
            >
              {tag}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── SECTION 4: COMMUNITY ─── */
function CommunitySection() {
  return (
    <section className="min-h-screen py-24 bg-[#030303] relative overflow-hidden flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full space-y-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-[9px] font-mono uppercase tracking-[0.4em] text-emerald-400/60"
            >
              Chapter 04 — The Dojo
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-tighter text-white uppercase italic leading-none"
            >
              Join 12,402<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Shinobi.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-white/35 text-lg leading-relaxed max-w-md"
            >
              Track streaks. Earn badges. Climb the Pantheon. Every episode watched builds your legacy in the Neural Archive.
            </motion.p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Flame,  value: "22 Days", label: "Avg Streak",    color: "text-orange-400", bg: "bg-orange-500/10" },
                { icon: Trophy, value: "#812",    label: "Your Rank",     color: "text-amber-400",  bg: "bg-amber-500/10"  },
                { icon: Star,   value: "8.4/10",  label: "Avg Score",     color: "text-indigo-400", bg: "bg-indigo-500/10" },
                { icon: Users,  value: "1,240",   label: "Reads / Week",  color: "text-emerald-400",bg: "bg-emerald-500/10"},
              ].map(({ icon: Icon, value, label, color, bg }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 flex items-center gap-3"
                >
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white tracking-tighter">{value}</p>
                    <p className="text-[9px] text-white/25 uppercase tracking-wider">{label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex gap-3"
            >
              <Link href="/leaderboard"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black uppercase tracking-widest text-white transition-all shadow-[0_0_24px_rgba(16,185,129,0.3)]"
              >
                <Trophy size={13} /> View Pantheon
              </Link>
              <Link href="/community"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-white/10 bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.07] transition-all"
              >
                <Users size={13} /> Join Community
              </Link>
            </motion.div>
          </div>

          {/* Right — floating profile cards */}
          <div className="relative h-[500px]">
            {[
              { name: "Otaku_Arch",    title: "Legendary Shinobi", xp: "1.2M", pos: "top-0 left-4",       rotate: -3 },
              { name: "ShadowWatcher", title: "Arch-Mage",          xp: "840K", pos: "top-16 right-4",     rotate: 3  },
              { name: "Void_Seeker",   title: "Elite Jonin",         xp: "620K", pos: "bottom-16 left-16",  rotate: -2 },
            ].map(({ name, title, xp, pos, rotate }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 80 }}
                animate={{ y: [0, -8, 0] }}
                // @ts-expect-error framer-motion transition override
                transition2={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                style={{ rotate }}
                className={`absolute ${pos} w-56 p-5 rounded-[1.5rem] bg-[#0c0c0c]/90 border border-white/10 backdrop-blur-xl shadow-2xl`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-lg">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{name}</p>
                    <p className="text-[9px] text-indigo-400 font-bold">{title}</p>
                  </div>
                </div>
                <div className="flex justify-between text-[9px] text-white/30 font-mono mb-2">
                  <span>XP</span><span>{xp}</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full" style={{ width: `${[88, 70, 55][i]}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── SECTION 5: FEATURE SHOWCASE (Sticky) ─── */
function ShowcaseSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })

  const FEATURES = [
    {
      chapter: "05 — Track",
      title: "Your archive, perfectly organized.",
      desc: "Every anime you've watched, rated, and reviewed — one place. Status badges, episode progress, personal scores, and notes.",
      color: "from-indigo-600/20 to-indigo-900/5",
      accent: "text-indigo-400",
      href: "/watchlist",
    },
    {
      chapter: "06 — Compete",
      title: "Rise through the Pantheon.",
      desc: "XP from every episode watched. Streaks that compound. Badges that prove you've actually seen it. Real rankings that mean something.",
      color: "from-amber-600/20 to-amber-900/5",
      accent: "text-amber-400",
      href: "/leaderboard",
    },
    {
      chapter: "07 — Create",
      title: "Publish. Build an audience.",
      desc: "Write reviews, long-form blogs, host polls. The Creator Studio turns your anime knowledge into influence.",
      color: "from-violet-600/20 to-violet-900/5",
      accent: "text-violet-400",
      href: "/creators",
    },
  ]

  const activeIndex = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 0, 1, 2])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const unsub = activeIndex.on("change", v => setIdx(Math.min(2, Math.floor(v))))
    return unsub
  }, [activeIndex])

  return (
    <section ref={ref} className="relative bg-[#020202]" style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — sticky content */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-5"
              >
                <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/30">
                  Chapter {FEATURES[idx].chapter}
                </p>
                <h2 className="text-[clamp(2rem,5vw,4rem)] font-black tracking-tighter text-white leading-none">
                  {FEATURES[idx].title}
                </h2>
                <p className="text-white/45 text-lg leading-relaxed max-w-md">
                  {FEATURES[idx].desc}
                </p>
                <Link href={FEATURES[idx].href}
                  className={`inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest ${FEATURES[idx].accent} hover:opacity-80 transition-opacity`}
                >
                  Explore <ArrowRight size={13} />
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex gap-2 pt-4">
              {FEATURES.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === idx ? "w-8 bg-indigo-500" : "w-2 bg-white/15"}`} />
              ))}
            </div>
          </div>

          {/* Right — animated card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              transition={{ duration: 0.5 }}
              className={`p-10 rounded-[3rem] bg-gradient-to-br ${FEATURES[idx].color} border border-white/8 h-80 flex flex-col justify-end`}
            >
              <div className="absolute inset-0 rounded-[3rem] bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]" />
              <p className={`text-6xl font-black tracking-tighter uppercase italic ${FEATURES[idx].accent} opacity-10 absolute top-6 right-8`}>
                {["Track", "Climb", "Create"][idx]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ─── SECTION 6: FINAL CTA ─── */
function FinalCTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center bg-[#020202] relative overflow-hidden py-32">
      {/* Massive glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600 blur-[200px] rounded-full pointer-events-none"
      />

      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC43IiBudW1PY3RhdmVzPSI0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      <motion.div style={{ scale, opacity }} className="relative z-10 text-center max-w-4xl mx-auto px-6 space-y-12">
        <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-indigo-400/60">Final Chapter — Begin</p>

        <h2 className="text-[clamp(3rem,10vw,9rem)] font-black tracking-tighter uppercase italic leading-none text-white">
          Your Legend<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400">
            Starts Here.
          </span>
        </h2>

        <p className="text-white/35 text-xl max-w-lg mx-auto leading-relaxed">
          Abandon the scattered lists. Join 12,402 Shinobi already archiving their legacy.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5">
          <Link href="/register"
            className="group relative flex items-center gap-3 px-10 py-5 rounded-2xl text-base font-black uppercase tracking-widest text-white overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%] animate-[shimmer_3s_linear_infinite]" />
            <span className="relative z-10 flex items-center gap-3">
              <Zap size={18} fill="white" /> Initialize Your Archive
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-white/15 uppercase tracking-widest">
          <span>Free forever</span>
          <span>·</span>
          <span>No credit card</span>
          <span>·</span>
          <span>Join in 30 seconds</span>
        </div>
      </motion.div>
    </section>
  )
}

/* ─── ROOT ─── */
export default function CinematicHomepage() {
  return (
    <main className="bg-[#020202] text-white">
      <HeroSection />
      <DiscoverySection />
      <AIOracleSection />
      <CommunitySection />
      <ShowcaseSection />
      <FinalCTASection />
    </main>
  )
}
