"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Sparkles, Star, BookmarkCheck, MessageSquareText } from "lucide-react"
import { useLivePlatformActivity, type PlatformActivity } from "@/hooks/useRealtime"

const KIND_ICON: Record<PlatformActivity["kind"], typeof Sparkles> = {
  watched: BookmarkCheck,
  rated: Star,
  reviewed: MessageSquareText,
  posted: Sparkles,
  followed: Sparkles,
}

function verbFor(a: PlatformActivity): string {
  if (a.kind === "watched") {
    if (a.status === "COMPLETED") return "finished"
    if (a.status === "WATCHING")  return "started watching"
    if (a.status === "DROPPED")   return "dropped"
    if (a.status === "ON_HOLD")   return "paused"
    if (a.status === "PLAN_TO_WATCH") return "added"
    return "is watching"
  }
  if (a.kind === "rated")    return a.score ? `rated ${a.score}/10` : "rated"
  if (a.kind === "reviewed") return "reviewed"
  if (a.kind === "posted")   return "posted about"
  if (a.kind === "followed") return "followed"
  return "did something on"
}

function ActivityRow({ a }: { a: PlatformActivity }) {
  const Icon = KIND_ICON[a.kind] ?? Sparkles
  const verb = verbFor(a)
  const targetHref = a.target?.kind === "anime" && a.target.malId
    ? `/anime/${a.target.malId}`
    : a.target?.kind === "user" && a.target.username
      ? `/u/${a.target.username}`
      : a.target?.kind === "post" && a.target.id
        ? `/posts/${a.target.id}`
        : "#"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -16, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface transition-colors whitespace-nowrap"
    >
      <Icon size={11} className="text-accent-bright shrink-0" />
      <Link href={`/u/${a.actor.username}`} className="text-[11px] font-black text-foreground hover:text-accent-bright transition-colors">
        {a.actor.displayName ?? a.actor.username}
      </Link>
      <span className="text-[11px] text-muted">{verb}</span>
      {a.target && (
        <Link href={targetHref} className="text-[11px] font-bold text-accent-bright/80 hover:text-amber-200 transition-colors max-w-[180px] truncate">
          {a.target.label}
        </Link>
      )}
    </motion.div>
  )
}

export function ActivityTicker({ maxItems = 8 }: { maxItems?: number }) {
  const activity = useLivePlatformActivity(maxItems)
  if (activity.length === 0) return null

  return (
    <div className="relative overflow-hidden w-full" aria-label="Live community activity">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#020202] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#020202] to-transparent z-10 pointer-events-none" />
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-2">
        <AnimatePresence initial={false}>
          {activity.map(a => (
            <ActivityRow key={`${a.actor.id}-${a.at}-${a.target?.label ?? ""}`} a={a} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
