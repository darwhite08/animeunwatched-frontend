"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { X, Minus, Plus, Loader2, Check, Star } from "lucide-react"
import { useUpsertEntry } from "@/hooks/useLists"
import { useToast } from "@/stores/toast.store"
import type { WatchStatus } from "@/lib/api/types"

export type EditEntryTarget = {
  animeId: string
  title: string
  statusEnum: WatchStatus
  episodesSeen: number
  totalEpisodes: number
  score: number | null
}

const STATUS_OPTIONS: Array<{ value: WatchStatus; label: string }> = [
  { value: "WATCHING",      label: "Watching"      },
  { value: "REWATCHING",    label: "Rewatching"    },
  { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
  { value: "COMPLETED",     label: "Completed"     },
  { value: "ON_HOLD",       label: "On Hold"       },
  { value: "DROPPED",       label: "Dropped"       },
]

export function EditEntryModal({ target, onClose }: { target: EditEntryTarget; onClose: () => void }) {
  const { push } = useToast()
  const upsert = useUpsertEntry()

  const [status, setStatus]   = useState<WatchStatus>(target.statusEnum)
  const [seen, setSeen]       = useState<number>(target.episodesSeen)
  const [score, setScore]     = useState<number>(target.score ?? 0)

  const total = target.totalEpisodes
  const clampSeen = (n: number) => Math.max(0, total > 0 ? Math.min(total, n) : n)

  const save = () => {
    // Completing an anime fills progress to the full episode count.
    const nextSeen = status === "COMPLETED" && total > 0 ? total : seen
    upsert.mutate(
      { animeId: target.animeId, status, episodesSeen: nextSeen, score: score > 0 ? score : undefined },
      {
        onSuccess: () => { push(`Updated "${target.title}"`, "success"); onClose() },
        onError:   () => push("Couldn't save changes. Try again.", "error"),
      },
    )
  }

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => !upsert.isPending && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-1">Edit Entry</p>
            <h3 className="text-lg font-black tracking-tight text-foreground leading-tight line-clamp-2">{target.title}</h3>
          </div>
          <button onClick={onClose} disabled={upsert.isPending}
            className="shrink-0 w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted hover:text-foreground transition-colors disabled:opacity-50">
            <X size={15} />
          </button>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-subtle">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map(opt => {
              const active = status === opt.value
              return (
                <button key={opt.value} onClick={() => setStatus(opt.value)}
                  className={`px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all ${
                    active ? "border-accent/50 bg-accent/12 text-foreground" : "border-border bg-black/20 text-muted hover:text-foreground hover:border-white/30"
                  }`}>
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Episodes */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-subtle">
            <span>Episodes Watched</span>
            <span className="font-mono text-muted">{seen}{total > 0 ? ` / ${total}` : ""}</span>
          </label>
          <div className="flex items-center gap-3">
            <button onClick={() => setSeen(s => clampSeen(s - 1))} disabled={seen <= 0}
              className="h-11 w-11 shrink-0 rounded-xl border border-border bg-black/20 flex items-center justify-center text-muted hover:text-foreground hover:border-white/30 transition-all disabled:opacity-30">
              <Minus size={15} />
            </button>
            <input
              type="number" inputMode="numeric" min={0} max={total > 0 ? total : undefined}
              value={seen}
              onChange={e => setSeen(clampSeen(parseInt(e.target.value || "0", 10)))}
              className="flex-1 min-w-0 rounded-xl bg-black/30 border border-border px-4 py-3 text-center text-base font-mono text-foreground outline-none focus:border-accent/40 transition-colors"
            />
            <button onClick={() => setSeen(s => clampSeen(s + 1))} disabled={total > 0 && seen >= total}
              className="h-11 w-11 shrink-0 rounded-xl border border-border bg-black/20 flex items-center justify-center text-muted hover:text-foreground hover:border-white/30 transition-all disabled:opacity-30">
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* Score */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-subtle">
            <span>Your Score</span>
            {score > 0 && <button onClick={() => setScore(0)} className="text-[9px] text-subtle hover:text-foreground transition-colors">Clear</button>}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
              const active = score >= n
              return (
                <button key={n} onClick={() => setScore(n)} aria-label={`Score ${n}`}
                  className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all ${
                    active ? "border-accent/50 bg-accent/15 text-accent-bright" : "border-border bg-black/20 text-subtle hover:text-foreground hover:border-white/30"
                  }`}>
                  <Star size={14} fill={active ? "currentColor" : "none"} />
                </button>
              )
            })}
          </div>
          <p className="text-[9px] text-subtle">{score > 0 ? `${score}/10` : "Not rated"}</p>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} disabled={upsert.isPending}
            className="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-muted hover:text-foreground transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={save} disabled={upsert.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-black transition-all disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
            {upsert.isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={13} /> Save</>}
          </button>
        </div>
      </motion.div>
    </div>
  )

  if (typeof document === "undefined") return null
  return createPortal(modal, document.body)
}
