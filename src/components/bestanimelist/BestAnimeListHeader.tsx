"use client"

import { motion } from "framer-motion"
import { DatabaseZap } from "lucide-react"

export default function BestAnimeListHeader() {
  return (
    <div className="relative pt-32 pb-10 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.4em]"
            style={{ color: "var(--k-gold)" }}
          >
            <DatabaseZap size={13} className="animate-pulse" />
            Neural Archive · 30,000+ Titles
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.85]">
            The{" "}
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)" }}>
              Vault.
            </span>
          </h1>

          <p className="text-white/40 max-w-md font-medium text-base leading-relaxed uppercase tracking-tighter">
            Every anime ever made — searchable, filterable, ranked.
          </p>
        </div>

        <div className="flex items-end gap-8 pb-1">
          {[
            { label: "Total Anime",    value: "30,161" },
            { label: "Jikan Synced",  value: "Live" },
            { label: "Neural Ranked", value: "Top 100" },
          ].map(s => (
            <div key={s.label} className="text-right">
              <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: "var(--k-text-subtle)" }}>{s.label}</p>
              <p className="text-sm font-black font-mono mt-0.5"
                style={{ color: s.value === "Live" ? "#10b981" : "var(--k-text)" }}>
                {s.value === "Live" ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    {s.value}
                  </span>
                ) : s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Gold gradient divider */}
      <div className="mt-10 h-px w-full" style={{
        background: "linear-gradient(90deg, rgba(245,158,11,0.6), rgba(245,158,11,0.2) 40%, rgba(99,102,241,0.15) 70%, transparent)"
      }} />
    </div>
  )
}
