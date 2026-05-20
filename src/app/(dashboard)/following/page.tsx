"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Users, Search, Check, UserPlus, ArrowRight } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useFollowers, useFollowing } from "@/hooks/useUsers"

type UserCard = {
  id: string; username: string; displayName: string
  reputation: number; level: number; title: string
  anime: number; isFollowing: boolean
}

const FOLLOWING_DATA: UserCard[] = [
  { id:"1", username:"otaku_arch",     displayName:"Otaku Arch",      reputation:1240, level:12, title:"Neural Oracle",  anime:412, isFollowing:true  },
  { id:"2", username:"shadow_watcher", displayName:"Shadow Watcher",  reputation:840,  level:9,  title:"Legendary",      anime:298, isFollowing:true  },
  { id:"3", username:"void_seeker",    displayName:"Void Seeker",     reputation:620,  level:7,  title:"Kage",            anime:256, isFollowing:true  },
  { id:"4", username:"cipher_ronin",   displayName:"Cipher Ronin",    reputation:320,  level:5,  title:"Anbu",            anime:178, isFollowing:true  },
  { id:"5", username:"neural_ghost",   displayName:"Neural Ghost",    reputation:480,  level:6,  title:"Elite Jonin",    anime:201, isFollowing:false },
  { id:"6", username:"alpha_watcher",  displayName:"Alpha Watcher",   reputation:240,  level:4,  title:"Jonin",           anime:156, isFollowing:false },
]

const FOLLOWERS_DATA: UserCard[] = [
  { id:"7",  username:"delta_weeb",     displayName:"Delta Weeb",      reputation:180, level:3, title:"Shinobi",         anime:134, isFollowing:false },
  { id:"8",  username:"kurosaki_fan",   displayName:"Kurosaki Fan",    reputation:140, level:3, title:"Shinobi",         anime:112, isFollowing:true  },
  { id:"9",  username:"titan_slayer",   displayName:"Titan Slayer",    reputation:110, level:2, title:"Apprentice",      anime:98,  isFollowing:false },
  { id:"10", username:"anime_oracle",   displayName:"Anime Oracle",    reputation:88,  level:2, title:"Apprentice",      anime:87,  isFollowing:true  },
]

type Tab = "following" | "followers"

export default function FollowingPage() {
  const { push } = useToast()
  const [tab, setTab] = useState<Tab>("following")
  const [query, setQuery] = useState("")
  const [followed, setFollowed] = useState<Set<string>>(new Set())

  const authUser = useAuthStore(s => s.user)
  const { data: followingData } = useFollowing(authUser?.username ?? "")
  const { data: followersData } = useFollowers(authUser?.username ?? "")

  // Map API users to local UserCard type
  const apiFollowing: UserCard[] = (followingData?.data ?? []).map((u: any) => ({
    id: u.id, username: u.username, displayName: u.displayName,
    reputation: u.reputation ?? 0, level: Math.max(1, Math.floor(Math.sqrt((u.reputation ?? 0) * 100 / 1000))),
    title: "Shinobi", anime: 0, isFollowing: true,
  }))
  const apiFollowers: UserCard[] = (followersData?.data ?? []).map((u: any) => ({
    id: u.id, username: u.username, displayName: u.displayName,
    reputation: u.reputation ?? 0, level: Math.max(1, Math.floor(Math.sqrt((u.reputation ?? 0) * 100 / 1000))),
    title: "Shinobi", anime: 0, isFollowing: followed.has(u.id),
  }))

  const base = tab === "following"
    ? (apiFollowing.length > 0 ? apiFollowing : FOLLOWING_DATA)
    : (apiFollowers.length > 0 ? apiFollowers : FOLLOWERS_DATA)
  const filtered = useMemo(() => base.filter(u =>
    !query || u.displayName.toLowerCase().includes(query.toLowerCase()) ||
    u.username.toLowerCase().includes(query.toLowerCase())
  ), [base, query])

  const toggle = (u: UserCard) => {
    setFollowed(s => {
      const n = new Set(s)
      if (n.has(u.id)) { n.delete(u.id); push(`Unfollowed @${u.username}`, "info") }
      else { n.add(u.id); push(`Now following @${u.username}! 🎌`, "success") }
      return n
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-32 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">Social Graph</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
            Connections<span style={{color:"#f59e0b"}}>.</span>
          </h1>
        </div>
        <Link href="/users" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-xs font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/[0.06] transition-all mt-2">
          <Users size={13} /> Find Shinobi
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-0">
        {(["following","followers"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative px-5 py-3 text-sm font-black uppercase tracking-widest capitalize transition-colors ${tab === t ? "text-white" : "text-white/35 hover:text-white/60"}`}
          >
            {t}
            <span className="ml-2 text-[9px] text-white/25 font-mono">
              {t === "following" ? (apiFollowing.length || FOLLOWING_DATA.length) : (apiFollowers.length || FOLLOWERS_DATA.length)}
            </span>
            {tab === t && (
              <motion.div layoutId="follow-tab-line"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${tab}…`}
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/40"
        />
      </div>

      {/* User grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((u, i) => {
            const isF = followed.has(u.id)
            return (
              <motion.div key={u.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors group"
              >
                <Link href={`/u/${u.username}`}
                  className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-xl shrink-0 group-hover:scale-105 transition-transform"
                >
                  {u.displayName[0]}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/u/${u.username}`}>
                    <p className="font-black text-white/80 group-hover:text-white transition-colors truncate">{u.displayName}</p>
                  </Link>
                  <p className="text-[9px] text-white/30 mt-0.5">@{u.username} · Lv.{u.level} {u.title}</p>
                  <p className="text-[9px] text-amber-400/60 mt-0.5">{u.anime} anime · {u.reputation} rep</p>
                </div>
                <button onClick={() => toggle(u)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    isF ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                        : "bg-amber-500 text-black hover:bg-amber-400"
                  }`}
                >
                  {isF ? <><Check size={11} /> Following</> : <><UserPlus size={11} /> Follow</>}
                </button>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed border-white/5 rounded-[3rem]">
          <Users size={24} className="mx-auto mb-3 text-white/15" />
          <p className="text-white/20 text-xs font-black uppercase tracking-widest">No results</p>
          <Link href="/users" className="mt-4 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-black uppercase tracking-widest transition-colors">
            Find Shinobi <ArrowRight size={11} />
          </Link>
        </div>
      )}
    </div>
  )
}
