"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquarePlus, X, Send, ChevronDown, Star } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { api } from "@/lib/api/client"

type FeedbackType = "bug" | "suggestion" | "love" | "other"

const TYPE_CONFIG: Record<FeedbackType, { label: string; emoji: string; color: string }> = {
  bug:        { label: "Bug Report",   emoji: "🐛", color: "text-red-400" },
  suggestion: { label: "Suggestion",   emoji: "💡", color: "text-accent-bright" },
  love:       { label: "Compliment",   emoji: "❤️", color: "text-pink-400" },
  other:      { label: "Other",        emoji: "💬", color: "text-muted" },
}

export default function FeedbackButton() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>("suggestion")
  const [text, setText] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) { push("Please enter your feedback", "error"); return }
    setSending(true)
    try {
      // POST to our own API — stored as a blog post/post with a special tag
      // Or just send to the backend analytics endpoint
      await api("/posts", {
        method: "POST",
        body: JSON.stringify({
          content: `[FEEDBACK:${type.toUpperCase()}] ${rating > 0 ? `★${rating} ` : ""}${text.trim()} — via ${user?.username ?? "anonymous"}`,
        }),
      })
      push("Thanks for your feedback! We read everything.", "success")
      setText(""); setRating(0); setOpen(false)
    } catch {
      // Even if the API fails, show success (don't block user)
      push("Thanks for your feedback!", "success")
      setText(""); setRating(0); setOpen(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black shadow-[0_8px_32px_color-mix(in srgb, var(--app-accent) 35%, transparent)] transition-all"
        style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
        aria-label="Send feedback"
      >
        <MessageSquarePlus size={14} />
        Feedback
      </motion.button>

      {/* Feedback modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
            onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              className="w-full max-w-sm bg-[#0f0f0f] border border-border rounded-[2rem] p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus size={14} className="text-accent-bright" />
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Send Feedback</h2>
                </div>
                <button onClick={() => setOpen(false)} className="text-subtle hover:text-foreground transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Type selector */}
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(TYPE_CONFIG) as [FeedbackType, typeof TYPE_CONFIG[FeedbackType]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setType(key)}
                    className={`py-2.5 rounded-xl text-center space-y-1 transition-all border ${type === key ? "bg-accent/10 border-accent/30" : "bg-surface border-border hover:border-border"}`}
                  >
                    <div className="text-base">{cfg.emoji}</div>
                    <div className={`text-[8px] font-black uppercase tracking-widest leading-tight ${type === key ? "text-accent-bright" : "text-subtle"}`}>{cfg.label}</div>
                  </button>
                ))}
              </div>

              {/* Rating (for love/suggestion types) */}
              {(type === "love" || type === "suggestion") && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-subtle mr-1">Rate:</span>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(n)}>
                      <Star size={16} className={`transition-colors ${n <= (hoverRating || rating) ? "text-accent-bright fill-amber-400" : "text-subtle"}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Text input */}
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={type === "bug" ? "Describe what broke and how to reproduce it…" : type === "suggestion" ? "What would make Kaiveron better?" : type === "love" ? "What do you love about Kaiveron?" : "What's on your mind?"}
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent/30 resize-none transition-all"
              />

              <div className="flex items-center justify-between">
                <span className="text-[9px] text-subtle">{text.length}/1000</span>
                <button
                  onClick={handleSubmit}
                  disabled={sending || !text.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
                >
                  <Send size={11} />{sending ? "Sending…" : "Send"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
