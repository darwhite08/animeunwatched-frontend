"use client"

import Link from "next/link"
import { Flame, Star, Medal } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"

/** Ninja-tier rank derived from reputation (display-only). */
function tierOf(rep: number): string {
  if (rep >= 5000) return "Kage"
  if (rep >= 2000) return "Jonin"
  if (rep >= 500) return "Chunin"
  if (rep >= 100) return "Genin"
  return "Academy"
}

export function SidebarGamification({ slug, collapsed }: { slug?: string | null; collapsed: boolean }) {
  const user = useAuthStore((s) => s.user)
  // Guests have no XP/streak — hide the strip rather than show zeros.
  if (!user) return null
  const rep = user?.reputation ?? 0
  const streak = user?.streakDays ?? 0
  const tier = tierOf(rep)
  const href = slug ? `/user/${slug}/streak` : "/login"

  if (collapsed) {
    return (
      <Link href={href} title={`${tier} · ${rep} XP · ${streak}d streak`} className="flex flex-col items-center gap-1 rounded-xl py-3 text-muted hover:bg-white/5 hover:text-foreground">
        <Flame size={18} className="text-orange-400" />
        <span className="text-[10px] font-black tabular-nums text-foreground">{streak}</span>
      </Link>
    )
  }

  return (
    <Link href={href} className="block rounded-2xl border border-border bg-white/[0.02] p-3 hover:border-border-hover">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted">
        <Medal size={12} className="text-accent-bright" /> {tier}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5">
          <Star size={14} className="text-accent-bright" />
          <span className="text-sm font-black tabular-nums text-foreground">{rep.toLocaleString()}</span>
          <span className="text-[10px] text-muted">XP</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={14} className="text-orange-400" />
          <span className="text-sm font-black tabular-nums text-foreground">{streak}</span>
          <span className="text-[10px] text-muted">streak</span>
        </div>
      </div>
    </Link>
  )
}
