"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Flag, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"

type ContentType = "post" | "review" | "blog" | "comment" | "user"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  contentType: ContentType
  contentId: string
}

const REASONS: Record<ContentType, string[]> = {
  post:    ["Spam", "Harassment", "Misinformation", "Spoilers without warning", "Inappropriate content", "Other"],
  review:  ["Fake review", "Spam", "Spoilers without warning", "Inappropriate content", "Off-topic", "Other"],
  blog:    ["Plagiarism", "Spam", "Misinformation", "Inappropriate content", "Copyright violation", "Other"],
  comment: ["Harassment", "Spam", "Spoilers without warning", "Offensive language", "Other"],
  user:    ["Harassment / bullying", "Fake account", "Spam", "Inappropriate username", "Other"],
}

export default function ReportModal({ isOpen, onClose, contentType, contentId }: ReportModalProps) {
  const { push } = useToast()
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reason) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 700))
    setSubmitting(false)
    setSubmitted(true)
    push("Report submitted. Our moderators will review it.", "success")
    setTimeout(() => { setSubmitted(false); setReason(""); setNote(""); onClose() }, 2500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full max-w-md bg-background rounded-3xl border border-border p-7 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-surface border border-border text-muted hover:text-foreground transition-colors">
              <X size={15} />
            </button>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                <CheckCircle2 size={40} className="mx-auto text-emerald-400" />
                <p className="font-black text-foreground text-lg">Report Received</p>
                <p className="text-sm text-muted">Our moderators will review this shortly.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flag size={14} className="text-red-400" />
                    <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-red-400/70">Report {contentType}</p>
                  </div>
                  <h2 className="text-xl font-black text-foreground tracking-tighter">Why are you reporting this?</h2>
                </div>

                <div className="space-y-2">
                  {REASONS[contentType].map(r => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                        reason === r
                          ? "bg-red-500/10 border-red-500/30 text-foreground font-bold"
                          : "border-border bg-surface text-muted hover:border-border hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-2">Additional context (optional)</p>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Describe the issue in more detail…"
                    rows={3}
                    className="w-full rounded-2xl bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-subtle outline-none focus:border-red-500/30 resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xs uppercase tracking-widest text-foreground transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 size={13} className="animate-spin" /> Submitting…</> : <><Flag size={13} /> Submit Report</>}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
