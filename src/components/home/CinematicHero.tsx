"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion"
import { ArrowRight, ChevronDown, Sparkles, Star } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"

/* ── Mouse parallax ── */
function usePointer() {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 40, damping: 25 })
  const y = useSpring(rawY, { stiffness: 40, damping: 25 })
  useEffect(() => {
    const move = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2)
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener("mousemove", move, { passive: true })
    return () => window.removeEventListener("mousemove", move)
  }, [rawX, rawY])
  return { x, y }
}

/* ── Fallback card data (used when API hasn't loaded) ── */
const FALLBACKS = [
  { title: "Frieren: Beyond Journey's End", score: 9.4, genre: "Fantasy" },
  { title: "Steins;Gate",                   score: 9.1, genre: "Sci-Fi"  },
  { title: "Fullmetal Alchemist: Brotherhood", score: 9.1, genre: "Action" },
  { title: "Hunter x Hunter (2011)",         score: 9.0, genre: "Adventure" },
  { title: "Monster",                        score: 8.9, genre: "Thriller" },
]

const CARD_BG = [
  ["#1e1b4b", "#312e81"],
  ["#0f172a", "#1e3a5f"],
  ["#1a0533", "#2d1b69"],
  ["#0d1a2d", "#1a3044"],
  ["#1a0e33", "#2d1069"],
]

interface CardProps {
  title: string
  image?: string | null
  score: number
  genre?: string
  bgIdx: number
  delay: number
  w: number
  h: number
}

function PosterCard({ title, image, score, genre, bgIdx, delay, w, h }: CardProps) {
  const [from, to] = CARD_BG[bgIdx % CARD_BG.length]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -7, scale: 1.03, transition: { duration: 0.18, ease: "easeOut" } }}
      className="relative rounded-xl overflow-hidden cursor-pointer flex-none"
      style={{
        width: w,
        height: h,
        boxShadow: "0 24px 48px rgba(0,0,0,0.7), 0 6px 14px rgba(0,0,0,0.4)",
      }}
    >
      {image
        ? <Image src={image} alt={title} fill className="object-cover" sizes="180px" />
        : <div className="absolute inset-0" style={{ background: `linear-gradient(140deg, ${from}, ${to})` }} />
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-transparent to-transparent" />

      <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/55 backdrop-blur-sm border border-white/[0.08]">
        <Star size={7} className="fill-accent-bright text-accent-bright" />
        <span className="text-[9px] font-semibold text-foreground">{score.toFixed(1)}</span>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-2.5">
        {genre && <p className="text-[7px] uppercase tracking-wider text-subtle mb-0.5">{genre}</p>}
        <p className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2">{title}</p>
      </div>
    </motion.div>
  )
}

export default function CinematicHero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const ptr = usePointer()

  const textY    = useTransform(scrollYProgress, [0, 1], [0, -60])
  const textOp   = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const rightOp  = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const scrollOp = useTransform(scrollYProgress, [0, 0.14], [1, 0])

  const p1x = useTransform(ptr.x, (v: number) => v * 5)
  const p1y = useTransform(ptr.y, (v: number) => v * 4)
  const p2x = useTransform(ptr.x, (v: number) => v * -4)
  const p2y = useTransform(ptr.y, (v: number) => v * -3)
  const p3x = useTransform(ptr.x, (v: number) => v * 6)
  const p3y = useTransform(ptr.y, (v: number) => v * 4)

  const { data } = useBrowseAnime({ limit: 20 })
  const top5 = [...(data?.data ?? [])]
    .filter(a => a.score && a.imageUrl)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5)

  function card(i: number): CardProps {
    const a = top5[i]
    if (a) return { title: a.title, image: a.imageUrl, score: a.score ?? 0, genre: a.genres?.[0], bgIdx: i, delay: 0, w: 0, h: 0 }
    const f = FALLBACKS[i] ?? FALLBACKS[0]
    return { title: f.title, image: null, score: f.score, genre: f.genre, bgIdx: i, delay: 0, w: 0, h: 0 }
  }

  return (
    <section ref={ref} className="relative w-full min-h-screen" style={{ overflow: "clip", background: "var(--app-bg)" }}>

      {/* Ambient background — subtle, not distracting */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 60% 55% at -8% -8%, rgba(79,70,229,0.11) 0%, transparent 50%)",
        }} />
        <div className="absolute inset-0 opacity-[0.022]" style={{
          backgroundImage: "radial-gradient(circle, color-mix(in srgb, var(--app-fg) 90%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[var(--app-bg)] to-transparent" />
      </div>

      {/* Main layout */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-16 min-h-screen flex flex-col lg:flex-row items-center">

        {/* ── LEFT: Copy ── */}
        <motion.div
          className="flex-1 flex flex-col justify-center py-28 lg:py-0 z-20"
          style={{ y: textY, opacity: textOp }}
        >
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] mb-8 w-fit"
          >
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
            />
            <span className="text-[11px] text-muted font-medium">Open Beta · Free forever</span>
          </motion.div>

          {/* Headline */}
          <div className="mb-6">
            {["Track. Rate.", "Discover your", "anime universe."].map((line, i) => (
              <div key={i} className="overflow-hidden">
                <motion.h1
                  initial={{ y: "106%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.82, delay: 0.28 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className={`font-bold tracking-tight leading-[1.06] text-[clamp(2.8rem,5.2vw,5rem)] ${
                    i === 2 ? "text-accent-bright" : "text-foreground"
                  }`}
                >
                  {line}
                </motion.h1>
              </div>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.76, duration: 0.5 }}
            className="text-muted text-[1.05rem] leading-relaxed mb-8 max-w-[40ch] font-normal"
          >
            Build your watchlist, rate every episode, and let{" "}
            <span className="text-muted font-medium">AI-powered discovery</span>{" "}
            surface the shows made for exactly how you think.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.88, duration: 0.5 }}
            className="flex flex-wrap gap-3 mb-10"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200 text-black"
              style={{
                background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))",
                boxShadow: "0 4px 24px color-mix(in srgb, var(--app-accent) 40%, transparent), 0 0 0 1px color-mix(in srgb, var(--app-accent) 30%, transparent)",
              }}
            >
              Get started — it&apos;s free
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-150" />
            </Link>
            <Link
              href="/bestanimelist"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.1] text-muted hover:text-foreground hover:bg-surface text-sm font-medium transition-all duration-150"
            >
              Browse catalog
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="flex items-center pt-5 border-t border-white/[0.06]"
          >
            {[
              { v: "12.4k",  l: "Members" },
              { v: "30,161", l: "Anime in archive" },
              { v: "4.2M",   l: "Episodes tracked" },
            ].map(({ v, l }, i) => (
              <div key={l} className={`${i > 0 ? "pl-5 ml-5 border-l border-white/[0.06]" : ""}`}>
                <p className="text-base font-black tracking-tighter"
                  style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {v}
                </p>
                <p className="text-[11px] text-subtle mt-0.5">{l}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Poster grid ── */}
        <motion.div
          className="hidden lg:flex flex-none items-center justify-center overflow-hidden"
          style={{ width: "46%", opacity: rightOp }}
        >
          <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">

            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(79,70,229,0.06) 0%, transparent 70%)",
            }} />

            {/* 3-column staggered layout — fixed card widths to stay in container */}
            <div className="flex items-start gap-2.5 relative z-10">

              {/* Col A */}
              <motion.div className="flex flex-col gap-2.5" style={{ x: p1x, y: p1y }}>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}>
                  <PosterCard {...card(0)} bgIdx={0} delay={0.45} w={136} h={205} />
                </motion.div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
                  <PosterCard {...card(3)} bgIdx={3} delay={0.65} w={136} h={118} />
                </motion.div>
              </motion.div>

              {/* Col B — offset down */}
              <motion.div className="flex flex-col gap-2.5 mt-12" style={{ x: p2x, y: p2y }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
                  <PosterCard {...card(1)} bgIdx={1} delay={0.53} w={136} h={185} />
                </motion.div>
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4.9, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}>
                  <PosterCard {...card(4)} bgIdx={4} delay={0.72} w={136} h={136} />
                </motion.div>
              </motion.div>

              {/* Col C */}
              <motion.div className="flex flex-col gap-2.5 -mt-2" style={{ x: p3x, y: p3y }}>
                <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 5.9, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
                  <PosterCard {...card(2)} bgIdx={2} delay={0.59} w={136} h={208} />
                </motion.div>

                {/* AI match chip */}
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.88, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="w-[136px] p-3 rounded-xl border border-accent/[0.14] bg-accent/[0.06]"
                    style={{ backdropFilter: "blur(12px)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={10} className="text-accent-bright shrink-0" />
                      <span className="text-[10px] text-accent-bright/60 font-medium">AI Match</span>
                    </div>
                    <p className="text-[12px] font-semibold text-foreground">98% for you</p>
                    <p className="text-[9px] text-subtle mt-0.5">Based on your taste</p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right + bottom edge fades to clip overhang */}
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-[var(--app-bg)] pointer-events-none z-20" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--app-bg)] to-transparent pointer-events-none z-20" />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        style={{ opacity: scrollOp }}
      >
        <span className="text-[9px] text-subtle uppercase tracking-[0.45em]">Scroll</span>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={13} className="text-subtle" />
        </motion.div>
      </motion.div>
    </section>
  )
}
