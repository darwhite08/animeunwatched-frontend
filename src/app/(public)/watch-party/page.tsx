"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Users, Play, Link as LinkIcon, Clock, Zap, Shield } from "lucide-react"

const FEATURES = [
  { icon: Users,    title: "Sync Playback",    desc: "Everyone watches frame-for-frame in sync. Pause for one, pause for all." },
  { icon: LinkIcon, title: "Share a Link",      desc: "Generate a party link. Anyone with it can join — no account needed to watch." },
  { icon: Clock,    title: "Live Reactions",    desc: "React with emojis in real-time. See everyone's reactions as they happen." },
  { icon: Zap,      title: "Chat Overlay",      desc: "Built-in chat that doesn't cover the anime. Adjustable position and opacity." },
  { icon: Shield,   title: "Host Controls",     desc: "The host controls playback. Skip, rewind, pause — everyone follows." },
]

export default function WatchPartyPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Hero */}
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div animate={{ scale:[1,1.08,1], opacity:[0.15,0.25,0.15] }} transition={{ duration:8, repeat:Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600 blur-[160px] rounded-full pointer-events-none"
        />
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6 space-y-6 pt-32">
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/25 bg-indigo-500/8"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Coming Soon</span>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none"
          >
            Watch Together<span style={{color:"#f59e0b"}}>.</span>
          </motion.h1>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.2 }}
            className="text-white/40 text-lg leading-relaxed max-w-lg mx-auto"
          >
            Synchronized anime watching with friends — wherever they are. Real-time reactions, chat overlay, and host controls.
          </motion.p>

          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <button
              onClick={() => alert("Watch Party launches Q3 2026 — sign up for early access!")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-sm font-black uppercase tracking-widest text-white transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)]"
            >
              <Play size={14} /> Get Early Access
            </button>
            <Link href="/community" className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
              <Users size={14} /> Join Community
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white text-center mb-8">
          Everything you need for the perfect watch party
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              transition={{ delay: i*0.07 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-indigo-500/20 transition-all group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon size={18} className="text-indigo-400" />
              </div>
              <p className="font-black text-white">{title}</p>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-16 p-8 rounded-[2rem] bg-white/[0.02] border border-white/8 space-y-5">
          <h3 className="text-lg font-black uppercase tracking-tight text-white">Launch Timeline</h3>
          {[
            { phase: "Alpha", date: "Q2 2026", desc: "Private beta for top 100 Shinobi by reputation", done: false },
            { phase: "Beta",  date: "Q3 2026", desc: "Open beta — all registered users", done: false },
            { phase: "v1.0",  date: "Q4 2026", desc: "Full launch with mobile support", done: false },
          ].map(({ phase, date, desc, done }) => (
            <div key={phase} className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-black ${done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30 border border-white/10"}`}>
                {done ? "✓" : phase[0]}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-white/70">{phase}</p>
                  <span className="text-[9px] font-mono text-indigo-400/70 uppercase tracking-widest">{date}</span>
                </div>
                <p className="text-xs text-white/35 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
