"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Trophy, Crown, ChevronLeft, Flame, Star } from "lucide-react"
import { TiltCard } from "@/components/ui/TiltCard"

type Period = "weekly" | "monthly" | "all-time"

const PERIOD_CONFIG: Record<Period, { label: string; desc: string }> = {
  weekly:   { label: "This Week",    desc: "Top Shinobi by XP earned in the last 7 days"  },
  monthly:  { label: "This Month",   desc: "Top Shinobi by XP earned in the last 30 days" },
  "all-time":{ label: "All Time",    desc: "Top Shinobi by total XP ever accumulated"      },
}

const getUsers = (period: Period) => {
  const base = [
    { rank:1, name:"Otaku_Arch",    xp:period==="weekly"?"1,240":period==="monthly"?"12.4k":"1.24M", streak:89, archived:412 },
    { rank:2, name:"Shadow_Watcher",xp:period==="weekly"?"980": period==="monthly"?"9.8k": "840K",   streak:45, archived:298 },
    { rank:3, name:"Void_Seeker",   xp:period==="weekly"?"820": period==="monthly"?"8.2k": "620K",   streak:32, archived:256 },
    { rank:4, name:"Neural_Ghost",  xp:period==="weekly"?"710": period==="monthly"?"7.1k": "480K",   streak:22, archived:201 },
    { rank:5, name:"Cipher_Ronin",  xp:period==="weekly"?"650": period==="monthly"?"6.5k": "320K",   streak:18, archived:178 },
  ]
  return base
}

export default function PeriodLeaderboardPage({ params }: { params: Promise<{ period: string }> }) {
  const { period } = use(params)
  if (!["weekly","monthly","all-time"].includes(period)) notFound()
  const p = period as Period
  const config = PERIOD_CONFIG[p]
  const users = getUsers(p)
  const top3 = users.slice(0, 3)
  const rest = users.slice(3)

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-32 space-y-10">
        <div>
          <Link href="/leaderboard" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-400/60 hover:text-amber-400 transition-colors mb-4">
            <ChevronLeft size={11}/> Full Leaderboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={20} className="text-amber-400" />
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">{config.label}<span style={{color:"#f59e0b"}}>.</span></h1>
          </div>
          <p className="text-white/35 text-sm">{config.desc}</p>
        </div>

        {/* Period switcher */}
        <div className="flex gap-2">
          {(["weekly","monthly","all-time"] as Period[]).map(pp => (
            <Link key={pp} href={`/leaderboard/${pp}`}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                pp===p ? "bg-amber-500 text-black" : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/8"
              }`}
            >{PERIOD_CONFIG[pp].label}</Link>
          ))}
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-4 items-end">
          {[top3[1], top3[0], top3[2]].map((user, ci) => {
            const heights = ["h-32","h-44","h-28"]
            const emojis  = ["🥈","🥇","🥉"]
            return (
              <TiltCard key={user.rank} intensity={5} glare>
                <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:ci*0.1 }} className="flex flex-col items-center">
                  {user.rank===1 && <motion.div animate={{ y:[0,-4,0] }} transition={{ duration:2.5,repeat:Infinity }} className="mb-2"><Crown size={18} className="text-amber-400" fill="currentColor"/></motion.div>}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-xl mb-2">{user.name[0]}</div>
                  <p className="text-xs font-black text-white">{user.name}</p>
                  <p className="text-[9px] text-amber-400 font-mono mt-0.5">{user.xp} XP</p>
                  <div className={`w-full mt-3 ${heights[ci]} bg-gradient-to-t ${user.rank===1?"from-amber-600/30 to-amber-500/10 border-amber-500/25":user.rank===2?"from-slate-600/30 to-slate-400/10 border-slate-500/25":"from-amber-800/30 to-amber-700/10 border-amber-700/25"} border border-b-0 rounded-t-xl flex items-center justify-center`}>
                    <span className="text-2xl font-black text-white/10">{emojis[ci]}</span>
                  </div>
                </motion.div>
              </TiltCard>
            )
          })}
        </div>

        {/* Rest */}
        <div className="space-y-2">
          {rest.map((u, i) => (
            <motion.div key={u.rank} initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.05 }}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-all"
            >
              <span className="text-sm font-black text-white/30 w-5">#{u.rank}</span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600/40 to-violet-600/30 flex items-center justify-center font-black text-sm shrink-0">{u.name[0]}</div>
              <div className="flex-1">
                <p className="text-sm font-black text-white/80">{u.name}</p>
                <div className="flex items-center gap-3 text-[9px] text-white/25 mt-0.5">
                  <span className="flex items-center gap-1"><Flame size={9} className="text-orange-400"/>{u.streak}d streak</span>
                  <span className="flex items-center gap-1"><Star size={9} className="text-amber-400"/>{u.archived} archived</span>
                </div>
              </div>
              <span className="text-sm font-black text-white font-mono">{u.xp}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
