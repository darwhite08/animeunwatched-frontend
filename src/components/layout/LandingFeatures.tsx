"use client"

import { motion } from "framer-motion"
import { Sparkles, Flame, ShieldCheck, Zap, Target, Fingerprint, Globe, Command } from "lucide-react"

const FEATURES = [
  {
    title: "AI Oracle Network",
    desc: "Our proprietary neural engine doesn't just suggest; it predicts. By analyzing your 'Anime DNA,' the Oracle unearths hidden masterpieces tailored to your psychological profile.",
    details: ["Predictive Scoring", "DNA Mapping", "Seasonal Forecasting"],
    icon: Sparkles,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    span: "md:col-span-8",
    delay: 0.1
  },
  {
    title: "Shinobi Streaks",
    desc: "Consistency is the mark of a master. Track your daily logs with flawless precision.",
    details: ["Flame Grading", "Heatmap Sync"],
    icon: Flame,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    span: "md:col-span-4",
    delay: 0.2
  },
  {
    title: "The Dojo Standings",
    desc: "Compete in the global census. Rise from a Novice to a Legendary Shinobi in the community Hall of Fame.",
    details: ["Global Ranking", "Tier Ascension"],
    icon: Target,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    span: "md:col-span-4",
    delay: 0.3
  },
  {
    title: "The Vault Protocol",
    desc: "Your history is sacred. We provide a military-grade, encrypted archive for your entire viewing and reading legacy, accessible instantly across all transmissions.",
    details: ["Cross-Device Sync", "Offline Archives", "One-Click Import"],
    icon: ShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    span: "md:col-span-8",
    delay: 0.4
  }
]

export default function LandingFeatures() {
  return (
    <section className="py-32 px-8 max-w-[1440px] mx-auto space-y-24 relative overflow-hidden bg-black">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-px h-64 bg-gradient-to-b from-indigo-500/20 to-transparent" />
      <div className="absolute bottom-0 right-1/4 w-px h-64 bg-gradient-to-t from-indigo-500/20 to-transparent" />

      {/* SECTION HEADER */}
      <div className="relative z-10 space-y-6 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]"
        >
          <Command size={14} /> System Capabilities • v2.4
        </motion.div>
        <h2 className="text-6xl md:text-7xl font-black tracking-tighter text-white leading-[0.9]">
          Engineered for the <br />
          <span className="text-indigo-500 italic">Elite 1%.</span>
        </h2>
        <p className="text-white/40 text-lg font-medium leading-relaxed max-w-xl">
          We’ve stripped away the noise of traditional trackers to build a high-fidelity protocol for true enthusiasts.
        </p>
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: f.delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8 }}
            className={`group relative p-12 rounded-[3.5rem] border border-white/5 bg-[#080808] flex flex-col justify-between overflow-hidden transition-all hover:border-indigo-500/40 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ${f.span}`}
          >
            {/* Ambient Card Glow */}
            <div className={`absolute -bottom-20 -right-20 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${f.bg}`} />

            <div className="space-y-12">
              <div className={`p-5 rounded-[1.5rem] w-fit border border-white/5 ${f.bg} ${f.color} group-hover:scale-110 transition-transform duration-500`}>
                <f.icon size={32} strokeWidth={1.5} />
              </div>

              <div className="space-y-4">
                <h3 className="text-4xl font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors duration-500">
                  {f.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed font-medium max-w-md">
                  {f.desc}
                </p>
              </div>
            </div>

            {/* Feature Tags/Details */}
            <div className="mt-12 flex flex-wrap gap-3">
              {f.details.map((detail) => (
                <span 
                  key={detail} 
                  className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 group-hover:border-white/10 transition-all"
                >
                  {detail}
                </span>
              ))}
            </div>

            {/* Decorative Corner Icon */}
            <div className="absolute top-10 right-10 text-white/[0.02] group-hover:text-white/[0.05] transition-colors pointer-events-none">
                <Fingerprint size={120} strokeWidth={1} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* STATS STRIP */}
      <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5">
        <StatItem label="Active Shinobi" value="12,402" />
        <StatItem label="Episodes Logged" value="1.2M" />
        <StatItem label="AI Precision" value="98.4%" />
        <StatItem label="System Uptime" value="99.9%" />
      </div>
    </section>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{label}</p>
    </div>
  )
}       