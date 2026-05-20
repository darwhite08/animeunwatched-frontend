"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { FileText, Bold, Italic, List, Link as LinkIcon, Eye, EyeOff, Save, Send, Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useRouter } from "next/navigation"
import { useCreateBlog } from "@/hooks/useBlogs"

const CATEGORIES = ["Deep Dive", "Review", "Theory", "Opinion", "List", "Analysis"]
const TOOLBAR = [
  { icon: Bold,     label: "Bold",   md: "**text**"  },
  { icon: Italic,   label: "Italic", md: "_text_"    },
  { icon: List,     label: "List",   md: "- item"    },
  { icon: LinkIcon, label: "Link",   md: "[text](url)"},
]

export default function NewBlogPage() {
  const { push } = useToast()
  const router = useRouter()
  const createBlog = useCreateBlog()
  const [title,    setTitle]    = useState("")
  const [body,     setBody]     = useState("")
  const [category, setCategory] = useState("Deep Dive")
  const [coverUrl, setCoverUrl] = useState("")
  const [preview,  setPreview]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [status,   setStatus]   = useState<"idle"|"saved"|"published">("idle")

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  const readTime  = Math.max(1, Math.ceil(wordCount / 200))
  const canSave   = title.trim().length >= 3 && body.trim().length >= 20

  const handleAction = (action: "draft"|"publish") => {
    if (!canSave) return
    setSaving(true)
    createBlog.mutate(
      { title: title.trim(), body: body.trim(), status: action === "publish" ? "PUBLISHED" : "DRAFT" },
      {
        onSuccess: () => {
          setSaving(false)
          setStatus(action === "publish" ? "published" : "saved")
          push(action === "publish" ? "Article published to The Chronicle!" : "Draft saved.", action === "publish" ? "success" : "info")
          if (action === "publish") setTimeout(() => router.push("/blog"), 1500)
        },
        onError: () => { setSaving(false); push("Failed to save article", "error") },
      }
    )
  }

  const insert = (md: string) => setBody(prev => prev + (prev ? "\n" : "") + md)

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-3xl mx-auto px-6 pt-32 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/blog" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white mb-3 transition-colors">
              <ArrowLeft size={11}/> The Chronicle
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <FileText size={18} className="text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">New Article</h1>
                <p className="text-sm text-white/40">Write for The Chronicle community</p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {status !== "idle" && (
              <motion.div initial={{ opacity:0,x:10 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0 }}
                className={`text-sm font-bold px-4 py-2 rounded-xl border ${status==="published"?"bg-emerald-600/20 border-emerald-500/30 text-emerald-400":"bg-amber-600/20 border-amber-500/30 text-amber-400"}`}
              >
                {status==="published" ? "✓ Published!" : "✓ Saved as draft"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Editor card */}
        <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
          {/* Cover URL */}
          <div className="px-6 pt-6">
            <input value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} placeholder="Cover image URL (optional)"
              className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
            {coverUrl && <div className="mt-3 rounded-xl overflow-hidden h-40 bg-zinc-800"><img src={coverUrl} alt="cover" className="w-full h-full object-cover"/></div>}
          </div>

          {/* Title */}
          <div className="px-6 pt-4">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Article title…"
              className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-white/20"
            />
          </div>

          {/* Category + meta */}
          <div className="px-6 pt-3 pb-3 flex flex-wrap items-center gap-3 border-b border-white/5">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${category===c?"bg-purple-600 text-white":"bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"}`}
              >{c}</button>
            ))}
            <span className="ml-auto text-[9px] text-white/25 font-mono">{wordCount}w · {readTime}min</span>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-6 py-3 border-b border-white/5">
            {TOOLBAR.map(({ icon:Icon, label, md }) => (
              <button key={label} onClick={() => insert(md)} title={label}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              ><Icon size={15}/></button>
            ))}
            <button onClick={() => setPreview(p=>!p)} className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] text-white/50 hover:bg-white/5 transition-colors">
              {preview ? <EyeOff size={13}/> : <Eye size={13}/>}
              {preview ? "Editor" : "Preview"}
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 min-h-[240px]">
            {preview ? (
              <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap min-h-[240px]">
                {body || <span className="text-white/20">Nothing to preview yet…</span>}
              </div>
            ) : (
              <textarea value={body} onChange={e=>setBody(e.target.value)}
                placeholder="Start writing your article… Markdown is supported."
                rows={12}
                className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-white/20 leading-relaxed"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
            <button onClick={() => handleAction("draft")} disabled={!canSave||saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold transition-all"
            >
              {saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>} Save Draft
            </button>
            <button onClick={() => handleAction("publish")} disabled={!canSave||saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold transition-all"
            >
              {saving?<Loader2 size={14} className="animate-spin"/>:<Send size={14}/>} Publish
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <FileText size={15} className="text-purple-400 shrink-0 mt-0.5"/>
          <div>
            <p className="text-xs font-bold text-white/50">Writing Tips</p>
            <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">
              Use **bold**, _italic_, and - lists for formatting. Start with a hook that pulls readers in. Tag your article with the right category so the community can find it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
