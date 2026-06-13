"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Trash2, Minus, Plus, BookOpen } from "lucide-react"
import type { MangaEntry, MangaStatus } from "@/lib/api/types"

const STATUS_LABEL: Record<MangaStatus, string> = {
  READING: "Reading", COMPLETED: "Completed", PLAN_TO_READ: "Plan to Read", ON_HOLD: "On Hold", DROPPED: "Dropped",
}
const STATUS_OPTS: MangaStatus[] = ["READING", "COMPLETED", "PLAN_TO_READ", "ON_HOLD", "DROPPED"]

export function ReadCard({
  manga, owner, onChange, onRemove,
}: {
  manga: MangaEntry
  owner: boolean
  onChange: (patch: { status?: MangaStatus; progress?: number }) => void
  onRemove: () => void
}) {
  const { title, author, coverUrl, genre, status, progress, totalChapters } = manga
  const [busy, setBusy] = useState(false)

  const pct = totalChapters && totalChapters > 0
    ? Math.min(100, Math.round((progress / totalChapters) * 100))
    : status === "COMPLETED" ? 100 : 0

  const bumpProgress = async (delta: number) => {
    const next = Math.max(0, progress + delta)
    if (totalChapters && next > totalChapters) return
    setBusy(true); await onChange({ progress: next }); setBusy(false)
  }

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }} whileTap={{ scale: 0.98 }}
      className="group relative rounded-3xl sm:rounded-[2.8rem] border border-border bg-background overflow-hidden transition-all duration-500 hover:border-accent/40 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
      {/* COVER */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
        {coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={coverUrl} alt={title} referrerPolicy="no-referrer" loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.7] group-hover:brightness-100" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-subtle"><BookOpen size={40} /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-transparent to-transparent z-10" />
        <div className="absolute top-3 sm:top-6 inset-x-3 sm:inset-x-6 flex justify-between items-start gap-2 z-20">
          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-border text-[9px] font-black uppercase tracking-[0.15em] text-accent-bright truncate max-w-[70%]">
            {genre || "Manga"}
          </div>
          {owner && (
            <button type="button" onClick={onRemove} aria-label="Remove from library"
              className="shrink-0 h-11 w-11 sm:h-9 sm:w-9 grid place-items-center bg-black/50 backdrop-blur-md rounded-xl border border-border text-subtle hover:text-rose-400 hover:border-rose-400/40 active:scale-95 transition-all">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 relative">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg lg:text-xl font-black text-foreground tracking-tight leading-tight line-clamp-2 group-hover:text-accent-bright transition-colors">{title}</h3>
          {author && <p className="text-[10px] sm:text-[11px] font-bold text-subtle uppercase tracking-[0.2em] truncate">{author}</p>}
        </div>

        {/* PROGRESS */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em]">
            <span className="text-muted italic truncate">{STATUS_LABEL[status]}</span>
            <span className="text-foreground tabular-nums shrink-0">
              {totalChapters ? `${progress} / ${totalChapters} ch` : `${progress} ch`}
            </span>
          </div>
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "circOut" }}
              className="h-full rounded-full" style={{ background: "linear-gradient(90deg,var(--app-accent),var(--app-accent-bright))" }} />
          </div>
        </div>

        {/* OWNER CONTROLS */}
        {owner ? (
          <div className="flex items-center gap-2">
            <select value={status} onChange={e => onChange({ status: e.target.value as MangaStatus })}
              aria-label="Reading status"
              className="flex-1 min-w-0 min-h-11 bg-surface border border-border rounded-xl px-3 text-[11px] font-bold text-foreground outline-none focus:border-accent/50 cursor-pointer">
              {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" disabled={busy || progress <= 0} onClick={() => bumpProgress(-1)} aria-label="Chapter -1"
                className="h-11 w-11 rounded-xl bg-surface border border-border grid place-items-center text-muted hover:text-foreground active:scale-95 disabled:opacity-40 disabled:active:scale-100 transition-all"><Minus size={15} /></button>
              <button type="button" disabled={busy || (!!totalChapters && progress >= totalChapters)} onClick={() => bumpProgress(1)} aria-label="Chapter +1"
                className="h-11 w-11 rounded-xl bg-accent text-black grid place-items-center hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:active:scale-100 transition-all"><Plus size={15} /></button>
            </div>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
