"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Bold, Italic, List, Link as LinkIcon, Eye, EyeOff, Save, Send } from "lucide-react"
import { useCreateBlog } from "@/hooks/useBlogs"
import { useToast } from "@/stores/toast.store"
import { useRouter } from "next/navigation"

const TOOLBAR = [
  { icon: Bold,     label: "Bold",       md: "**text**" },
  { icon: Italic,   label: "Italic",     md: "_text_" },
  { icon: List,     label: "List",       md: "- item" },
  { icon: LinkIcon, label: "Link",       md: "[label](url)" },
]

export default function CreateBlogPage() {
  const router = useRouter()
  const { push } = useToast()
  const createBlog = useCreateBlog()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [preview, setPreview] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "published">("idle")

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  const handleAction = (action: "draft" | "publish") => {
    if (!title.trim() || !body.trim()) { push("Title and content required", "info"); return }
    const slug = title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60) + "-" + Date.now()
    createBlog.mutate(
      { title: title.trim(), body: body.trim(), status: action === "publish" ? "PUBLISHED" : "DRAFT" },
      {
        onSuccess: (data) => {
          setStatus(action === "publish" ? "published" : "saved")
          push(action === "publish" ? "Blog published!" : "Draft saved!", "success")
          setTimeout(() => { setStatus("idle"); if (action === "publish") router.push("/creators/blog") }, 2000)
        },
        onError: () => push("Failed to save blog", "error"),
      }
    )
  }

  const insertMarkdown = (md: string) => {
    setBody(prev => prev + (prev ? "\n" : "") + md)
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <FileText size={18} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">New Blog Article</h1>
          <p className="text-sm text-white/40">Write a long-form piece for the community</p>
        </div>
      </div>

      {/* Status banner */}
      {status !== "idle" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-4 py-3 text-sm border ${
            status === "published"
              ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
              : "bg-indigo-600/20 border-indigo-500/30 text-amber-400"
          }`}
        >
          {status === "published" ? "Article published!" : "Draft saved."}
        </motion.div>
      )}

      {/* Editor card */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        {/* Cover URL */}
        <div className="px-6 pt-6">
          <input
            value={coverUrl}
            onChange={e => setCoverUrl(e.target.value)}
            placeholder="Cover image URL (optional)"
            className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:ring-1 focus:ring-purple-500/50"
          />
          {coverUrl && (
            <div className="mt-3 rounded-xl overflow-hidden h-40 bg-zinc-800">
              <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="px-6 pt-4">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Article title…"
            className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-white/20"
          />
        </div>

        {/* Meta */}
        <div className="px-6 pt-2 pb-3 flex items-center gap-3 text-xs text-white/30 border-b border-white/5">
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readTime} min read</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-white/5">
          {TOOLBAR.map(({ icon: Icon, label, md }) => (
            <button
              key={label}
              onClick={() => insertMarkdown(md)}
              title={label}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
            >
              <Icon size={15} />
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={() => setPreview(p => !p)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:bg-white/5 transition"
            >
              {preview ? <EyeOff size={13} /> : <Eye size={13} />}
              {preview ? "Editor" : "Preview"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {preview ? (
            <div className="prose prose-invert prose-sm max-w-none min-h-[280px] text-white/80 whitespace-pre-wrap text-sm leading-relaxed">
              {body || <span className="text-white/20">Nothing to preview yet…</span>}
            </div>
          ) : (
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Start writing… Markdown is supported."
              rows={14}
              className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-white/20 leading-relaxed"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
          <button
            onClick={() => handleAction("draft")}
            disabled={!title.trim() || !body.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
          >
            <Save size={14} />
            Save Draft
          </button>
          <button
            onClick={() => handleAction("publish")}
            disabled={!title.trim() || !body.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            <Send size={14} />
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}
