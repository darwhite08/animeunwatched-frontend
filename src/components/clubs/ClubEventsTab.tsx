"use client"

import { useState } from "react"
import { CalendarDays, Plus, Clock, Users, Tv, X, Trash2 } from "lucide-react"
import { useClubEvents, useCreateClubEvent, useRsvpEvent, useDeleteEvent, type ClubEvent } from "@/hooks/useClubs"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"

const KIND_LABEL: Record<string, string> = { WATCH_PARTY: "🎬 Watch party", AMA: "💬 AMA", GAME_NIGHT: "🎮 Game night", GENERAL: "📅 Event" }

function countdown(iso: string): { label: string; soon: boolean; live: boolean } {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0 && ms > -3 * 3600_000) return { label: "Live now", soon: true, live: true }
  if (ms <= 0) return { label: "Ended", soon: false, live: false }
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000)
  return { label: d > 0 ? `in ${d}d ${h}h` : h > 0 ? `in ${h}h ${m}m` : `in ${m}m`, soon: ms < 3600_000, live: false }
}

export function ClubEventsTab({ slug, isMember, isAdmin }: { slug: string; isMember: boolean; isAdmin: boolean }) {
  const myId = useAuthStore((s) => s.user?.id)
  const { push } = useToast()
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming")
  const { data: events, isLoading } = useClubEvents(slug, filter)
  const rsvp = useRsvpEvent(slug)
  const del = useDeleteEvent(slug)
  const [composing, setComposing] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["upcoming", "past"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${filter === f ? "bg-accent text-black" : "bg-surface text-muted hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
        {isMember && <button onClick={() => setComposing(true)} className="flex items-center gap-1 text-sm font-semibold text-accent hover:opacity-80"><Plus size={16} /> New event</button>}
      </div>

      {isLoading ? <p className="py-10 text-center text-sm text-muted">Loading…</p> : !events?.length ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-12 text-center">
          <CalendarDays size={28} className="text-muted" />
          <p className="text-sm font-semibold text-foreground">{filter === "upcoming" ? "No upcoming events" : "No past events"}</p>
          <p className="text-xs text-muted">{isMember ? "Schedule a watch party or AMA." : "Join to create events."}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {events.map((ev) => <EventCard key={ev.id} ev={ev} canDelete={isAdmin || ev.creator.id === myId} onRsvp={(s) => rsvp.mutate({ eventId: ev.id, status: s })} onDelete={() => del.mutate(ev.id)} />)}
        </div>
      )}

      {composing && <EventComposer slug={slug} onClose={() => setComposing(false)} onDone={() => { setComposing(false); push("Event created", "success") }} />}
    </div>
  )
}

function EventCard({ ev, canDelete, onRsvp, onDelete }: { ev: ClubEvent; canDelete: boolean; onRsvp: (s: "GOING" | "MAYBE" | "NOT_GOING") => void; onDelete: () => void }) {
  const cd = countdown(ev.startsAt)
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-accent">{KIND_LABEL[ev.kind] ?? ev.kind}</span>
        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cd.live ? "bg-rose-500/20 text-rose-300" : cd.soon ? "bg-accent/20 text-accent-bright" : "bg-background text-muted"}`}><Clock size={10} /> {cd.label}</span>
      </div>
      <h3 className="mt-1 text-base font-bold italic text-foreground">{ev.title}</h3>
      <p className="text-xs text-muted">{new Date(ev.startsAt).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}{ev.episodeNumber ? ` · Ep ${ev.episodeNumber}` : ""}</p>
      {ev.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{ev.description}</p>}
      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
        <span>by @{ev.creator.username}</span>
        <span className="flex items-center gap-1"><Users size={11} /> {ev.rsvpCounts.GOING} going</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {(["GOING", "MAYBE", "NOT_GOING"] as const).map((s) => (
          <button key={s} onClick={() => onRsvp(s)} className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${ev.myRsvp === s ? "bg-accent text-black" : "bg-background text-muted hover:text-foreground"}`}>{s === "GOING" ? "Going" : s === "MAYBE" ? "Maybe" : "Can't"}</button>
        ))}
        {cd.live && <span className="flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold text-foreground"><Tv size={11} /> Live</span>}
        {canDelete && <button onClick={onDelete} className="ml-auto text-muted transition hover:text-rose-400"><Trash2 size={15} /></button>}
      </div>
    </div>
  )
}

function EventComposer({ slug, onClose, onDone }: { slug: string; onClose: () => void; onDone: () => void }) {
  const create = useCreateClubEvent(slug)
  const { push } = useToast()
  const [title, setTitle] = useState("")
  const [kind, setKind] = useState<ClubEvent["kind"]>("WATCH_PARTY")
  const [startsAt, setStartsAt] = useState("")
  const [malId, setMalId] = useState("")
  const [episode, setEpisode] = useState("")
  const [description, setDescription] = useState("")
  const canSave = title.trim().length >= 3 && startsAt && !create.isPending

  async function save() {
    if (!canSave) return
    try {
      await create.mutateAsync({
        title: title.trim(), kind, startsAt: new Date(startsAt).toISOString(),
        ...(malId ? { animeMalId: Number(malId) } : {}), ...(episode ? { episodeNumber: Number(episode) } : {}),
        ...(description.trim() ? { description: description.trim() } : {}), location: "club chat",
      })
      onDone()
    } catch { push("Couldn't create event", "error") }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-bold text-foreground">New event</h3><button onClick={onClose}><X size={20} className="text-muted" /></button></div>
        <div className="space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base sm:text-sm text-foreground outline-none focus:border-accent" />
          <div className="flex flex-wrap gap-1.5">
            {(["WATCH_PARTY", "AMA", "GAME_NIGHT", "GENERAL"] as const).map((k) => (
              <button key={k} onClick={() => setKind(k)} className={`rounded-full px-3 py-1 text-xs font-semibold ${kind === k ? "bg-accent text-black" : "bg-background text-muted"}`}>{KIND_LABEL[k]}</button>
            ))}
          </div>
          <label className="block text-xs text-muted">Starts at<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base sm:text-sm text-foreground outline-none focus:border-accent" /></label>
          {kind === "WATCH_PARTY" && (
            <div className="flex gap-2">
              <input value={malId} onChange={(e) => setMalId(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="MAL ID (optional)" className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-base sm:text-sm text-foreground outline-none focus:border-accent" />
              <input value={episode} onChange={(e) => setEpisode(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Ep #" className="w-24 rounded-xl border border-border bg-background px-3 py-2.5 text-base sm:text-sm text-foreground outline-none focus:border-accent" />
            </div>
          )}
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Details (optional)" className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-base sm:text-sm text-foreground outline-none focus:border-accent" />
          <button onClick={save} disabled={!canSave} className="w-full rounded-xl bg-accent py-2.5 text-sm font-bold text-black disabled:opacity-40">{create.isPending ? "Creating…" : "Create event"}</button>
        </div>
      </div>
    </div>
  )
}
