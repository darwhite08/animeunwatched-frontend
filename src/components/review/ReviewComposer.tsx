"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Star, AlertTriangle, Send, Loader2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useCreateReview } from "@/hooks/useReviews"
import { useAuthStore } from "@/stores/auth.store"

interface ReviewComposerProps {
  isOpen: boolean
  onClose: () => void
  animeTitle: string
  animeId: string
}

export default function ReviewComposer({ isOpen, onClose, animeTitle, animeId }: ReviewComposerProps) {
  const { push } = useToast()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const createReview = useCreateReview()
  const [score, setScore] = useState<number | null>(null)
  const [body, setBody] = useState("")
  const [hasSpoilers, setHasSpoilers] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  const submitting = createReview.isPending
  const canSubmit = score !== null && body.trim().length >= 20 && isAuthenticated

  const handleSubmit = () => {
    if (!canSubmit) { if (!isAuthenticated) { push("Sign in to write reviews", "info"); onClose(); } return }
    createReview.mutate(
      { animeId, score: score!, body: body.trim(), hasSpoilers },
      {
        onSuccess: () => {
          push(`Review for "${animeTitle}" published!`, "success")
          onClose(); setScore(null); setBody(""); setHasSpoilers(false)
        },
        onError: (e: Error) => {
          if (e.message?.includes("CONFLICT")) push("You've already reviewed this anime", "info")
          else push("Failed to submit review. Try again.", "error")
        },
      }
    )
  }

  const starLabel = (n: number) =>
    n <= 2 ? "Terrible" : n <= 4 ? "Bad" : n <= 6 ? "Decent" :
    n <= 7 ? "Good" : n <= 8 ? "Great" : n <= 9 ? "Excellent" : "Masterpiece"

  const display = hovered ?? score

  useEffect(() => { if (!isOpen) { setScore(null); setBody(""); setHovered(null) } }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="relative w-full max-w-lg bg-[#0c0c0c] rounded-3xl border border-white/10 p-8 shadow-2xl space-y-7"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-1">Write a Review</p>
              <h2 className="text-2xl font-black tracking-tighter text-white">{animeTitle}</h2>
            </div>

            {/* Star rating */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Your Score</p>
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setScore(n)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={22}
                      className="transition-colors duration-150"
                      fill={display && n <= display ? "#f59e0b" : "none"}
                      stroke={display && n <= display ? "#f59e0b" : "rgba(255,255,255,0.2)"}
                    />
                  </button>
                ))}
                {display && (
                  <motion.span
                    key={display}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-2 text-sm font-black text-amber-400"
                  >
                    {display}/10 · {starLabel(display)}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Review body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Review</p>
                <span className={`text-[9px] font-mono ${body.length < 20 ? "text-white/20" : "text-emerald-400/70"}`}>
                  {body.length}/2000 {body.length < 20 && `(min ${20 - body.length} more)`}
                </span>
              </div>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Share your thoughts on this anime… (minimum 20 characters)"
                rows={5}
                maxLength={2000}
                className="w-full rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/40 resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Spoiler toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setHasSpoilers(s => !s)}
                className={`relative w-10 h-5 rounded-full transition-colors ${hasSpoilers ? "bg-amber-600" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${hasSpoilers ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className={hasSpoilers ? "text-amber-400" : "text-white/20"} />
                <span className={`text-xs font-bold ${hasSpoilers ? "text-amber-400" : "text-white/35"}`}>
                  Contains Spoilers
                </span>
              </div>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest text-black transition-all flex items-center justify-center gap-2.5"
              style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 4px 16px rgba(245,158,11,0.3)" }}
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <><Send size={14} /> Submit Review</>}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

import { useEffect } from "react"
