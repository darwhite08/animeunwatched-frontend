"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Users, Search, Trophy, Flame, Star, TrendingUp } from "lucide-react"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { PresenceDot } from "@/components/ui/PresenceDot"

type User = {
  id: string; username: string; displayName: string
  reputation: number; level: number; title: string
  anime: number; streak: number; avatar: string
}

const USERS: User[] = [
  { id:"1", username:"otaku_arch",     displayName:"Otaku Arch",     reputation:1240, level:12, title:"Neural Oracle",  anime:412, streak:89, avatar:"O" },
  { id:"2", username:"shadow_watcher", displayName:"Shadow Watcher", reputation:840,  level:9,  title:"Legendary",      anime:298, streak:45, avatar:"S" },
  { id:"3", username:"void_seeker",    displayName:"Void Seeker",    reputation:620,  level:7,  title:"Kage",            anime:256, streak:32, avatar:"V" },
  { id:"4", username:"neural_ghost",   displayName:"Neural Ghost",   reputation:480,  level:6,  title:"Elite Jonin",    anime:201, streak:22, avatar:"N" },
  { id:"5", username:"cipher_ronin",   displayName:"Cipher Ronin",   reputation:320,  level:5,  title:"Anbu",           anime:178, streak:18, avatar:"C" },
  { id:"6", username:"alpha_watcher",  displayName:"Alpha Watcher",  reputation:240,  level:4,  title:"Jonin",          anime:156, streak:14, avatar:"A" },
  { id:"7", username:"delta_weeb",     displayName:"Delta Weeb",     reputation:180,  level:3,  title:"Shinobi",        anime:134, streak:11, avatar:"D" },
  { id:"8", username:"kurosaki_fan",   displayName:"Kurosaki Fan",   reputation:140,  level:3,  title:"Shinobi",        anime:112, streak:9,  avatar:"K" },
  { id:"9", username:"darwhite08",     displayName:"Priyanshu",      reputation:840,  level:8,  title:"Elite Jonin",    anime:124, streak:22, avatar:"P" },
]

export default function UsersPage() {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"reputation" | "anime" | "streak">("reputation")
  const { data: lbData } = useLeaderboard(100)

  const apiUsers: User[] = (lbData?.data ?? []).map(u => ({
    id: u.id ?? u.username, username: u.username, displayName: u.displayName,
    reputation: u.reputation, level: u.level,
    title: u.level >= 10 ? "Legendary" : u.level >= 7 ? "Kage" : u.level >= 5 ? "Elite Jonin" : u.level >= 3 ? "Jonin" : "Shinobi",
    anime: u.archived, streak: 0, avatar: u.displayName[0]?.toUpperCase() ?? "?",
  }))
  const baseUsers = apiUsers.length > 0 ? apiUsers : USERS

  const sorted = useMemo(() => {
    const filtered = baseUsers.filter(u =>
      !query || u.displayName.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase())
    )
    return [...filtered].sort((a, b) => b[sort] - a[sort])
  }, [query, sort])

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-10">
        <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-black uppercase tracking-[0.3em] text-accent-bright mb-5"
        >
          <Users size={11} /> Shinobi Directory
        </motion.div>
        <h1 className="text-5xl font-black tracking-tighter uppercase italic text-foreground leading-none mb-3">
          Find Shinobi<span style={{color:"#f59e0b"}}>.</span>
        </h1>
        <p className="text-subtle text-sm">Discover the community, follow reviewers, find your tribe.</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search Shinobi…"
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/40"
            />
          </div>
          <div className="flex gap-2">
            {([["reputation","Reputation"],["anime","Archive"],["streak","Streak"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setSort(key)}
                className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${sort === key ? "bg-accent text-black" : "bg-surface text-muted hover:bg-surface border border-border"}`}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* User list */}
        <div className="space-y-2">
          {sorted.map((user, i) => (
            <motion.div key={user.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.04 }}>
              <Link href={`/u/${user.username}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border hover:border-accent/20 hover:bg-white/[0.04] transition-all group"
              >
                <span className="text-sm font-black text-subtle w-6 shrink-0">#{i+1}</span>
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-black group-hover:scale-105 transition-transform">
                    {user.avatar}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <PresenceDot userId={user.id} size={11} />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-foreground group-hover:text-accent-bright transition-colors">{user.displayName}</p>
                  <p className="text-xs text-subtle">@{user.username} · Lv.{user.level} {user.title}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-xs text-subtle shrink-0">
                  <span className="flex items-center gap-1"><Trophy size={11} className="text-accent-bright" /> {user.reputation}</span>
                  <span className="flex items-center gap-1"><Star size={11} className="text-accent-bright" /> {user.anime}</span>
                  <span className="flex items-center gap-1"><Flame size={11} className="text-orange-400" /> {user.streak}d</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
