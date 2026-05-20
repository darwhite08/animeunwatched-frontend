"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glows */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/4 w-[500px] h-[500px] blur-[160px] rounded-full pointer-events-none"
        style={{ background: "rgba(245,158,11,0.12)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] blur-[130px] rounded-full pointer-events-none"
        style={{ background: "rgba(99,102,241,0.10)" }}
      />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[9px] font-mono font-black uppercase tracking-[0.5em] mb-6"
          style={{ color: "rgba(245,158,11,0.6)" }}
        >
          Error 404 // Archive Not Found
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(6rem,20vw,14rem)] font-black tracking-tighter leading-none uppercase italic mb-6"
          style={{
            backgroundImage: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 30%, rgba(255,255,255,0.15) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-4"
        >
          This archive doesn't exist.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-white/40 text-sm leading-relaxed mb-10"
        >
          The page you're looking for has been moved, deleted, or never existed in the neural archives.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-black transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}
          >
            <Home size={13} /> Go Home
          </Link>
          <Link href="/bestanimelist"
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border border-white/10 bg-white/[0.04] text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/[0.08] transition-all hover:-translate-y-0.5"
          >
            <Search size={13} /> Browse Anime
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border border-white/5 bg-transparent text-xs font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-all"
          >
            <ArrowLeft size={13} /> Go Back
          </button>
        </motion.div>
      </div>
    </div>
  )
}
