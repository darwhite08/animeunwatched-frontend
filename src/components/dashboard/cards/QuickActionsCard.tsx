"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Play, Star, Search, TrendingUp, PenSquare, Trophy } from "lucide-react"

/* ── Action definitions ── */
const ACTIONS = [
  { icon: Play,       label: "Continue Watching", href: "/watchlist",   color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(52,211,153,0.08)]" },
  { icon: Star,       label: "Rate an Anime",     href: "/rate",        color: "text-accent-bright",   bg: "bg-accent/10",   border: "hover:border-accent/40 hover:shadow-[0_0_20px_color-mix(in srgb, var(--app-accent-bright) 8%, transparent)]"  },
  { icon: Search,     label: "Search Archive",    href: "/search",          color: "text-accent-bright",  bg: "bg-accent/10",  border: "hover:border-accent/40 hover:shadow-[0_0_20px_color-mix(in srgb, var(--app-accent) 8%, transparent)]" },
  { icon: TrendingUp, label: "View Trending",     href: "/community/trending", color: "text-rose-400", bg: "bg-rose-500/10",  border: "hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(251,113,133,0.08)]"  },
  { icon: PenSquare,  label: "Write a Review",    href: "/profile",     color: "text-violet-400",  bg: "bg-violet-500/10",  border: "hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(167,139,250,0.08)]" },
  { icon: Trophy,     label: "Leaderboard",       href: "/leaderboard", color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "hover:border-yellow-500/40 hover:shadow-[0_0_20px_rgba(250,204,21,0.08)]"  },
]

/* ── Component ── */
export default function QuickActionsCard() {
  return (
    <div className="p-8 rounded-[2.5rem] border border-border bg-surface relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-subtle mb-6 relative z-10">
        Quick Actions
      </p>

      {/* 3 × 2 grid */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {ACTIONS.map(({ icon: Icon, label, href, color, bg, border }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, ease: "easeOut" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href={href}
              className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-surface transition-all duration-300 ${border}`}
            >
              {/* Icon bubble */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${color} transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={18} />
              </div>
              {/* Label */}
              <span className={`text-[10px] font-black uppercase tracking-wide text-center leading-tight text-muted group-hover:text-muted transition-colors duration-200`}>
                {label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
