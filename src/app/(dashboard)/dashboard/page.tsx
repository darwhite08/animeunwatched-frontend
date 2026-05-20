"use client"

import React from "react"
import { motion } from "framer-motion"
import { Zap, Crown, Flame, TrendingUp, Bell, Users, Star } from "lucide-react"
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

export default function WorldClassDashboard() {
  const user = useAuthStore(s => s.user)
  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12 space-y-10 pb-32">
      <WrappedBanner />

      {/* 1. CINEMATIC HEADER SECTION */}
      <header className="relative overflow-hidden rounded-[3rem] border p-12 shadow-2xl group"
        style={{
          background: "linear-gradient(160deg, #0a0a14 0%, #070710 100%)",
          borderColor: "rgba(245,158,11,0.15)",
          boxShadow: "0 0 80px rgba(245,158,11,0.06), 0 4px 40px rgba(0,0,0,0.5)",
        }}>
        {/* Gold ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] blur-[130px] rounded-full pointer-events-none transition-all duration-1000"
          style={{ background: "rgba(245,158,11,0.07)" }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] blur-[100px] rounded-full pointer-events-none"
          style={{ background: "rgba(99,102,241,0.05)" }} />

        {/* Gold top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)" }} />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-end gap-10">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 font-black uppercase tracking-[0.4em] text-[10px]"
              style={{ color: "#f59e0b" }}
            >
              <Crown size={14} className="animate-pulse" />
              Neural Link Active •{" "}
              {(() => {
                const rep = user?.reputation ?? 0
                const level = Math.max(1, Math.floor(Math.sqrt(rep * 100 / 1000)))
                return level >= 10 ? "Grade IV" : level >= 7 ? "Grade III" : level >= 4 ? "Grade II" : "Grade I"
              })()}
            </motion.div>
            <h1 className="text-6xl lg:text-7xl font-black tracking-tighter text-white leading-none">
              Welcome,{" "}
              <span className="italic" style={{
                backgroundImage: "linear-gradient(135deg, #fbbf24, #f59e0b, #ffffff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {user?.displayName ?? "Shinobi"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-8 border-l border-white/10 pl-10">
            <HeaderMetric label="Reputation" value={String(user?.reputation ?? 0)} icon={Zap} color="text-amber-400" />
            <HeaderMetric label="Level"
              value={String(Math.max(1, Math.floor(Math.sqrt((user?.reputation ?? 0) * 100 / 1000))))}
              icon={TrendingUp} color="text-indigo-400" />
            <Link href="/notifications" className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <Bell size={20} className="text-white/60" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. THE BENTO GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT & CENTER: CORE METRICS (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          <WatchStatsCard />
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* STREAK BENTO */}
            {(() => {
              const rep = user?.reputation ?? 0
              const streak = Math.min(365, Math.floor(rep / 10))
              const pct = Math.min(100, (streak % 30) / 30 * 100)
              return (
                <Link href="/streak">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-10 rounded-[2.5rem] border transition-all duration-500 group relative overflow-hidden cursor-pointer"
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
            })()}

            <GenreCard />
          </div>
        </div>

        {/* RIGHT: INSIGHTS & UTILITY (4 Cols) */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
           {/* PREMIUM CTA CARD */}
           <div className="p-10 rounded-[3rem] text-black relative overflow-hidden group flex-1"
             style={{
               background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
               boxShadow: "0 20px 60px rgba(245,158,11,0.4)",
             }}>
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
              {/* Top shimmer */}
              <div className="absolute top-0 left-0 right-0 h-px bg-white/30" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="h-12 w-12 rounded-2xl bg-black/15 flex items-center justify-center mb-8">
                        <Crown size={24} className="text-black" />
                    </div>
                    <h4 className="text-4xl font-black tracking-tighter leading-[0.9] italic text-black">Ascend to<br />Prime Grade</h4>
                    <p className="mt-6 text-black/60 text-sm font-medium leading-relaxed">Access the neural archives, verified chronicles, and legendary status badges.</p>
                </div>
                <button className="mt-10 w-full py-5 rounded-2xl bg-black/15 text-black font-black uppercase tracking-widest text-[11px] hover:bg-black/25 transition-all active:scale-95 border border-black/10">
                  Upgrade Identity
                </button>
              </div>
           </div>

           <ActivityCard />
           <XPCard xp={(user?.reputation ?? 0) * 100} reputation={user?.reputation ?? 0} />
           <NowPlayingCard />
           <AnimeOfTheDayCard />
        </div>
      </div>

      {/* 3. CONTINUE WATCHING */}
      <ContinueWatchingCard />

      {/* 5. PERSONAL STATS */}
      <div className="grid md:grid-cols-2 gap-8">
        <TopAnimeCard />
        <RecentlyReviewedCard />
      </div>

      {/* 4. QUICK ACCESS GRID */}
      <div>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-white/20 mb-5">Quick Access</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickCard href="/clubs" icon={Users} label="Browse Clubs" color="from-violet-600/20 to-violet-900/5 border-violet-500/20 hover:border-violet-500/50" iconColor="text-violet-400" />
          <QuickCard href="/profile#reviews" icon={Star} label="My Reviews" color="from-amber-600/20 to-amber-900/5 border-amber-500/20 hover:border-amber-500/50" iconColor="text-amber-400" />
        </div>
      </div>

      {/* 6. QUICK ACTIONS + DAILY QUESTS */}
      <div className="grid md:grid-cols-2 gap-8">
        <QuickActionsCard />
        <DailyQuestCard />
      </div>
    </div>
  )
}

function HeaderMetric({
  label, value, icon: Icon, color,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="text-right flex flex-col items-end">
      <div className={`p-2 rounded-xl bg-white/5 mb-2 ${color}`}><Icon size={18} /></div>
      <p className="text-3xl font-black text-white leading-none tracking-tighter">{value}</p>
      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

function QuickCard({
  href, icon: Icon, label, color, iconColor,
}: {
  href: string
  icon: React.ElementType
  label: string
  color: string
  iconColor: string
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 ${color}`}
    >
      <div className={`w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center ${iconColor}`}>
        <Icon size={20} />
      </div>
      <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors">{label}</p>
    </Link>
  )
}