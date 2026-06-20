"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Star, AlertTriangle, Send, Loader2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useCreateReview } from "@/hooks/useReviews"
import { useAuthStore } from "@/stores/auth.store"
import { Sheet } from "@/components/ui/Sheet"

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
    <Sheet open={isOpen} onClose={onClose} ariaLabel={`Write a review for ${animeTitle}`} className="sm:max-w-lg">
      <div className="relative p-6 sm:p-8 space-y-7">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-surface border border-border text-muted hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>

            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-1">Write a Review</p>
              <h2 className="text-2xl font-black tracking-tighter text-foreground">{animeTitle}</h2>
            </div>

            {/* Star rating */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Your Score</p>
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
                      fill={display && n <= display ? "var(--app-accent)" : "none"}
                      stroke={display && n <= display ? "var(--app-accent)" : "color-mix(in srgb, var(--app-fg) 20%, transparent)"}
                    />
                  </button>
                ))}
                {display && (
                  <motion.span
                    key={display}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-2 text-sm font-black text-accent-bright"
                  >
                    {display}/10 · {starLabel(display)}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Review body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Review</p>
                <span className={`text-[9px] font-mono ${body.length < 20 ? "text-subtle" : "text-emerald-400/70"}`}>
                  {body.length}/2000 {body.length < 20 && `(min ${20 - body.length} more)`}
                </span>
              </div>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Share your thoughts on this anime… (minimum 20 characters)"
                rows={5}
                maxLength={2000}
                className="w-full rounded-2xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent/40 resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Spoiler toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setHasSpoilers(s => !s)}
                className={`relative w-10 h-5 rounded-full transition-colors ${hasSpoilers ? "bg-accent" : "bg-surface"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${hasSpoilers ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className={hasSpoilers ? "text-accent-bright" : "text-subtle"} />
                <span className={`text-xs font-bold ${hasSpoilers ? "text-accent-bright" : "text-subtle"}`}>
                  Contains Spoilers
                </span>
              </div>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest text-black transition-all flex items-center justify-center gap-2.5"
              style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 4px 16px color-mix(in srgb, var(--app-accent) 30%, transparent)" }}
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <><Send size={14} /> Submit Review</>}
            </button>
      </div>
    </Sheet>
  )
}
