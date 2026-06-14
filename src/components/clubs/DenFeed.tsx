"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Flame,
  MessageSquare,
  ImagePlus,
  Loader2,
  X,
  Pin,
  PinOff,
  Lock,
  LockOpen,
  Trash2,
  Share2,
  Bookmark,
  Sparkles,
  ArrowUpDown,
  MoreHorizontal,
  EyeOff,
  Tag,
} from "lucide-react"
import {
  useClubThreads,
  useCreateClubThread,
  useReactClubThread,
  useSaveThread,
  useThreadModActions,
  HYPE_EMOJI,
  type ReactionSummary,
} from "@/hooks/useThreads"
import { useImageUpload } from "@/hooks/useImageUpload"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"

/* ── Flair (post tags) ── */
type Flair = { id: string; label: string; cls: string }
const FLAIRS: Flair[] = [
  { id: "discussion", label: "Discussion", cls: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" },
  { id: "theory",     label: "Theory",     cls: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  { id: "fan-art",    label: "Fan Art",    cls: "bg-pink-500/15 text-pink-300 border-pink-500/30" },
  { id: "news",       label: "News",       cls: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  { id: "question",   label: "Question",   cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  { id: "meme",       label: "Meme",       cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  { id: "spoiler",    label: "Spoiler",    cls: "bg-red-500/15 text-red-300 border-red-500/30" },
]
const FLAIR_BY_ID = Object.fromEntries(FLAIRS.map(f => [f.id, f]))
const SPOILER = "spoiler"

/* ── helpers ── */
function relativeTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  if (d < 60_000) return "just now"
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m`
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h`
  if (d < 604_800_000) return `${Math.floor(d / 86_400_000)}d`
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
function hypeOf(reactions?: ReactionSummary[]) {
  const h = reactions?.find(r => r.emoji === HYPE_EMOJI)
  return { count: h?.count ?? 0, mine: !!h?.reactedByMe }
}
function cleanBody(s: string) {
  const t = (s ?? "").trim()
  return t === "📷" ? "" : t
}

type Sort = "hot" | "new" | "top"
const SORTS: { id: Sort; label: string; icon: typeof Flame }[] = [
  { id: "hot", label: "Hot", icon: Flame },
  { id: "new", label: "New", icon: Sparkles },
  { id: "top", label: "Top", icon: ArrowUpDown },
]

/* ── Inline composer ── */
function Composer({ slug, denName }: { slug: string; denName: string }) {
  const me = useAuthStore(s => s.user)
  const { push } = useToast()
  const create = useCreateClubThread(slug)
  const { upload, isUploading } = useImageUpload("post")
  const fileRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [flair, setFlair] = useState<string | null>(null)

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!open) setOpen(true)
    try {
      const { publicUrl } = await upload(file)
      setImage(publicUrl)
    } catch (err) {
      push(err instanceof Error ? err.message : "Couldn't upload image", "error")
    }
  }

  const reset = () => { setTitle(""); setBody(""); setImage(null); setFlair(null); setOpen(false) }
  const canPost = (body.trim().length >= 1 || !!image) && !isUploading && !create.isPending

  const submit = () => {
    const raw = body.trim() || "📷"
    if (raw.length < 10 && !image) {
      push("Add a little more — discussions need ~10 characters.", "info")
      return
    }
    let finalTitle = title.trim()
    if (!finalTitle) finalTitle = body.trim().split("\n")[0].slice(0, 100)
    if (finalTitle.length < 3) finalTitle = `${denName} discussion`
    create.mutate(
      {
        title: finalTitle,
        content: raw.length < 10 ? raw.padEnd(10, " ") : raw,
        imageUrl: image,
        tags: flair ? [flair] : [],
      },
      {
        onSuccess: () => { push("Posted to the Den!", "success"); reset() },
        onError: (e: Error) => push(e?.message || "Failed to post", "error"),
      }
    )
  }

  const initial = (me?.displayName || me?.username || "?")[0]?.toUpperCase() ?? "?"

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
      <div className="flex gap-3">
        <div className="shrink-0">
          {me?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/15 text-xs font-black text-accent-bright">{initial}</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {open && (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              maxLength={120}
              className="mb-2 w-full bg-transparent text-base sm:text-lg font-black text-foreground placeholder:text-subtle/70 focus:outline-none"
            />
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={`Start a discussion in ${denName}…`}
            rows={open ? 3 : 1}
            className="w-full resize-none bg-transparent text-base text-foreground placeholder:text-subtle focus:outline-none leading-relaxed"
          />

          {image && (
            <div className="relative mt-2 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="max-h-56 rounded-xl border border-border object-cover" />
              <button onClick={() => setImage(null)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white transition-transform active:scale-90" aria-label="Remove image">
                <X size={14} />
              </button>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={pickImage} className="hidden" />

          {open && (
            <>
              {/* Flair picker */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Tag size={12} className="text-subtle" />
                {FLAIRS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFlair(flair === f.id ? null : f.id)}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                      flair === f.id ? f.cls : "border-border bg-surface-2 text-subtle hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                <button onClick={() => fileRef.current?.click()} disabled={isUploading} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-black uppercase tracking-widest text-muted transition-colors hover:text-accent-bright disabled:opacity-50">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                  {isUploading ? "Uploading…" : "Image"}
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={reset} className="rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-widest text-subtle transition-colors hover:text-foreground">Cancel</button>
                  <button onClick={submit} disabled={!canPost} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-accent-bright active:scale-95 disabled:opacity-50">
                    {create.isPending ? <Loader2 size={13} className="animate-spin" /> : null} Post
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Post card ── */
type Row = {
  id: string
  title: string
  content: string
  imageUrl?: string | null
  tags: string[]
  isPinned: boolean
  isLocked: boolean
  savedByMe: boolean
  createdAt: string
  authorId: string
  author: { username: string; displayName: string; avatarUrl: string | null }
  replies: number
  reactions?: ReactionSummary[]
}

function PostCard({
  row, onHype, onSave, mod, canModerate, isOwnerOfPost,
}: {
  row: Row
  onHype: (id: string) => void
  onSave: (id: string, save: boolean) => void
  mod: ReturnType<typeof useThreadModActions>
  canModerate: boolean
  isOwnerOfPost: boolean
}) {
  const { push } = useToast()
  const { count, mine } = hypeOf(row.reactions)
  const isSpoiler = row.tags.includes(SPOILER)
  const [revealed, setRevealed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const body = cleanBody(row.content)
  const flair = row.tags.map(t => FLAIR_BY_ID[t]).find(Boolean)
  const initial = (row.author.displayName || row.author.username || "?")[0]?.toUpperCase() ?? "?"
  const hidden = isSpoiler && !revealed

  const share = (e: React.MouseEvent) => {
    e.preventDefault()
    navigator.clipboard?.writeText(`${window.location.origin}/threads/${row.id}`).then(() => push("Link copied", "success")).catch(() => {})
  }
  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation() }

  return (
    <Link href={`/threads/${row.id}`} className="group relative flex gap-3 rounded-2xl border border-border bg-surface p-3 transition-all hover:border-accent/25 sm:p-4">
      {/* Hype rail */}
      <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
        <button
          onClick={(e) => { e.preventDefault(); onHype(row.id) }}
          className={`grid h-9 w-9 place-items-center rounded-xl border transition-all active:scale-90 ${
            mine ? "border-amber-400/40 bg-amber-400/15 text-amber-400" : "border-border bg-surface-2 text-subtle hover:border-amber-400/30 hover:text-amber-400"
          }`}
          aria-label="Hype this"
        >
          <Flame size={16} className={mine ? "fill-amber-400/40" : ""} />
        </button>
        <span className={`text-xs font-black tabular-nums ${mine ? "text-amber-400" : "text-muted"}`}>{count}</span>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] text-subtle">
          {row.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.author.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-[9px] font-black text-accent-bright">{initial}</span>
          )}
          <span className="font-bold text-muted">@{row.author.username}</span>
          <span>·</span>
          <span>{relativeTime(row.createdAt)}</span>
          {row.isPinned && <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-accent-bright"><Pin size={8} /> Pinned</span>}
          {row.isLocked && <Lock size={11} className="text-subtle" />}

          {/* ⋯ menu */}
          <div className="relative ml-auto">
            <button onClick={(e) => { stop(e); setMenuOpen(o => !o) }} className="grid h-7 w-7 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-foreground" aria-label="More">
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={(e) => { stop(e); setMenuOpen(false) }} />
                <div onClick={stop} className="absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-xl border border-border bg-surface-2 py-1 shadow-2xl">
                  <button onClick={(e) => { share(e); setMenuOpen(false) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-surface hover:text-foreground"><Share2 size={13} /> Copy link</button>
                  <button onClick={(e) => { stop(e); onSave(row.id, !row.savedByMe); setMenuOpen(false) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-surface hover:text-foreground">
                    <Bookmark size={13} className={row.savedByMe ? "fill-current" : ""} /> {row.savedByMe ? "Unsave" : "Save"}
                  </button>
                  {canModerate && (
                    <>
                      <div className="my-1 h-px bg-border" />
                      <button onClick={(e) => { stop(e); mod.pin.mutate({ threadId: row.id, pinned: !row.isPinned }); setMenuOpen(false) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-surface hover:text-foreground">
                        {row.isPinned ? <PinOff size={13} /> : <Pin size={13} />} {row.isPinned ? "Unpin" : "Pin"}
                      </button>
                      <button onClick={(e) => { stop(e); mod.lock.mutate({ threadId: row.id, locked: !row.isLocked }); setMenuOpen(false) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted transition-colors hover:bg-surface hover:text-foreground">
                        {row.isLocked ? <LockOpen size={13} /> : <Lock size={13} />} {row.isLocked ? "Unlock" : "Lock"}
                      </button>
                    </>
                  )}
                  {(canModerate || isOwnerOfPost) && (
                    <button onClick={(e) => { stop(e); if (confirm("Delete this post?")) mod.remove.mutate(row.id); setMenuOpen(false) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10">
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Flair + title */}
        <div className="mt-1 flex items-center gap-2">
          {flair && <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${flair.cls}`}>{flair.label}</span>}
          <h3 className="text-sm font-black text-foreground transition-colors group-hover:text-accent-bright sm:text-base line-clamp-2">{row.title}</h3>
        </div>

        {/* Body / spoiler-gated content */}
        {hidden ? (
          <button
            onClick={(e) => { e.preventDefault(); setRevealed(true) }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-red-500/30 bg-red-500/5 py-5 text-[11px] font-black uppercase tracking-widest text-red-300 transition-colors hover:bg-red-500/10"
          >
            <EyeOff size={13} /> Spoiler — tap to reveal
          </button>
        ) : (
          <>
            {body && <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2 sm:text-sm">{body}</p>}
            {row.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.imageUrl} alt="" className="mt-2.5 max-h-72 w-full rounded-xl border border-border object-cover" />
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-2.5 flex items-center gap-1 text-subtle">
          <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold"><MessageSquare size={13} /> {row.replies}</span>
          <button onClick={share} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors hover:text-accent-bright"><Share2 size={13} /> Share</button>
          <button
            onClick={(e) => { e.preventDefault(); onSave(row.id, !row.savedByMe) }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors ${row.savedByMe ? "text-accent-bright" : "hover:text-accent-bright"}`}
          >
            <Bookmark size={13} className={row.savedByMe ? "fill-current" : ""} /> {row.savedByMe ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </Link>
  )
}

/* ── Feed ── */
export function DenFeed({
  slug, denName, isMember, canModerate = false, currentUserId,
}: {
  slug: string
  denName: string
  isMember: boolean
  canModerate?: boolean
  currentUserId?: string
}) {
  const { data } = useClubThreads(slug)
  const reactMut = useReactClubThread(slug)
  const saveMut = useSaveThread(slug)
  const mod = useThreadModActions(slug)
  const { push } = useToast()
  const isAuth = useAuthStore(s => s.isAuthenticated)
  const [sort, setSort] = useState<Sort>("hot")
  const [filter, setFilter] = useState<string | null>(null) // flair id or "saved"

  const all: Row[] = useMemo(() => (data?.data ?? [])
    .filter(t => !t.title.startsWith("[CHALLENGE]"))
    .map(t => ({
      id: t.id, title: t.title, content: t.content, imageUrl: t.imageUrl,
      tags: t.tags ?? [], isPinned: t.isPinned, isLocked: t.isLocked,
      savedByMe: !!t.savedByMe, createdAt: t.createdAt,
      authorId: t.author.id, author: t.author, replies: t._count?.replies ?? 0, reactions: t.reactions,
    })), [data])

  // Flairs actually present in this Den, for the filter bar.
  const presentFlairs = useMemo(() => {
    const set = new Set(all.flatMap(r => r.tags))
    return FLAIRS.filter(f => set.has(f.id))
  }, [all])

  const rows = useMemo(() => {
    let r = all
    if (filter === "saved") r = r.filter(x => x.savedByMe)
    else if (filter) r = r.filter(x => x.tags.includes(filter))
    const score = (x: Row) => hypeOf(x.reactions).count * 2 + x.replies
    const ageH = (x: Row) => (Date.now() - new Date(x.createdAt).getTime()) / 3_600_000
    const sorted = [...r].sort((a, b) => {
      if (sort === "new") return +new Date(b.createdAt) - +new Date(a.createdAt)
      if (sort === "top") return score(b) - score(a)
      return (score(b) + 1) / Math.pow(ageH(b) + 2, 1.4) - (score(a) + 1) / Math.pow(ageH(a) + 2, 1.4)
    })
    return sorted.sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
  }, [all, sort, filter])

  const onHype = (id: string) => {
    if (!isAuth) { push("Sign in to Hype a post", "info"); return }
    reactMut.mutate({ threadId: id })
  }
  const onSave = (id: string, save: boolean) => {
    if (!isAuth) { push("Sign in to save posts", "info"); return }
    saveMut.mutate({ threadId: id, save })
    if (save) push("Saved", "success")
  }

  return (
    <div className="space-y-4">
      {/* Sort + filter bars */}
      <div className="flex items-center gap-1.5">
        {SORTS.map(s => {
          const Icon = s.icon
          const active = sort === s.id
          return (
            <button key={s.id} onClick={() => setSort(s.id)} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${active ? "bg-accent text-black" : "bg-surface border border-border text-muted hover:text-foreground"}`}>
              <Icon size={12} /> {s.label}
            </button>
          )
        })}
      </div>

      {(presentFlairs.length > 0 || all.some(r => r.savedByMe)) && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
          <button onClick={() => setFilter(null)} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${filter === null ? "bg-foreground/10 text-foreground" : "text-subtle hover:text-foreground"}`}>All</button>
          {all.some(r => r.savedByMe) && (
            <button onClick={() => setFilter(filter === "saved" ? null : "saved")} className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${filter === "saved" ? "border-accent/40 bg-accent/15 text-accent-bright" : "border-border text-subtle hover:text-foreground"}`}>
              <Bookmark size={10} /> Saved
            </button>
          )}
          {presentFlairs.map(f => (
            <button key={f.id} onClick={() => setFilter(filter === f.id ? null : f.id)} className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${filter === f.id ? f.cls : "border-border text-subtle hover:text-foreground"}`}>{f.label}</button>
          ))}
        </div>
      )}

      {isMember && <Composer slug={slug} denName={denName} />}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface py-16 text-center">
          <MessageSquare size={22} className="mx-auto mb-2 text-subtle" />
          <p className="text-sm font-bold text-muted">{filter ? "Nothing here" : "No posts yet"}</p>
          <p className="mt-1 text-[11px] text-subtle">{filter ? "Try a different filter." : isMember ? `Be the first to start a discussion in ${denName}.` : "Join the Den to start a discussion."}</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {rows.map((row, i) => (
            <motion.div key={row.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <PostCard
                row={row}
                onHype={onHype}
                onSave={onSave}
                mod={mod}
                canModerate={canModerate}
                isOwnerOfPost={!!currentUserId && row.authorId === currentUserId}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
