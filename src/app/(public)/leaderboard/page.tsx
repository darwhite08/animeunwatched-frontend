"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Trophy, Crown, Swords, Zap, Shield, Star, Flame,
  TrendingUp, Users, Activity, ChevronUp, ChevronDown, Minus,
} from "lucide-react"
import { TiltCard } from "@/components/ui/TiltCard"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { useAuthStore } from "@/stores/auth.store"
import { PresenceDot } from "@/components/ui/PresenceDot"

type Period = "all-time" | "monthly" | "weekly"

const GRADIENT_MAP: Record<number, string> = {
  1: "from-accent-bright to-orange-600",
  2: "from-slate-300 to-slate-500",
  3: "from-accent to-amber-800",
}

const TITLE_MAP: Record<number, { label: string; color: string }> = {
  1:  { label: "Legendary Shinobi", color: "text-accent-bright"   },
  2:  { label: "Arch-Mage",         color: "text-slate-300"   },
  3:  { label: "Elite Jonin",       color: "text-accent"   },
  4:  { label: "Shadow Watcher",    color: "text-accent-bright"  },
  5:  { label: "Binge Master",      color: "text-purple-400"  },
  6:  { label: "Neural Ranked",     color: "text-blue-400"    },
  7:  { label: "Veteran Otaku",     color: "text-teal-400"    },
  8:  { label: "Hidden Gem",        color: "text-emerald-400" },
  9:  { label: "Rising Star",       color: "text-rose-400"    },
  10: { label: "Apprentice",        color: "text-muted"    },
}

const ICON_MAP: Record<number, typeof Crown> = {
  1: Crown, 2: Swords, 3: Shield, 4: Star, 5: Flame,
  6: Zap, 7: TrendingUp, 8: Activity, 9: Star, 10: Zap,
}

type User = {
  rank: number; id?: string; name: string; xp: string; xpNum: number
  level: number; streak: number; archived: number
  trend: "up" | "down" | "same"; trendVal: number
  isMe: boolean
}

const BASE_USERS: User[] = [
  { rank:1,  name:"Otaku_Arch",      xp:"1.24M", xpNum:1240000, level:99,  streak:89,  archived:412, trend:"same",  trendVal:0, isMe:false },
  { rank:2,  name:"Shadow_Watcher",  xp:"840K",  xpNum:840000,  level:88,  streak:45,  archived:298, trend:"up",    trendVal:1, isMe:false },
  { rank:3,  name:"Void_Seeker",     xp:"620K",  xpNum:620000,  level:75,  streak:32,  archived:256, trend:"up",    trendVal:2, isMe:false },
  { rank:4,  name:"Neural_Ghost",    xp:"480K",  xpNum:480000,  level:68,  streak:22,  archived:201, trend:"down",  trendVal:1, isMe:false },
  { rank:5,  name:"Cipher_Ronin",    xp:"320K",  xpNum:320000,  level:59,  streak:18,  archived:178, trend:"up",    trendVal:3, isMe:false },
  { rank:6,  name:"Alpha_Watcher",   xp:"240K",  xpNum:240000,  level:52,  streak:14,  archived:156, trend:"same",  trendVal:0, isMe:false },
  { rank:7,  name:"Delta_Weeb",      xp:"180K",  xpNum:180000,  level:47,  streak:11,  archived:134, trend:"down",  trendVal:2, isMe:false },
  { rank:8,  name:"Kurosaki_Fan",    xp:"140K",  xpNum:140000,  level:41,  streak:9,   archived:112, trend:"up",    trendVal:1, isMe:false },
  { rank:9,  name:"Titan_Slayer",    xp:"110K",  xpNum:110000,  level:36,  streak:7,   archived:98,  trend:"up",    trendVal:4, isMe:false },
  { rank:10, name:"Anime_Oracle",    xp:"88K",   xpNum:88000,   level:32,  streak:5,   archived:87,  trend:"same",  trendVal:0, isMe:false },
  { rank:11, name:"Sasuke_Simped",   xp:"72K",   xpNum:72000,   level:29,  streak:4,   archived:76,  trend:"down",  trendVal:1, isMe:false },
  { rank:12, name:"Mango_Reader",    xp:"61K",   xpNum:61000,   level:27,  streak:3,   archived:65,  trend:"up",    trendVal:2, isMe:false },
  { rank:812, name:"darwhite08",     xp:"24.1K", xpNum:24100,   level:20,  streak:22,  archived:124, trend:"up",    trendVal:8, isMe:true  },
]

const TOP_3 = BASE_USERS.slice(0, 3)
const REST  = BASE_USERS.slice(3)

const PERIOD_LABELS: Record<Period, string> = {
  "all-time": "All Time",
  "monthly":  "This Month",
  "weekly":   "This Week",
}

export default function PublicLeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all-time")
  const { data: lbData, isLoading } = useLeaderboard(50, period)
  const me = useAuthStore(s => s.user)

  // Merge real data with mock, real data takes priority
  const realUsers: User[] = (lbData?.data ?? []).map((u, i) => ({
    rank: i + 1,
    id: u.id,
    name: u.username,
    xp: u.xp >= 1_000_000 ? `${(u.xp/1_000_000).toFixed(2)}M` : u.xp >= 1000 ? `${(u.xp/1000).toFixed(0)}K` : String(u.xp),
    xpNum: u.xp,
    level: u.level,
    streak: 0,
    archived: u.archived,
    trend: "same" as const,
    trendVal: 0,
    isMe: me?.username === u.username,
  }))

  const displayUsers = realUsers.length > 0 ? realUsers : BASE_USERS

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[9px] font-black uppercase tracking-[0.3em] text-accent-bright mb-4"
            >
              <Trophy size={11} /> Global Hall of Fame
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              The Pantheon<span style={{color:"#f59e0b"}}>.</span>
            </h1>
            <p className="text-subtle text-sm mt-3">12,402 Shinobi competing globally</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-2xl">
            {(["all-time","monthly","weekly"] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${period === p ? "text-black" : "text-subtle hover:text-foreground"}`}
              >
                {period === p && (
                  <motion.div layoutId="period-bg" className="absolute inset-0 rounded-xl"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }} />
                )}
                <span className="relative z-10">{PERIOD_LABELS[p]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TOP 3 PODIUM */}
        <div className="grid grid-cols-3 gap-4 items-end">
          {[displayUsers[1], displayUsers[0], displayUsers[2]].filter(Boolean).map((user, colIdx) => {
            const heights = ["h-36","h-48","h-32"]
            const Icon = ICON_MAP[user.rank] ?? Zap
            const grad  = GRADIENT_MAP[user.rank]
            const title = TITLE_MAP[user.rank]
            return (
              <TiltCard key={user.rank} intensity={6} glare className="flex flex-col items-center">
                <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay: colIdx*0.1 }}
                  className="flex flex-col items-center w-full"
                >
                  {user.rank === 1 && (
                    <motion.div animate={{ y:[0,-4,0] }} transition={{ duration:2.5, repeat:Infinity }} className="mb-2">
                      <Crown size={20} className="text-accent-bright" fill="currentColor" />
                    </motion.div>
                  )}
                  <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} p-0.5 mb-3 shadow-lg`}>
                    <div className="w-full h-full rounded-[calc(1rem-2px)] bg-surface flex items-center justify-center text-xl font-black">{user.name[0]}</div>
                    <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center`}>
                      <Icon size={12} className="text-black" />
                    </div>
                    {user.id && (
                      <span className="absolute -top-1 -right-1">
                        <PresenceDot userId={user.id} size={10} />
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-black text-foreground">{user.name}</p>
                  <p className={`text-[9px] font-black uppercase tracking-wider ${title.color} mt-0.5`}>{title.label}</p>
                  <p className="text-lg font-black text-foreground mt-1 font-mono">{user.xp}</p>
                  <p className="text-[9px] text-subtle uppercase tracking-widest">XP</p>
                  <div className={`w-full mt-4 ${heights[colIdx]} bg-gradient-to-t ${
                    user.rank===1 ? "from-accent/40 to-accent/10 border-accent/30" :
                    user.rank===2 ? "from-slate-600/40 to-slate-400/10 border-slate-500/30" :
                                    "from-amber-800/40 to-accent/10 border-accent/30"
                  } border border-b-0 rounded-t-2xl flex items-center justify-center`}>
                    <span className="text-3xl font-black text-subtle">#{user.rank}</span>
                  </div>
                </motion.div>
              </TiltCard>
            )
          })}
        </div>

        {/* RANKING TABLE */}
        <div className="space-y-2">
          <div className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem_5rem] gap-4 px-5 text-[9px] font-black uppercase tracking-[0.25em] text-subtle mb-3">
            <span>#</span><span>Shinobi</span><span className="text-right">Level</span>
            <span className="text-right">Streak</span><span className="text-right">Archived</span>
            <span className="text-right">XP</span>
          </div>
          <AnimatePresence>
            {displayUsers.slice(3).map((user, i) => {
              const Icon  = ICON_MAP[Math.min(user.rank, 10)] ?? Zap
              const title = TITLE_MAP[Math.min(user.rank, 10)]
              const isMe  = user.isMe
              return (
                <motion.div key={user.rank} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.03 }}
                  className={`grid grid-cols-[2rem_1fr_5rem_5rem_5rem_5rem] gap-4 items-center px-5 py-4 rounded-2xl border transition-all ${
                    isMe ? "border-accent/30 bg-accent/8" : "border-border bg-white/[0.01] hover:bg-surface hover:border-border"
                  }`}
                >
                  <span className={`text-sm font-black ${isMe ? "text-accent-bright" : "text-subtle"}`}>
                    {user.rank > 100 ? `#${user.rank}` : user.rank}
                  </span>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600/40 to-violet-600/30 flex items-center justify-center font-black text-sm">{user.name[0]}</div>
                      {user.id && (
                        <span className="absolute -bottom-0.5 -right-0.5">
                          <PresenceDot userId={user.id} size={9} />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-black truncate ${isMe ? "text-accent-bright" : "text-muted"}`}>{user.name}{isMe && " (You)"}</p>
                        <Icon size={11} className={title.color} />
                      </div>
                      <p className={`text-[9px] uppercase tracking-wider ${title.color} opacity-80`}>{title.label}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-muted text-right">Lv.{user.level}</span>
                  <span className="text-sm font-black text-muted text-right flex items-center justify-end gap-1">
                    <Flame size={11} className="text-orange-500" />{user.streak}d
                  </span>
                  <span className="text-sm font-black text-muted text-right">{user.archived}</span>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-sm font-black text-foreground font-mono">{user.xp}</span>
                    {user.trend==="up"   && <ChevronUp   size={12} className="text-emerald-400 shrink-0"/>}
                    {user.trend==="down" && <ChevronDown size={12} className="text-red-400 shrink-0"/>}
                    {user.trend==="same" && <Minus       size={12} className="text-subtle shrink-0"/>}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
          {[
            { icon:Users,    label:"Global Shinobi", value:"12,402" },
            { icon:Activity, label:"Daily Active",   value:"1,120"  },
            { icon:Trophy,   label:"Your Standing",  value:"#812"   },
          ].map(({ icon:Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-border">
              <Icon size={18} className="text-accent-bright shrink-0" />
              <div>
                <p className="text-xl font-black tracking-tighter text-foreground">{value}</p>
                <p className="text-[9px] text-subtle uppercase tracking-[0.2em]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
