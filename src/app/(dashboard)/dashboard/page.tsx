"use client"

import { motion } from "framer-motion"
import { Zap, Crown, Flame, TrendingUp, Bell, Star, Users } from "lucide-react"
import Link from "next/link"
import { WatchStatsCard } from "@/components/dashboard/cards/WatchStatsCard"
import { GenreCard } from "@/components/dashboard/cards/GenreCard"
import { ActivityCard } from "@/components/dashboard/cards/ActivityCard"
import ContinueWatchingCard from "@/components/dashboard/cards/ContinueWatchingCard"
import XPCard from "@/components/dashboard/cards/XPCard"
import WrappedBanner from "@/components/ui/WrappedBanner"
import { useAuthStore } from "@/stores/auth.store"
import NowPlayingCard from "@/components/dashboard/cards/NowPlayingCard"
import AnimeOfTheDayCard from "@/components/dashboard/cards/AnimeOfTheDayCard"
import TopAnimeCard from "@/components/dashboard/cards/TopAnimeCard"
import RecentlyReviewedCard from "@/components/dashboard/cards/RecentlyReviewedCard"
import QuickActionsCard from "@/components/dashboard/cards/QuickActionsCard"
import DailyQuestCard from "@/components/dashboard/cards/DailyQuestCard"

/* ── Streak card extracted as proper component (not IIFE — avoids render crash) ── */
function StreakBento({ reputation }: { reputation: number }) {
  const streak = Math.min(365, Math.floor(reputation / 10))
  const pct    = Math.min(100, (streak % 30) / 30 * 100)

  return (
    <Link href="/streak">
      <motion.div
        whileHover={{ y: -5 }}
        className="p-10 rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden cursor-pointer h-full"
        style={{
          background: "linear-gradient(160deg, #0a0a14 0%, #070710 100%)",
          borderColor: "rgba(249,115,22,0.15)",
        }}
      >
        <div className="absolute -right-6 -top-6 text-orange-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
          <Flame size={180} />
        </div>
        <div className="flex justify-between items-center mb-12 relative z-10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Current Momentum</h4>
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Flame size={20} /></div>
        </div>
        <p className="text-8xl font-black tracking-tighter relative z-10 text-white">
          {streak}<span className="text-xl text-white/20 ml-2 italic font-medium">Days</span>
        </p>
        <div className="mt-8 h-2 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            className="h-full bg-gradient-to-r from-orange-600 to-amber-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          />
        </div>
      </motion.div>
    </Link>
  )
}

/* ── Header metric chip ── */
function HeaderMetric({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="text-right flex flex-col items-end">
      <div className={`p-2 rounded-xl bg-white/5 mb-2 ${color}`}><Icon size={18} /></div>
      <p className="text-3xl font-black text-white leading-none tracking-tighter">{value}</p>
      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

/* ── Quick card ── */
function QuickCard({ href, icon: Icon, label, color, iconColor }: {
  href: string; icon: React.ElementType; label: string; color: string; iconColor: string
}) {
  return (
    <Link href={href}
      className={`group flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 ${color}`}>
      <div className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center ${iconColor}`}>
        <Icon size={20} />
      </div>
      <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors">{label}</p>
    </Link>
  )
}

/* ── Main page ── */
export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const rep   = user?.reputation ?? 0
  const level = Math.max(1, Math.floor(Math.sqrt(rep * 100 / 1000)))
  const grade = level >= 10 ? "Grade IV" : level >= 7 ? "Grade III" : level >= 4 ? "Grade II" : "Grade I"

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8 pb-32">
      <WrappedBanner />

      {/* ── HEADER ── */}
      <header className="relative overflow-hidden rounded-[2.5rem] border p-10 shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #0a0a14 0%, #070710 100%)",
          borderColor: "rgba(245,158,11,0.15)",
          boxShadow: "0 0 80px rgba(245,158,11,0.06)",
        }}>
        {/* Gold glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none"
          style={{ background: "rgba(245,158,11,0.07)" }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)" }} />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 font-black uppercase tracking-[0.4em] text-[10px]"
              style={{ color: "#f59e0b" }}>
              <Crown size={14} className="animate-pulse" />
              Neural Link Active • {grade}
            </motion.div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">
              Welcome,{" "}
              <span className="italic" style={{
                backgroundImage: "linear-gradient(135deg, #fbbf24, #f59e0b, #ffffff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {user?.displayName ?? "Shinobi"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-6 border-l border-white/10 pl-8">
            <HeaderMetric label="Reputation" value={String(rep)} icon={Zap}       color="text-amber-400"  />
            <HeaderMetric label="Level"      value={String(level)} icon={TrendingUp} color="text-amber-400" />
            <Link href="/notifications"
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <Bell size={18} className="text-white/60" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── BENTO GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT 8-col */}
        <div className="lg:col-span-8 space-y-6">
          <WatchStatsCard />

          <div className="grid md:grid-cols-2 gap-6">
            <StreakBento reputation={rep} />
            <GenreCard />
          </div>
        </div>

        {/* RIGHT 4-col */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          {/* Prime Grade CTA */}
          <div className="p-8 rounded-[2.5rem] text-black relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
              boxShadow: "0 16px 50px rgba(245,158,11,0.4)",
            }}>
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute top-0 left-0 right-0 h-px bg-white/30" />
            <div className="relative z-10 flex flex-col">
              <div className="h-11 w-11 rounded-2xl bg-black/15 flex items-center justify-center mb-6">
                <Crown size={22} className="text-black" />
              </div>
              <h4 className="text-3xl font-black tracking-tighter leading-tight italic text-black mb-3">
                Ascend to<br />Prime Grade
              </h4>
              <p className="text-black/60 text-sm font-medium leading-relaxed mb-6">
                Access the neural archives, verified chronicles, and legendary status badges.
              </p>
              <button className="w-full py-4 rounded-2xl bg-black/15 text-black font-black uppercase tracking-widest text-[11px] hover:bg-black/25 transition-all border border-black/10">
                Upgrade Identity
              </button>
            </div>
          </div>

          <ActivityCard />
          <XPCard xp={rep * 100} reputation={rep} />
          <NowPlayingCard />
          <AnimeOfTheDayCard />
        </div>
      </div>

      {/* ── CONTINUE WATCHING ── */}
      <ContinueWatchingCard />

      {/* ── PERSONAL STATS ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <TopAnimeCard />
        <RecentlyReviewedCard />
      </div>

      {/* ── QUICK ACCESS ── */}
      <div>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-white/20 mb-4">Quick Access</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickCard href="/clubs"           icon={Users} label="Browse Clubs"
            color="from-violet-600/20 to-violet-900/5 border-violet-500/20 hover:border-violet-500/50" iconColor="text-violet-400" />
          <QuickCard href="/profile#reviews" icon={Star}  label="My Reviews"
            color="from-amber-600/20 to-amber-900/5 border-amber-500/20 hover:border-amber-500/50"   iconColor="text-amber-400" />
        </div>
      </div>

      {/* ── QUICK ACTIONS + DAILY QUESTS ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <QuickActionsCard />
        <DailyQuestCard />
      </div>
    </div>
  )
}
