"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { BookOpen, Plus, Minus, Loader2, Check } from "lucide-react"
import * as ep from "@/lib/api/endpoints"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import { ui } from "@/lib/design/tokens"
import type { MangaDTO, MangaEntry, MangaStatus } from "@/lib/api/types"

const STATUS_LABEL: Record<MangaStatus, string> = {
  READING: "Reading", COMPLETED: "Completed", PLAN_TO_READ: "Plan to Read", ON_HOLD: "On Hold", DROPPED: "Dropped",
}
const STATUS_OPTS: MangaStatus[] = ["READING", "COMPLETED", "PLAN_TO_READ", "ON_HOLD", "DROPPED"]

export function MangaDetailClient({ idOrSlug, initialManga }: { idOrSlug: string; initialManga: MangaDTO | null }) {
  const me = useAuthStore(s => s.user)

  // Authenticated client fetch also returns the viewer's readlistEntry (the
  // anonymous server fetch can't). initialData keeps first paint instant.
  const { data, isLoading } = useQuery({
    queryKey: ["manga", idOrSlug, !!me],
    queryFn: () => ep.getManga(idOrSlug),
    ...(initialManga ? { initialData: { manga: initialManga, readlistEntry: null } } : {}),
    staleTime: 60_000,
  })

  const manga = data?.manga ?? initialManga

  if (!manga && isLoading) {
    return (
      <div className={`max-w-5xl mx-auto ${ui.screenX} py-16 grid place-items-center min-h-[50vh]`}>
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    )
  }
  if (!manga) {
    return (
      <div className={`max-w-5xl mx-auto ${ui.screenX} py-24 text-center space-y-4`}>
        <BookOpen size={32} className="mx-auto text-subtle" />
        <p className="text-subtle font-black uppercase tracking-[0.25em] text-xs italic">Manga not found.</p>
        <Link href="/manga" className="inline-block text-accent-bright text-sm font-bold hover:underline">Browse manga →</Link>
      </div>
    )
  }

  const display = manga.titleEnglish || manga.title
  const metaChips = [
    manga.type,
    manga.demographic,
    manga.status,
    manga.chapters ? `${manga.chapters} chapters` : null,
    manga.volumes ? `${manga.volumes} volumes` : null,
    manga.publishedFrom ? new Date(manga.publishedFrom).getFullYear() : null,
  ].filter(Boolean)

  return (
    <div className={`max-w-5xl mx-auto ${ui.screenX} py-8 sm:py-14 space-y-10 pb-32`}>
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
        {/* COVER */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="w-44 sm:w-56 shrink-0 mx-auto sm:mx-0">
          <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-border bg-surface shadow-2xl">
            {manga.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={manga.imageUrl} alt={display} referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-subtle"><BookOpen size={40} /></div>
            )}
          </div>
        </motion.div>

        {/* HEADER + TRACKER */}
        <div className="flex-1 min-w-0 space-y-5">
          <div className="space-y-2">
            {manga.score != null && (
              <p className="text-accent-bright font-black text-sm tabular-nums">★ {manga.score.toFixed(2)} / 10</p>
            )}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-foreground leading-none">{display}</h1>
            {manga.titleEnglish && manga.title !== manga.titleEnglish && (
              <p className="text-sm text-muted font-bold">{manga.title}</p>
            )}
            {manga.authors.length > 0 && (
              <p className="text-[11px] font-bold text-subtle uppercase tracking-[0.2em]">by {manga.authors.join(", ")}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {metaChips.map(chip => (
              <span key={String(chip)} className="px-3 py-1.5 rounded-full bg-surface border border-border text-[9px] font-black uppercase tracking-widest text-muted">
                {chip}
              </span>
            ))}
          </div>

          <ReadlistWidget idOrSlug={idOrSlug} manga={manga} entry={data?.readlistEntry ?? null} authed={!!me} />
        </div>
      </div>

      {/* SYNOPSIS */}
      {manga.synopsis && (
        <section className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Synopsis</h2>
          <p className="text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line max-w-3xl">{manga.synopsis}</p>
        </section>
      )}

      {/* GENRES + SERIALIZATION */}
      <section className="space-y-4">
        {manga.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle w-24 shrink-0">Genres</span>
            {manga.genres.map(g => (
              <Link key={g} href={`/manga?genre=${encodeURIComponent(g)}`}
                className="px-3 py-1.5 rounded-full bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground hover:border-white/30 transition-all">
                {g}
              </Link>
            ))}
          </div>
        )}
        {manga.serializations.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle w-24 shrink-0">Serialized in</span>
            <span className="text-[11px] font-bold text-muted">{manga.serializations.join(", ")}</span>
          </div>
        )}
      </section>
    </div>
  )
}

/* ─── Add / track widget ────────────────────────────────────────────────────── */

function ReadlistWidget({ idOrSlug, manga, entry, authed }: {
  idOrSlug: string; manga: MangaDTO; entry: MangaEntry | null; authed: boolean
}) {
  const qc = useQueryClient()
  const { push } = useToast()
  const [busy, setBusy] = useState(false)

  const refresh = () => qc.invalidateQueries({ queryKey: ["manga", idOrSlug] })

  if (!authed) {
    return (
      <Link href={`/login?next=/manga/${manga.malId}`}
        className={`inline-flex items-center gap-2 px-6 ${ui.touch} rounded-2xl bg-accent text-black font-black text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all`}>
        <Plus size={15} /> Sign in to track
      </Link>
    )
  }

  if (!entry) {
    return (
      <button disabled={busy}
        onClick={async () => {
          setBusy(true)
          try { await ep.addMangaFromCatalog(manga.id); refresh(); push(`Added “${manga.titleEnglish || manga.title}” to your library`, "success") }
          catch { push("Couldn't add — try again.", "error") }
          finally { setBusy(false) }
        }}
        className={`inline-flex items-center gap-2 px-6 ${ui.touch} rounded-2xl bg-accent text-black font-black text-[11px] uppercase tracking-widest hover:opacity-90 active:scale-95 disabled:opacity-60 transition-all`}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add to Library
      </button>
    )
  }

  const patch = async (body: { status?: MangaStatus; progress?: number; volumesRead?: number }) => {
    setBusy(true)
    try { await ep.updateMangaEntry(entry.id, body); refresh() }
    catch { push("Couldn't update — try again.", "error") }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-3 max-w-md">
      <div className="flex items-center gap-2">
        <div className="h-11 px-3 rounded-xl bg-accent/10 border border-accent/30 grid place-items-center text-accent-bright shrink-0">
          <Check size={15} />
        </div>
        <select value={entry.status} onChange={e => patch({ status: e.target.value as MangaStatus })}
          aria-label="Reading status" disabled={busy}
          className="flex-1 min-w-0 min-h-11 bg-surface border border-border rounded-xl px-3 text-[11px] font-bold text-foreground outline-none focus:border-accent/50 cursor-pointer">
          {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
      <Stepper label="Chapters" value={entry.progress} max={manga.chapters} busy={busy}
        onDelta={d => patch({ progress: Math.max(0, entry.progress + d) })} />
      <Stepper label="Volumes" value={entry.volumesRead ?? 0} max={manga.volumes} busy={busy}
        onDelta={d => patch({ volumesRead: Math.max(0, (entry.volumesRead ?? 0) + d) })} />
    </div>
  )
}

function Stepper({ label, value, max, busy, onDelta }: {
  label: string; value: number; max: number | null; busy: boolean; onDelta: (d: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle w-20 shrink-0">{label}</span>
      <button type="button" disabled={busy || value <= 0} onClick={() => onDelta(-1)} aria-label={`${label} -1`}
        className="h-9 w-9 rounded-xl bg-surface border border-border grid place-items-center text-muted hover:text-foreground active:scale-95 disabled:opacity-40 transition-all"><Minus size={13} /></button>
      <span className="text-sm font-black text-foreground tabular-nums min-w-16 text-center">
        {value}{max ? ` / ${max}` : ""}
      </span>
      <button type="button" disabled={busy || (!!max && value >= max)} onClick={() => onDelta(1)} aria-label={`${label} +1`}
        className="h-9 w-9 rounded-xl bg-accent text-black grid place-items-center hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all"><Plus size={13} /></button>
    </div>
  )
}
