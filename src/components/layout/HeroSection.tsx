"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Trophy, Users, Star, Play, ChevronDown } from "lucide-react";

const CHARACTERS = [
  { src: "/assets/png/tanjiro.png",          alt: "Tanjiro",  z: 0,   delay: 0 },
  { src: "/assets/png/zoro.png",             alt: "Zoro",     z: -20, delay: 0.1 },
  { src: "/assets/png/naruto.png",           alt: "Naruto",   z: -10, delay: 0.05 },
  { src: "/assets/png/goku.png",             alt: "Goku",     z: -30, delay: 0.15 },
  { src: "/assets/png/luffy.png",            alt: "Luffy",    z: -5,  delay: 0.08 },
];

const LIVE_STATS = [
  { icon: Users,  value: 12402, label: "Active Shinobi",  suffix: "" },
  { icon: Trophy, value: 1200000, label: "Archives Logged", suffix: "+" },
  { icon: Star,   value: 984,   label: "Oracle Accuracy", suffix: "‰" },
  { icon: Zap,    value: 22,    label: "Avg Streak Days", suffix: "" },
];

const TICKERS = [
  "Demon Slayer Season 5 — 98.2% hype score",
  "Frieren added to 4,201 archives today",
  "New seasonal poll — vote now",
  "Solo Leveling S2 trending — #1 this week",
  "12,402 Shinobi online right now",
];

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  const formatted =
    target >= 1_000_000
      ? (count / 1_000_000).toFixed(1) + "M"
      : target >= 1_000
      ? (count / 1_000).toFixed(1) + "k"
      : count.toString();

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yChars   = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale    = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);

  useEffect(() => {
    const id = setInterval(() => setTickerIndex(i => (i + 1) % TICKERS.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#020202]"
    >
      {/* ─── LAYER 1: Architectural Grid ─── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,#000_30%,transparent_100%)]" />
      </div>

      {/* ─── LAYER 2: Volumetric Glows ─── */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[20%] w-[700px] h-[700px] bg-indigo-600 blur-[180px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[20%] right-[15%] w-[500px] h-[500px] bg-purple-700 blur-[160px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[10%] right-[30%] w-[400px] h-[400px] bg-rose-700 blur-[150px] rounded-full pointer-events-none"
      />

      {/* ─── LAYER 3: Film Grain ─── */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* ─── CONTENT ─── */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center text-center"
      >
        {/* Live ticker */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 backdrop-blur-xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={tickerIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300/80"
            >
              {TICKERS[tickerIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-white/30 mb-6"
        >
          Neural Archive Protocol // V4.0
        </motion.p>

        {/* Mega headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(3.5rem,12vw,11rem)] font-black tracking-tighter leading-[0.82] uppercase italic text-white"
        >
          Track.{" "}
          <span className="relative inline-block">
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 drop-shadow-[0_0_60px_rgba(99,102,241,0.4)]">
              Rate.
            </span>
            <span className="absolute -inset-2 bg-indigo-500/20 blur-2xl rounded-full pointer-events-none" />
          </span>
          <br />
          Discover<span className="text-indigo-500">.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="mt-8 max-w-2xl text-lg md:text-xl text-white/40 font-medium leading-relaxed tracking-tight"
        >
          Stop scrolling through generic lists. Let our{" "}
          <span className="text-white/80 font-bold italic">Neural Oracle</span> find anime
          that matches your exact psychological profile — and help hidden gems rise to the top.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/ai-discover"
            className="group relative flex items-center gap-3 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_40px_rgba(99,102,241,0.35)] transition-all hover:bg-indigo-500 hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Zap size={16} className="text-indigo-200" />
            Enter Neural Oracle
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/bestanimelist"
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-black uppercase tracking-widest text-white/70 backdrop-blur-md transition-all hover:bg-white/[0.07] hover:text-white hover:border-white/20 hover:-translate-y-0.5"
          >
            <Play size={14} />
            Best Anime List
          </Link>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="mt-16 flex flex-wrap justify-center gap-8 border border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] px-10 py-6"
        >
          {LIVE_STATS.map(({ icon: Icon, value, label, suffix }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.07 }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="flex items-center gap-2">
                <Icon size={14} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                <span className="text-2xl md:text-3xl font-black tracking-tighter text-white">
                  <CountUp target={value} suffix={suffix} />
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ─── CHARACTER SHOWCASE ─── */}
      <motion.div
        style={{ y: yChars }}
        className="relative z-10 mt-16 flex w-full max-w-6xl justify-center items-end gap-2 sm:gap-6 px-4 pb-0"
      >
        {CHARACTERS.map((char, i) => (
          <motion.div
            key={char.alt}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6 + char.delay,
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{ y: -12, transition: { duration: 0.3 } }}
            className="relative flex-shrink-0"
            style={{
              width: i === 2 ? "clamp(160px, 18vw, 240px)" : "clamp(130px, 15vw, 200px)",
              height: i === 2 ? "clamp(220px, 28vw, 340px)" : "clamp(180px, 24vw, 300px)",
              zIndex: i === 2 ? 3 : i % 2 === 0 ? 2 : 1,
            }}
          >
            {/* Character glow */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full blur-2xl opacity-30"
              style={{
                background: `radial-gradient(ellipse, ${
                  ["#6366f1", "#a855f7", "#818cf8", "#c084fc", "#6366f1"][i]
                }, transparent)`,
              }}
            />
            <Image
              src={char.src}
              alt={char.alt}
              fill
              className="object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              sizes="240px"
              priority={i < 3}
              loading={i < 3 ? undefined : "lazy"}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Scroll indicator ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/20">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={18} className="text-white/20" />
        </motion.div>
      </motion.div>

      {/* ─── Bottom gradient fade into next section ─── */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none" />
    </section>
  );
}
