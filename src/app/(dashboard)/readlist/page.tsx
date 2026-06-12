"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, Plus, Loader2, X } from "lucide-react"
import { ReadCard } from "@/components/readlist/ReadCard"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import * as ep from "@/lib/api/endpoints"
import type { MangaEntry, MangaSearchResult, MangaStatus } from "@/lib/api/types"

const TABS: Array<{ label: string; status: MangaStatus | "ALL" }> = [
  { label: "All", status: "ALL" },
  { label: "Reading", status: "READING" },
  { label: "Completed", status: "COMPLETED" },
  { label: "Plan to Read", status: "PLAN_TO_READ" },
  { label: "On Hold", status: "ON_HOLD" },
  { label: "Dropped", status: "DROPPED" },
]

export default function ReadlistPage() {
  const params = useParams()
  const me = useAuthStore(s => s.user)
  const qc = useQueryClient()
  const { push } = useToast()

  // Whose list? slug from /user/[slug]/readlist, else the logged-in user (dashboard).
  const slug = (params?.slug as string) || me?.slug || me?.username || ""
  const isOwner = !params?.slug || params.slug === me?.slug || params.slug === me?.username

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<MangaStatus | "ALL">("ALL")
  const [addOpen, setAddOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["readlist", slug],
    queryFn: () => ep.getReadlist(slug),
    enabled: !!slug,
  })
  const list: MangaEntry[] = data?.data ?? []

  const refresh = useCallback(() => qc.invalidateQueries({ queryKey: ["readlist", slug] }), [qc, slug])

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return list.filter(m => {
      const matchesSearch = !q || m.title.toLowerCase().includes(q) || (m.author ?? "").toLowerCase().includes(q)
      const matchesTab = activeTab === "ALL" || m.status === activeTab
      return matchesSearch && matchesTab
    })
  }, [list, searchQuery, activeTab])

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-16 space-y-16 pb-40">
      {/* HEADER & SEARCH */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-accent-bright font-black uppercase tracking-[0.4em] text-[10px]">
            Archives Repository • {list.length} Title{list.length === 1 ? "" : "s"}
          </motion.div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-foreground leading-none">
            Library<span className="text-accent">.</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle group-focus-within:text-accent-bright transition-colors" size={20} />
            <input type="text" placeholder="Search your chronicles..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-surface border border-border text-foreground placeholder:text-subtle focus:outline-none focus:border-accent/50 transition-all" />
          </div>
          {isOwner && (
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-accent text-black font-black text-[11px] uppercase tracking-widest hover:opacity-90 transition-opacity whitespace-nowrap">
              <Plus size={16} /> Add Manga
            </button>
          )}
        </div>
      </header>

      {/* TABS */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide border-b border-border">
        {TABS.map(({ label, status }) => (
          <button key={status} onClick={() => setActiveTab(status)}
            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === status ? "bg-accent text-black" : "bg-surface text-muted hover:bg-surface border border-border"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[2.8rem] border border-border bg-surface/40 h-[520px] animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filtered.map(manga => (
              <ReadCard key={manga.id} manga={manga} owner={isOwner}
                onChange={async (patch) => {
                  try { await ep.updateMangaEntry(manga.id, patch); refresh() }
                  catch { push("Couldn't update — try again.", "error") }
                }}
                onRemove={async () => {
                  try { await ep.removeMangaEntry(manga.id); refresh(); push("Removed from library", "success") }
                  catch { push("Couldn't remove — try again.", "error") }
                }} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="py-32 text-center border border-dashed border-border rounded-[3rem] bg-white/[0.01]">
          <p className="text-subtle font-black uppercase tracking-[0.3em] text-xs italic">
            {list.length === 0 ? (isOwner ? "Your library is empty — add your first manga." : "No manga in this library yet.") : "No entries match your query."}
          </p>
          {isOwner && list.length === 0 && (
            <button onClick={() => setAddOpen(true)} className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent text-black font-black text-[11px] uppercase tracking-widest">
              <Plus size={15} /> Add Manga
            </button>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {addOpen && <AddMangaModal onClose={() => setAddOpen(false)} existing={list} onAdded={refresh} />}
      </AnimatePresence>
    </div>
  )
}

/* ─── Add-manga search modal (AniList) ─────────────────────────────────────── */
function AddMangaModal({ onClose, existing, onAdded }: { onClose: () => void; existing: MangaEntry[]; onAdded: () => void }) {
  const { push } = useToast()
  const [q, setQ] = useState("")
  const [results, setResults] = useState<MangaSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<number | null>(null)
  const existingIds = useMemo(() => new Set(existing.map(e => e.anilistId)), [existing])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setResults([]); setSearching(false); return }
    setSearching(true)
    const t = setTimeout(async () => {
      try { setResults((await ep.searchManga(term)).data) }
      catch { setResults([]) }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  async function add(m: MangaSearchResult) {
    setAdding(m.anilistId)
    try { await ep.addManga(m); onAdded(); push(`Added “${m.title}”`, "success") }
    catch { push("Couldn't add — try again.", "error") }
    finally { setAdding(null) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/75 backdrop-blur-sm p-4 pt-24">
      <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl border border-border bg-background overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search size={18} className="text-subtle" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search manga (AniList)…"
            className="flex-1 bg-transparent text-foreground placeholder:text-subtle outline-none text-sm" />
          {searching && <Loader2 size={16} className="animate-spin text-accent" />}
          <button onClick={onClose} className="text-subtle hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {q.trim().length < 2 ? (
            <p className="p-8 text-center text-xs text-subtle">Type at least 2 characters to search AniList.</p>
          ) : results.length === 0 && !searching ? (
            <p className="p-8 text-center text-xs text-subtle">No manga found for “{q.trim()}”.</p>
          ) : (
            results.map(m => {
              const already = existingIds.has(m.anilistId)
              return (
                <div key={m.anilistId} className="flex items-center gap-3 p-3 border-b border-border hover:bg-surface/40 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {m.coverUrl ? <img src={m.coverUrl} alt="" referrerPolicy="no-referrer" className="h-16 w-12 rounded-lg object-cover shrink-0" />
                    : <div className="h-16 w-12 rounded-lg bg-surface shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-foreground truncate">{m.title}</div>
                    <div className="text-[11px] text-subtle truncate">{[m.author, m.format, m.totalChapters ? `${m.totalChapters} ch` : null].filter(Boolean).join(" · ")}</div>
                  </div>
                  <button disabled={already || adding === m.anilistId} onClick={() => add(m)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      already ? "bg-surface text-subtle cursor-default" : "bg-accent text-black hover:opacity-90"
                    }`}>
                    {adding === m.anilistId ? <Loader2 size={13} className="animate-spin" /> : already ? "Added" : "Add"}
                  </button>
                </div>
              )
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
