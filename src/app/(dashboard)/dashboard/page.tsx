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
      <header className="relative overflow-hidden rounded-[3rem] bg-[#050505] border border-white/5 p-12 shadow-2xl group">
        {/* Ambient Mesh Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-1000" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-end gap-10">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]"
            >
              <Crown size={14} className="animate-pulse" /> Neural Link Active • Grade II
            </motion.div>
            <h1 className="text-7xl font-black tracking-tighter text-white leading-none">
              Welcome, <span className="bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent italic">{user?.displayName ?? "Shinobi"}</span>
            </h1>
          </div>

          <div className="flex items-center gap-8 border-l border-white/10 pl-10">
            <HeaderMetric label="Daily XP" value="+1,240" icon={Zap} color="text-yellow-400" />
            <HeaderMetric label="Global Rank" value="#812" icon={TrendingUp} color="text-indigo-400" />
            <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <Bell size={20} className="text-white/60" />
            </button>
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
            <motion.div 
                whileHover={{ y: -5 }}
                className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all duration-500 group relative overflow-hidden"
            >
                <div className="absolute -right-6 -top-6 text-orange-500/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <Flame size={180} />
                </div>
                <div className="flex justify-between items-center mb-12 relative z-10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Current Momentum</h4>
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Flame size={20} /></div>
                </div>
                <p className="text-8xl font-black tracking-tighter relative z-10 text-white">22<span className="text-xl text-white/20 ml-2 italic font-medium">Days</span></p>
                <div className="mt-8 h-2 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                    <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]" />
                </div>
            </motion.div>

            <GenreCard />
          </div>
        </div>

        {/* RIGHT: INSIGHTS & UTILITY (4 Cols) */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
           {/* PREMIUM CTA CARD */}
           <div className="p-10 rounded-[3rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group flex-1">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-8">
                        <Crown size={24} />
                    </div>
                    <h4 className="text-4xl font-black tracking-tighter leading-[0.9] italic">Ascend to<br />Prime Grade</h4>
                    <p className="mt-6 text-indigo-100/70 text-sm font-medium leading-relaxed">Access the neural archives, verified chronicles, and legendary status badges.</p>
                </div>
                <button className="mt-10 w-full py-5 rounded-2xl bg-white text-indigo-600 font-black uppercase tracking-widest text-[11px] hover:shadow-2xl transition-all active:scale-95">Upgrade Identity</button>
              </div>
           </div>

           <ActivityCard />
           <XPCard xp={84000} reputation={840} />
           <NowPlayingCard />
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