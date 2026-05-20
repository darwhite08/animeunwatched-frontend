"use client"

import { use, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Eye, EyeOff, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/stores/toast.store"

/* ── Club name helper (mirrors club detail page) ── */
const CLUB_NAMES: Record<string, string> = {
  "attack-on-titan-discussion": "Attack on Titan Discussion",
  "shonen-power-rankings": "Shonen Power Rankings",
  "frieren-fan-club": "Frieren Fan Club",
  "mappa-watch": "MAPPA Watch",
  "anime-theory-lab": "Anime Theory Lab",
  "seasonal-picks": "Seasonal Picks",
}

function clubName(slug: string): string {
  return (
    CLUB_NAMES[slug] ??
    slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ")
  )
}

/* ── Word / char counts ── */
function wordCount(s: string): number {
  return s.trim() === "" ? 0 : s.trim().split(/\s+/).length
}

/* ── Preview renderer (plain text, markdown-lite) ── */
function MarkdownPreview({ source }: { source: string }) {
  if (!source.trim()) {
    return (
      <p className="text-sm text-white/20 italic">Nothing to preview yet…</p>
    )
  }

  const lines = source.split("\n")
  return (
    <div className="space-y-3 text-sm text-white/70 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="text-2xl font-black uppercase italic tracking-tighter text-white">
              {line.slice(2)}
            </h1>
          )
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-lg font-black uppercase italic text-white/90">
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-base font-black uppercase text-white/80">
              {line.slice(4)}
            </h3>
          )
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-4 border-indigo-500 pl-4 italic text-white/45 text-sm">
              {line.slice(2)}
            </blockquote>
          )
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="ml-4 list-disc marker:text-amber-500">
              {line.slice(2)}
            </li>
          )
        }
        if (line.trim() === "") {
          return <div key={i} className="h-1" />
        }
        /* bold / italic inline — escape HTML first to prevent XSS */
        const escaped = line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
        const processed = escaped
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 rounded text-amber-300 text-xs">$1</code>')
        return (
          <p
            key={i}
            dangerouslySetInnerHTML={{ __html: processed }}
          />
        )
      })}
    </div>
  )
}

/* ── Page ── */
export default function CreateThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router   = useRouter()
  const { push } = useToast()
  const name     = clubName(slug)

  const [title, setTitle]       = useState("")
  const [content, setContent]   = useState("")
  const [tagsRaw, setTagsRaw]   = useState("")
  const [spoiler, setSpoiler]   = useState(false)
  const [preview, setPreview]   = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const words  = useMemo(() => wordCount(content), [content])
  const chars  = content.length
  const tags   = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
    .filter(Boolean)

  const titleOk   = title.trim().length >= 5
  const contentOk = content.trim().length >= 20
  const canSubmit = titleOk && contentOk && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 900))
    push("Thread posted!", "success")
    router.push(`/clubs/${slug}`)
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-8 space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 flex-wrap">
          <Link href="/clubs" className="hover:text-amber-400 transition-colors">Clubs</Link>
          <ChevronRight size={10} className="text-white/15" />
          <Link href={`/clubs/${slug}`} className="hover:text-amber-400 transition-colors">
            {name}
          </Link>
          <ChevronRight size={10} className="text-white/15" />
          <span className="text-white/60">New Thread</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">
            {name}
          </p>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white leading-none">
            New Thread
          </h1>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">
                Thread Title <span className="text-red-400/70">*</span>
              </label>
              {title.trim().length > 0 && !titleOk && (
                <span className="text-[9px] text-amber-400/70">At least 5 characters</span>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your thread a compelling title…"
              maxLength={120}
              className={`w-full rounded-2xl bg-black/30 border px-5 py-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors ${
                title.trim().length > 0 && !titleOk
                  ? "border-amber-500/30 focus:border-amber-500/50"
                  : "border-white/10 focus:border-indigo-500/40"
              }`}
            />
            <p className="text-[9px] text-right text-white/20">{title.length}/120</p>
          </div>

          {/* Content + preview toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">
                Content <span className="text-red-400/70">*</span>
              </label>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-amber-400 transition-colors"
              >
                {preview ? <EyeOff size={11} /> : <Eye size={11} />}
                {preview ? "Edit" : "Preview"}
              </button>
            </div>

            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-[220px] rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-4"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400/50 mb-4">
                  Preview
                </p>
                <MarkdownPreview source={content} />
              </motion.div>
            ) : (
              <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={"Write your thread…\n\nSupports basic markdown:\n# Heading\n**bold**, *italic*, `code`\n> blockquote\n- list item"}
                  rows={10}
                  className={`w-full rounded-2xl bg-black/30 border px-5 py-4 text-sm text-white placeholder:text-white/15 outline-none resize-none leading-relaxed transition-colors font-mono ${
                    content.trim().length > 0 && !contentOk
                      ? "border-amber-500/30 focus:border-amber-500/50"
                      : "border-white/10 focus:border-indigo-500/40"
                  }`}
                />
              </motion.div>
            )}

            {/* Counters */}
            <div className="flex items-center justify-between text-[9px] text-white/20">
              <span>
                {words} {words === 1 ? "word" : "words"}
              </span>
              <span className={chars < 20 && chars > 0 ? "text-amber-400/60" : ""}>
                {chars} chars{chars < 20 && chars > 0 ? " (min 20)" : ""}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">
              Tags
              <span className="ml-2 font-normal normal-case tracking-normal text-white/20 text-[9px]">
                comma-separated, optional
              </span>
            </label>
            <input
              type="text"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="e.g. theory, episode-5, spoilers, hot-take"
              className="w-full rounded-2xl bg-black/30 border border-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/40 transition-colors"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-amber-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Spoiler toggle */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/8">
            <div className="flex items-start gap-3">
              <AlertTriangle size={15} className={`mt-0.5 shrink-0 ${spoiler ? "text-amber-400" : "text-white/25"}`} />
              <div>
                <p className="text-sm font-bold text-white/80">Mark as Spoiler</p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  Content will be hidden behind a spoiler warning for other members
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSpoiler((s) => !s)}
              className={`relative h-6 w-11 rounded-full border transition-all duration-300 shrink-0 ${
                spoiler
                  ? "bg-amber-500/30 border-amber-500/50"
                  : "bg-white/8 border-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300 ${
                  spoiler ? "left-[22px] bg-amber-400" : "left-0.5 bg-white/30"
                }`}
              />
            </button>
          </div>

          {/* Validation summary */}
          {(!titleOk || !contentOk) && (title.length > 0 || content.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15"
            >
              <AlertTriangle size={13} className="text-amber-400/70 mt-0.5 shrink-0" />
              <div className="space-y-1 text-[10px] text-amber-300/60">
                {!titleOk && <p>Thread title must be at least 5 characters.</p>}
                {!contentOk && <p>Content must be at least 20 characters.</p>}
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href={`/clubs/${slug}`}
              className="text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors"
            >
              Cancel
            </Link>

            <motion.button
              whileHover={canSubmit ? { scale: 1.02 } : {}}
              whileTap={canSubmit ? { scale: 0.97 } : {}}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                canSubmit
                  ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_32px_rgba(99,102,241,0.35)]"
                  : "bg-white/5 border border-white/10 text-white/25 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Posting…
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Post Thread
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
