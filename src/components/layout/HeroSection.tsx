"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Zap, Users, Star, TrendingUp, Play } from "lucide-react";

const TICKERS = [
  "Frieren: Beyond Journey's End — now trending #1",
  "12,402 Shinobi active right now",
  "New seasonal poll — vote before Sunday",
  "Solo Leveling S2 — 98.4% hype score",
  "Attack on Titan added to 4,201 lists today",
];

const STATS = [
  { value: "12.4k", label: "Active Shinobi",  icon: Users },
  { value: "1.2M+", label: "Archives Logged", icon: Star },
  { value: "98.4%", label: "Oracle Accuracy", icon: TrendingUp },
];

// left, center (tallest), right
const CHARS = [
  { src: "/assets/png/naruto.png",  alt: "Naruto",  w: 148, h: 340, delay: 0.15, zIndex: 10 },
  { src: "/assets/png/tanjiro.png", alt: "Tanjiro", w: 190, h: 430, delay: 0,    zIndex: 20 },
  { src: "/assets/png/goku.png",    alt: "Goku",    w: 160, h: 370, delay: 0.10, zIndex: 10 },
];

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [tickerIdx, setTickerIdx] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const charY  = useTransform(scrollYProgress, [0, 1], [0,  60]);
  const textY  = useTransform(scrollYProgress, [0, 1], [0,  30]);
  const fade   = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setTickerIdx(i => (i + 1) % TICKERS.length), 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen overflow-hidden bg-[#050508] flex flex-col"
    >
      {/* ── BACKGROUND ── */}

      {/* grid */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_70%_90%_at_55%_50%,#000_10%,transparent_100%)]" />
      </div>

      {/* indigo glow — mid-left */}
      <motion.div
        animate={{ scale:[1,1.07,1], opacity:[0.18,0.3,0.18] }}
        transition={{ duration:9, repeat:Infinity, ease:"easeInOut" }}
        className="absolute top-[20%] left-[-5%] w-[480px] h-[480px] bg-accent blur-[160px] rounded-full pointer-events-none"
      />
      {/* violet glow — right, behind characters */}
      <motion.div
        animate={{ scale:[1,1.12,1], opacity:[0.28,0.45,0.28] }}
        transition={{ duration:7, repeat:Infinity, ease:"easeInOut", delay:1.2 }}
        className="absolute top-[5%] right-[-8%] w-[550px] h-[800px] bg-violet-700 blur-[130px] rounded-full pointer-events-none"
      />
      {/* bottom-right accent */}
      <motion.div
        animate={{ scale:[1,1.08,1], opacity:[0.12,0.22,0.12] }}
        transition={{ duration:11, repeat:Infinity, ease:"easeInOut", delay:3 }}
        className="absolute bottom-[-10%] right-[15%] w-[380px] h-[380px] bg-purple-800 blur-[110px] rounded-full pointer-events-none"
      />

      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
        style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`}}
      />

      {/* ── TICKER ── */}
      <motion.div
        initial={{ opacity:0, y:-10 }}
        animate={{ opacity:1, y:0 }}
        transition={{ delay:0.2 }}
        className="relative z-20 flex justify-center pt-28 md:pt-32"
      >
        <div className="flex items-center gap-3 border border-border bg-white/[0.04] backdrop-blur-xl rounded-full px-5 py-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-bright opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={tickerIdx}
              initial={{ opacity:0, y:5 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-5 }}
              transition={{ duration:0.28 }}
              className="text-[10px] font-black uppercase tracking-[0.28em] text-muted"
            >
              {TICKERS[tickerIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── BODY: text left / characters right ── */}
      <div className="relative z-10 flex flex-1 max-w-[1400px] mx-auto w-full px-6 lg:px-12 gap-6">

        {/* LEFT — copy */}
        <motion.div
          style={{ y: textY, opacity: fade }}
          className="flex flex-col justify-center flex-1 space-y-6 md:space-y-7 py-10 max-w-[620px]"
        >
          {/* eyebrow */}
          <motion.p
            initial={{ opacity:0, x:-16 }}
            animate={{ opacity:1, x:0 }}
            transition={{ delay:0.28 }}
            className="text-[9px] font-mono font-black uppercase tracking-[0.48em] text-accent-bright/60"
          >
            Neural Archive Protocol // V4.0
          </motion.p>

          {/* headline — 3 lines, staggered mask reveal */}
          <div className="space-y-[-4px]">
            {[
              { text:"Track",    color:"text-foreground",   dot:"text-accent", italic:false },
              { text:"Rate",     color:"text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400", dot:"text-violet-400", italic:true  },
              { text:"Discover", color:"text-white/90", dot:"text-accent", italic:false },
            ].map(({ text, color, dot, italic }, i) => (
              <div key={text} className="overflow-hidden leading-none">
                <motion.h1
                  initial={{ y:"110%" }}
                  animate={{ y:0 }}
                  transition={{ delay:0.32 + i*0.08, duration:0.65, ease:[0.16,1,0.3,1] }}
                  className={`text-[clamp(3rem,6.5vw,5.8rem)] font-black tracking-tighter leading-[0.88] uppercase ${italic?"italic":""} ${color}`}
                >
                  {text}
                  <span className={`${dot} not-italic`}>.</span>
                </motion.h1>
              </div>
            ))}
          </div>

          {/* subtitle */}
          <motion.p
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:0.58 }}
            className="text-muted text-sm md:text-[0.95rem] leading-relaxed max-w-[420px] font-medium"
          >
            Stop scrolling through generic lists. Let our{" "}
            <span className="text-muted italic font-bold">Neural Oracle</span> surface
            anime that matches your exact taste — and help hidden gems rise.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:0.66 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/ai-discover"
              className="group inline-flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-black hover:-translate-y-0.5 transition-all active:scale-[0.98]" style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)",boxShadow:"0 0 36px rgba(245,158,11,0.4)"}}
            >
              <Zap size={13} className="text-amber-200" />
              Enter Neural Oracle
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/bestanimelist"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-border bg-white/[0.04] px-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-muted backdrop-blur-md hover:bg-white/[0.08] hover:text-foreground hover:border-border hover:-translate-y-0.5 transition-all"
            >
              <Play size={12} />
              Best Anime List
            </Link>
          </motion.div>

          {/* stats */}
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            transition={{ delay:0.8 }}
            className="flex items-center gap-8 pt-4 border-t border-white/[0.07]"
          >
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:0.85+i*0.06 }}
                className="flex flex-col gap-0.5"
              >
                <span className="text-xl md:text-2xl font-black tracking-tighter text-foreground">{value}</span>
                <span className="text-[8px] font-black uppercase tracking-[0.28em] text-white/22">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — characters (desktop) */}
        <motion.div
          style={{ y: charY }}
          className="hidden lg:flex relative flex-shrink-0 w-[42%] xl:w-[44%] items-end justify-center pb-0"
        >
          {/* floor glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[180px] bg-violet-600/25 blur-[55px] rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[220px] h-[100px] bg-accent/30 blur-[35px] rounded-full" />

          {CHARS.map((c, i) => (
            <motion.div
              key={c.alt}
              initial={{ opacity:0, y:40 }}
              animate={{ opacity:1, y:0 }}
              transition={{ delay:0.44+c.delay, duration:0.85, ease:[0.16,1,0.3,1] }}
              whileHover={{ y:-10, transition:{ duration:0.28 } }}
              className="relative shrink-0 select-none"
              style={{
                zIndex: c.zIndex,
                width: c.w,
                height: c.h,
                marginLeft: i === 0 ? 0 : "-28px",
              }}
            >
              {/* per-char glow */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-10 rounded-full blur-2xl opacity-50"
                style={{ background: i===1 ? "rgba(139,92,246,0.55)" : "rgba(99,102,241,0.32)" }}
              />
              <Image
                src={c.src}
                alt={c.alt}
                fill
                className="object-contain object-bottom drop-shadow-[0_20px_55px_rgba(0,0,0,0.75)]"
                sizes="200px"
                priority={i < 2}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* mobile characters */}
      <motion.div
        style={{ y: charY }}
        className="lg:hidden relative flex justify-center items-end w-full h-44 mt-2"
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-20 bg-violet-600/20 blur-[45px] rounded-full" />
        {CHARS.map((c, i) => (
          <motion.div
            key={`m-${c.alt}`}
            initial={{ opacity:0, y:24 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay:0.55+i*0.07 }}
            className="relative h-40 w-24 shrink-0"
            style={{ zIndex: c.zIndex, marginLeft: i>0 ? "-18px" : 0 }}
          >
            <Image
              src={c.src} alt={c.alt} fill
              className="object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
              sizes="96px" priority={false}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none z-10" />
    </section>
  );
}
