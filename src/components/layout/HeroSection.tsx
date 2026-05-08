"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, Users, Star, TrendingUp, Play } from "lucide-react";

/* ─── Data ─── */
const TICKERS = [
  "Frieren: Beyond Journey's End — now trending #1",
  "12,402 Shinobi active right now",
  "New seasonal poll — vote before Sunday",
  "Solo Leveling S2 — 98.4% hype score",
  "Attack on Titan added to 4,201 lists today",
];

const STATS = [
  { value: "12.4k", label: "Active Shinobi",   icon: Users },
  { value: "1.2M",  label: "Archives Logged",  icon: Star },
  { value: "98.4%", label: "Oracle Accuracy",  icon: TrendingUp },
];

// Characters ordered: large center flanked by smaller ones
const CHARACTERS = [
  { src: "/assets/png/naruto.png",  alt: "Naruto", size: "h-[260px] w-[140px] sm:h-[340px] sm:w-[180px]", z: 10, delay: 0.15, x: "-20px" },
  { src: "/assets/png/tanjiro.png", alt: "Tanjiro", size: "h-[320px] w-[170px] sm:h-[420px] sm:w-[220px]", z: 20, delay: 0,    x: "0px"  },
  { src: "/assets/png/goku.png",    alt: "Goku",   size: "h-[280px] w-[150px] sm:h-[360px] sm:w-[190px]", z: 10, delay: 0.10, x: "20px"  },
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tickerIdx, setTickerIdx] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const charY   = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY   = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setTickerIdx(i => (i + 1) % TICKERS.length), 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#020202] flex flex-col"
    >
      {/* ── BACKGROUND LAYERS ── */}

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_80%_at_60%_40%,#000_20%,transparent_100%)]" />
      </div>

      {/* Glow — left (behind text) */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.14, 0.22, 0.14] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] left-[-8%] w-[520px] h-[520px] bg-indigo-600 blur-[160px] rounded-full pointer-events-none"
      />
      {/* Glow — right (behind characters) */}
      <motion.div
        animate={{ scale: [1, 1.10, 1], opacity: [0.20, 0.38, 0.20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute top-[10%] right-[-5%] w-[600px] h-[700px] bg-violet-700 blur-[140px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.10, 0.18, 0.10] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[0%] right-[20%] w-[400px] h-[400px] bg-indigo-800 blur-[120px] rounded-full pointer-events-none"
      />

      {/* Noise grain */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }}
      />

      {/* ── LIVE TICKER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-20 flex justify-center pt-32 pb-0"
      >
        <div className="flex items-center gap-3 border border-white/10 bg-white/[0.04] backdrop-blur-xl rounded-full px-5 py-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={tickerIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-[10px] font-black uppercase tracking-[0.28em] text-white/60"
            >
              {TICKERS[tickerIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── MAIN CONTENT: SPLIT LAYOUT ── */}
      <div className="relative z-10 flex-1 flex items-center max-w-7xl mx-auto w-full px-6 lg:px-10 gap-0 lg:gap-8 pt-10 pb-0">

        {/* LEFT — Copy */}
        <motion.div style={{ y: textY, opacity }} className="flex-1 flex flex-col justify-center space-y-8 pb-10">

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="text-[9px] font-mono font-black uppercase tracking-[0.5em] text-indigo-400/70"
          >
            Neural Archive Protocol // V4.0
          </motion.p>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-0"
          >
            {/* TRACK */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(3.8rem,9vw,8.5rem)] font-black tracking-tighter leading-[0.85] uppercase text-white"
              >
                Track<span className="text-indigo-500">.</span>
              </motion.h1>
            </div>

            {/* RATE — gradient */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.42, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(3.8rem,9vw,8.5rem)] font-black tracking-tighter leading-[0.85] uppercase italic"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400 drop-shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                  Rate
                </span>
                <span className="text-violet-400">.</span>
              </motion.h1>
            </div>

            {/* DISCOVER */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.50, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(3.8rem,9vw,8.5rem)] font-black tracking-tighter leading-[0.85] uppercase text-white/90"
              >
                Discover<span className="text-indigo-500">.</span>
              </motion.h1>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-white/40 text-base lg:text-lg font-medium leading-relaxed max-w-md"
          >
            Stop scrolling through generic lists. Let our{" "}
            <span className="text-white/80 font-bold italic">Neural Oracle</span> surface anime
            that matches your exact taste — and help hidden gems rise.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/ai-discover"
              className="group flex items-center gap-3 rounded-2xl bg-indigo-600 px-7 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:bg-indigo-500 hover:shadow-[0_0_60px_rgba(99,102,241,0.65)] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              <Zap size={14} className="text-indigo-200" />
              Enter Neural Oracle
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/bestanimelist"
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-xs font-black uppercase tracking-widest text-white/60 backdrop-blur-md hover:bg-white/[0.08] hover:text-white hover:border-white/20 hover:-translate-y-0.5 transition-all"
            >
              <Play size={13} />
              Best Anime List
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="flex items-center gap-8 pt-2 border-t border-white/5"
          >
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.07 }}
                className="flex flex-col"
              >
                <span className="text-2xl font-black tracking-tighter text-white">{value}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mt-0.5">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — Characters */}
        <motion.div
          style={{ y: charY }}
          className="hidden lg:flex relative flex-shrink-0 w-[420px] xl:w-[500px] h-[560px] xl:h-[640px] items-end justify-center"
        >
          {/* Character glow plate */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[340px] h-[200px] bg-violet-600/20 blur-[60px] rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[120px] bg-indigo-500/30 blur-[40px] rounded-full" />

          {/* Characters stacked with depth */}
          {CHARACTERS.map((char, i) => (
            <motion.div
              key={char.alt}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + char.delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className={`absolute bottom-0 ${char.size} select-none`}
              style={{
                zIndex: char.z,
                left: i === 0 ? "4%" : i === 2 ? "auto" : "50%",
                right: i === 2 ? "4%" : "auto",
                transform: i === 1 ? "translateX(-50%)" : undefined,
              }}
            >
              {/* Per-character floor glow */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-10 rounded-full blur-xl opacity-60"
                style={{ background: i === 1 ? "rgba(139,92,246,0.5)" : "rgba(99,102,241,0.3)" }}
              />
              <Image
                src={char.src}
                alt={char.alt}
                fill
                className="object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                sizes="220px"
                priority={i < 2}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Mobile characters (below CTAs) ── */}
      <motion.div
        style={{ y: charY }}
        className="lg:hidden relative w-full flex justify-center items-end h-52 mt-4"
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-violet-600/20 blur-[50px] rounded-full" />
        {CHARACTERS.map((char, i) => (
          <motion.div
            key={`mob-${char.alt}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="relative h-48 w-28 shrink-0"
            style={{ zIndex: char.z, marginLeft: i > 0 ? "-24px" : 0 }}
          >
            <Image
              src={char.src}
              alt={char.alt}
              fill
              className="object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
              sizes="112px"
              priority={false}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none z-10" />
    </section>
  );
}
