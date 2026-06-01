"use client"

import { motion } from "framer-motion"
import { lazy, Suspense } from "react"
import { Zap, Crown, Flame, TrendingUp, Bell, Star, Users } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth.store"
import { useLiveUserList } from "@/hooks/useRealtime"
import { ActivityTicker } from "@/components/dashboard/ActivityTicker"
import WrappedBanner from "@/components/ui/WrappedBanner"
// Above-fold cards — eagerly loaded (visible immediately on page open)
import { WatchStatsCard } from "@/components/dashboard/cards/WatchStatsCard"
import ContinueWatchingCard from "@/components/dashboard/cards/ContinueWatchingCard"
import { GenreCard } from "@/components/dashboard/cards/GenreCard"

// Below-fold cards — lazily loaded so they don't block first paint
const ActivityCard        = lazy(() => import("@/components/dashboard/cards/ActivityCard").then(m => ({ default: m.ActivityCard })))
const XPCard              = lazy(() => import("@/components/dashboard/cards/XPCard"))
const NowPlayingCard      = lazy(() => import("@/components/dashboard/cards/NowPlayingCard"))
const AnimeOfTheDayCard   = lazy(() => import("@/components/dashboard/cards/AnimeOfTheDayCard"))
const FriendsActivityCard = lazy(() => import("@/components/dashboard/cards/FriendsActivityCard"))
const TopAnimeCard        = lazy(() => import("@/components/dashboard/cards/TopAnimeCard"))
const RecentlyReviewedCard = lazy(() => import("@/components/dashboard/cards/RecentlyReviewedCard"))
const QuickActionsCard    = lazy(() => import("@/components/dashboard/cards/QuickActionsCard"))
const DailyQuestCard      = lazy(() => import("@/components/dashboard/cards/DailyQuestCard"))
const AiringTodayCard     = lazy(() => import("@/components/dashboard/cards/AiringTodayCard"))
const InviteFriendsCard   = lazy(() => import("@/components/dashboard/cards/InviteFriendsCard"))

function CardSkeleton({ h = "h-48" }: { h?: string }) {
  return <div className={`${h} rounded-[2.5rem] bg-surface border border-border animate-pulse`} />
}

/* ── Streak card extracted as proper component (not IIFE — avoids render crash) ── */
function StreakBento({ reputation }: { reputation: number }) {
  const user   = useAuthStore(s => s.user)
  // Use real DB-backed streak if available, fall back to rep estimate
  const streak = user?.streakDays ?? Math.min(365, Math.floor(reputation / 10))
  const pct    = Math.min(100, (streak % 30) / 30 * 100)

  // Show "at risk" warning if last active was yesterday or earlier (not today)
  const isAtRisk = user?.lastActiveAt
    ? new Date().toDateString() !== new Date(user.lastActiveAt).toDateString()
    : false

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
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Current Momentum</h4>
          <div className="flex items-center gap-2">
            {isAtRisk && streak > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400"
              >
                At Risk!
              </motion.span>
            )}
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Flame size={20} /></div>
          </div>
        </div>
        <p className="text-8xl font-black tracking-tighter relative z-10 text-foreground">
          {streak}<span className="text-xl text-subtle ml-2 italic font-medium">Days</span>
        </p>
        {isAtRisk && streak > 0 && (
          <p className="text-xs text-red-400/70 font-bold relative z-10 mt-2">
            Log an episode today to keep your streak alive →
          </p>
        )}
        <div className="mt-4 h-2 w-full bg-surface rounded-full overflow-hidden relative z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            className={`h-full shadow-[0_0_20px_rgba(249,115,22,0.4)] ${isAtRisk ? "bg-gradient-to-r from-red-600 to-orange-500" : "bg-gradient-to-r from-orange-600 to-accent-bright"}`}
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
      <div className={`p-2 rounded-xl bg-surface mb-2 ${color}`}><Icon size={18} /></div>
      <p className="text-3xl font-black text-foreground leading-none tracking-tighter">{value}</p>
      <p className="text-[10px] font-bold text-subtle uppercase tracking-widest mt-1">{label}</p>
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
      <p className="text-sm font-black text-muted group-hover:text-foreground transition-colors">{label}</p>
    </Link>
  )
}

/* ── Main page ── */
export default function DashboardPage() {
  const user        = useAuthStore(s => s.user)
  const sessionReady = useAuthStore(s => s.sessionReady)
  const rep   = user?.reputation ?? 0
  const level = Math.max(1, Math.floor(Math.sqrt(rep * 100 / 1000)))
  // Realtime: stats cards refresh when the user updates their list anywhere
  useLiveUserList()
  const grade = level >= 10 ? "Grade IV" : level >= 7 ? "Grade III" : level >= 4 ? "Grade II" : "Grade I"

  // Show skeleton while session is bootstrapping — prevents black flash
  if (!sessionReady) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8 pb-32">
        <div className="h-40 rounded-[2.5rem] bg-surface border border-border animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-40 rounded-[2.5rem] bg-surface border border-border animate-pulse" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 rounded-[2.5rem] bg-surface border border-border animate-pulse" />
              <div className="h-64 rounded-[2.5rem] bg-surface border border-border animate-pulse" />
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="h-80 rounded-[2.5rem] bg-surface border border-border animate-pulse" />
            <div className="h-48 rounded-[2.5rem] bg-surface border border-border animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8 pb-32">
      <WrappedBanner />
      <ActivityTicker />

      {/* ── HEADER ── */}
      <header className="relative overflow-hidden rounded-[2.5rem] border p-10 shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #0a0a14 0%, #070710 100%)",
          borderColor: "color-mix(in srgb, var(--app-accent) 15%, transparent)",
          boxShadow: "0 0 80px color-mix(in srgb, var(--app-accent) 6%, transparent)",
        }}>
        {/* Gold glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none"
          style={{ background: "color-mix(in srgb, var(--app-accent) 7%, transparent)" }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--app-accent) 50%, transparent), transparent)" }} />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 font-black uppercase tracking-[0.4em] text-[10px]"
              style={{ color: "var(--app-accent)" }}>
              <Crown size={14} className="animate-pulse" />
              Neural Link Active • {grade}
            </motion.div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-foreground leading-none">
              Welcome,{" "}
              <span className="italic" style={{
                backgroundImage: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent), #ffffff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {user?.displayName ?? "Shinobi"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-6 border-l border-border pl-8">
            <HeaderMetric label="Reputation" value={String(rep)} icon={Zap}       color="text-accent-bright"  />
            <HeaderMetric label="Level"      value={String(level)} icon={TrendingUp} color="text-accent-bright" />
            <Link href="/notifications"
              className="p-3 rounded-2xl bg-surface border border-border hover:bg-surface transition-all">
              <Bell size={18} className="text-muted" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── BENTO GRID ──
          Balanced two-column layout: LEFT carries the data-heavy cards,
          RIGHT carries the visually striking promo + media cards. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT 8-col */}
        <div className="lg:col-span-8 space-y-6">
          <WatchStatsCard />

          <div className="grid md:grid-cols-2 gap-6">
            <StreakBento reputation={rep} />
            <GenreCard />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Suspense fallback={<CardSkeleton />}><ActivityCard /></Suspense>
            <Suspense fallback={<CardSkeleton h="h-32" />}><XPCard xp={rep * 100} reputation={rep} /></Suspense>
          </div>

          <Suspense fallback={<CardSkeleton />}><NowPlayingCard /></Suspense>
        </div>

        {/* RIGHT 4-col */}
        <div className="lg:col-span-4 space-y-6">
          {/* Prime Grade CTA */}
          <div className="p-8 rounded-[2.5rem] text-black relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, var(--app-accent-bright) 0%, var(--app-accent) 50%, #d97706 100%)",
              boxShadow: "0 16px 50px color-mix(in srgb, var(--app-accent) 40%, transparent)",
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
              <Link
                href="/me/settings/billing"
                className="w-full py-4 rounded-2xl bg-black/15 text-black font-black uppercase tracking-widest text-[11px] hover:bg-black/25 transition-all border border-black/10 flex items-center justify-center"
              >
                Upgrade Identity
              </Link>
            </div>
          </div>

          <Suspense fallback={<CardSkeleton h="h-64" />}><AnimeOfTheDayCard /></Suspense>
          <Suspense fallback={<CardSkeleton />}><FriendsActivityCard /></Suspense>
        </div>
      </div>

      {/* ── CONTINUE WATCHING ── */}
      <ContinueWatchingCard />

      {/* ── PERSONAL STATS ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <Suspense fallback={<CardSkeleton />}><TopAnimeCard /></Suspense>
        <Suspense fallback={<CardSkeleton />}><RecentlyReviewedCard /></Suspense>
      </div>

      {/* ── QUICK ACCESS ── */}
      <div>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-subtle mb-4">Quick Access</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickCard href="/clubs"           icon={Users} label="Browse Clubs"
            color="from-violet-600/20 to-violet-900/5 border-violet-500/20 hover:border-violet-500/50" iconColor="text-violet-400" />
          <QuickCard href="/profile#reviews" icon={Star}  label="My Reviews"
            color="from-accent/20 to-amber-900/5 border-accent/20 hover:border-accent/50"   iconColor="text-accent-bright" />
        </div>
      </div>

      {/* ── QUICK ACTIONS + DAILY QUESTS ── */}
      <div className="grid md:grid-cols-2 gap-6">
        <Suspense fallback={<CardSkeleton />}><QuickActionsCard /></Suspense>
        <Suspense fallback={<CardSkeleton />}><DailyQuestCard /></Suspense>
      </div>

      {/* ── AIRING SCHEDULE + INVITE ── */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Suspense fallback={<CardSkeleton h="h-64" />}><AiringTodayCard /></Suspense>
        </div>
        <Suspense fallback={<CardSkeleton h="h-48" />}><InviteFriendsCard /></Suspense>
      </div>
    </div>
  )
}
