"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Minus, Plus, Trophy } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useUpsertListEntry } from "@/hooks/useAnime"
import { useAuthStore } from "@/stores/auth.store"

interface EpisodeTrackerProps {
  totalEpisodes: number | null
  currentEpisode?: number
  animeId: string
}

export default function EpisodeTracker({ totalEpisodes, currentEpisode: initialEpisode = 0, animeId }: EpisodeTrackerProps) {
  const { push } = useToast()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const upsert = useUpsertListEntry(animeId)
  const [current, setCurrent] = useState(initialEpisode)

  // The saved progress (the user's ListEntry.episodesSeen) loads async — after
  // the anime query resolves and after the session is restored on refresh.
  // Re-sync local state whenever that saved value changes so a reload doesn't
  // show 0 over real progress. We skip while a save is in flight so the user's
  // own clicks aren't clobbered by a stale refetch mid-edit.
  useEffect(() => {
    if (upsert.isPending) return
    setCurrent(initialEpisode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEpisode])

  const saveProgress = (newEps: number, isComplete: boolean) => {
    upsert.mutate({
      status: isComplete ? "COMPLETED" : newEps > 0 ? "WATCHING" : "PLAN_TO_WATCH",
      episodesSeen: newEps,
    })
  }

  // Tracking is per-account — without a session there's nowhere to save, so the
  // count would silently reset on refresh. Prompt sign-in instead of pretending.
  const requireAuth = (): boolean => {
    if (isAuthenticated) return true
    push("Sign in to track your episode progress", "info")
    return false
  }

  /* Ongoing series */
  if (totalEpisodes === null) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between">
        <p className="text-sm font-bold text-muted">Ongoing series</p>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider text-emerald-400">
          ● Currently Airing
        </span>
      </div>
    )
  }

  const isCompleted = current === totalEpisodes
  const progress = totalEpisodes > 0 ? (current / totalEpisodes) * 100 : 0

  const decrement = () => {
    if (current <= 0) return
    if (!requireAuth()) return
    const next = current - 1
    setCurrent(next)
    saveProgress(next, false)
    push("Progress updated", "info")
  }

  const increment = () => {
    if (current >= totalEpisodes) return
    if (!requireAuth()) return
    const next = current + 1
    const complete = next === totalEpisodes
    setCurrent(next)
    saveProgress(next, complete)
    push(complete ? `🎉 Completed! All ${totalEpisodes} episodes watched!` : `Episode ${next} marked watched! 🎌`, "success")
  }

  const markAll = () => {
    if (!requireAuth()) return
    setCurrent(totalEpisodes)
    saveProgress(totalEpisodes, true)
    push(`All ${totalEpisodes} episodes marked as watched! 🎌`, "success")
  }

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
      {/* Progress label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted">
          {isCompleted ? (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Trophy size={13} /> Completed!
            </span>
          ) : (
            `${current} / ${totalEpisodes} episodes`
          )}
        </span>
        <span className="text-[10px] font-mono text-subtle">{Math.round(progress)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className={`h-full rounded-full ${isCompleted ? "bg-emerald-400" : "bg-accent"}`}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={decrement}
          disabled={current <= 0}
          className="h-9 w-9 rounded-xl border border-border bg-white/[0.04] flex items-center justify-center text-muted hover:text-foreground hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Minus size={14} />
        </button>

        <div className={`flex-1 text-center text-2xl font-black tracking-tighter ${isCompleted ? "text-emerald-400" : "text-foreground"}`}>
          {isCompleted ? <Trophy size={22} className="mx-auto text-emerald-400" /> : current}
        </div>

        <button
          onClick={increment}
          disabled={isCompleted}
          className="h-9 w-9 rounded-xl border border-accent/30 bg-accent/10 flex items-center justify-center text-accent-bright hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Mark all complete */}
      {current > 0 && !isCompleted && (
        <button
          onClick={markAll}
          className="w-full text-center text-[10px] font-black uppercase tracking-widest text-subtle hover:text-foreground transition-colors pt-1"
        >
          Mark all complete
        </button>
      )}
    </div>
  )
}
