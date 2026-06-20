"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Users, Search, Check, UserPlus, ArrowRight } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useFollowers, useFollowing, useFollow } from "@/hooks/useUsers"
import { Avatar } from "@/components/ui/Avatar"
import { useQueryClient } from "@tanstack/react-query"

type UserCard = {
  id: string; username: string; displayName: string
  avatarUrl?: string | null
  reputation: number; level: number; title: string
  anime: number; isFollowing: boolean
}

// No more mock fallbacks — empty list renders an empty-state CTA.

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
    id: u.id, username: u.username, displayName: u.displayName, avatarUrl: u.avatarUrl ?? null,
    reputation: u.reputation ?? 0, level: Math.max(1, Math.floor(Math.sqrt((u.reputation ?? 0) * 100 / 1000))),
    title: "Shinobi", anime: 0, isFollowing: true,
  }))
  const apiFollowers: UserCard[] = (followersData?.data ?? []).map((u: any) => ({
    id: u.id, username: u.username, displayName: u.displayName, avatarUrl: u.avatarUrl ?? null,
    reputation: u.reputation ?? 0, level: Math.max(1, Math.floor(Math.sqrt((u.reputation ?? 0) * 100 / 1000))),
    title: "Shinobi", anime: 0, isFollowing: followed.has(u.id),
  }))

  const base = tab === "following" ? apiFollowing : apiFollowers
  const filtered = useMemo(() => base.filter(u =>
    !query || u.displayName.toLowerCase().includes(query.toLowerCase()) ||
    u.username.toLowerCase().includes(query.toLowerCase())
  ), [base, query])

  // Real follow/unfollow against the backend, with cache invalidation so
  // the lists update immediately for both tabs.
  const qc = useQueryClient()
  const followMut = useFollow("")  // we'll target via username below
  const toggle = (u: UserCard) => {
    const wasFollowing = (tab === "following") || followed.has(u.id)
    // Optimistic local toggle
    setFollowed(s => {
      const n = new Set(s)
      if (n.has(u.id)) n.delete(u.id)
      else             n.add(u.id)
      return n
    })
    void import("@/lib/api/endpoints").then(ep => {
      const promise = wasFollowing
        ? ep.unfollow(u.username)
        : ep.follow(u.username)
      promise
        .then(() => {
          push(wasFollowing ? `Unfollowed @${u.username}` : `Now following @${u.username}! 🎌`,
               wasFollowing ? "info" : "success")
          // Invalidate so the lists refetch with the new follow state
          qc.invalidateQueries({ queryKey: ["users", authUser?.username, "followers"] })
          qc.invalidateQueries({ queryKey: ["users", authUser?.username, "following"] })
        })
        .catch(() => {
          // Revert optimistic state
          setFollowed(s => {
            const n = new Set(s)
            if (n.has(u.id)) n.delete(u.id)
            else             n.add(u.id)
            return n
          })
          push("Could not update follow — try again.", "error")
        })
    })
  }
  void followMut  // silence unused — we go via direct endpoint for flexibility

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-32 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">Social Graph</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-foreground">
            Connections<span style={{color:"var(--app-accent)"}}>.</span>
          </h1>
        </div>
        <Link href="/users" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-black uppercase tracking-widest text-muted hover:text-foreground hover:bg-surface transition-all mt-2">
          <Users size={13} /> Find Shinobi
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {(["following","followers"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`relative px-5 py-3 text-sm font-black uppercase tracking-widest capitalize transition-colors ${tab === t ? "text-foreground" : "text-subtle hover:text-muted"}`}
          >
            {t}
            <span className="ml-2 text-[9px] text-subtle font-mono">
              {t === "following" ? apiFollowing.length : apiFollowers.length}
            </span>
            {tab === t && (
              <motion.div layoutId="follow-tab-line"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${tab}…`}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-2xl text-sm text-foreground placeholder:text-muted outline-none focus:border-accent/40"
        />
      </div>

      {/* User grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((u, i) => {
            const isF = followed.has(u.id)
            return (
              <motion.div key={u.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border hover:border-border transition-colors group"
              >
                <Link href={`/u/${u.username}`} className="shrink-0 group-hover:scale-105 transition-transform">
                  <Avatar src={u.avatarUrl} name={u.displayName} size={48} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/u/${u.username}`}>
                    <p className="font-black text-muted group-hover:text-foreground transition-colors truncate">{u.displayName}</p>
                  </Link>
                  <p className="text-[9px] text-subtle mt-0.5">@{u.username} · Lv.{u.level} {u.title}</p>
                  <p className="text-[9px] text-accent-bright/60 mt-0.5">{u.anime} anime · {u.reputation} rep</p>
                </div>
                <button onClick={() => toggle(u)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    isF ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                        : "bg-accent text-black hover:bg-accent-bright"
                  }`}
                >
                  {isF ? <><Check size={11} /> Following</> : <><UserPlus size={11} /> Follow</>}
                </button>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed border-border rounded-[3rem]">
          <Users size={24} className="mx-auto mb-3 text-subtle" />
          <p className="text-subtle text-xs font-black uppercase tracking-widest">No results</p>
          <Link href="/users" className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent-bright hover:text-foreground font-black uppercase tracking-widest transition-colors">
            Find Shinobi <ArrowRight size={11} />
          </Link>
        </div>
      )}
    </div>
  )
}
