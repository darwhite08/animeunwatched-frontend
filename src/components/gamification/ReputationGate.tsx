"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Shield, X } from "lucide-react"

type ReputationGateProps = {
  required: number
  current: number
  feature: string
  onClose: () => void
}

const HOW_TO_EARN = [
  { action: "Post content", points: "+2" },
  { action: "Write a review", points: "+5" },
  { action: "Review gets liked", points: "+1" },
  { action: "Complete a 7-day streak", points: "+10" },
]

export default function ReputationGate({ required, current, feature, onClose }: ReputationGateProps) {
  const isMet = current >= required
  const deficit = Math.max(0, required - current)
  const progressPct = Math.min(100, Math.round((current / required) * 100))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-md bg-surface border border-border rounded-[2rem] p-8 shadow-2xl"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-subtle hover:text-muted hover:bg-surface transition-all"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Shield icon */}
          <div className="flex justify-center mb-6">
            <div className="p-5 rounded-[1.5rem] bg-violet-500/10 border border-violet-500/20">
              <Shield size={36} className="text-violet-400" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-black tracking-tighter text-center text-foreground mb-1">
            Reputation Required
          </h2>
          <p className="text-center text-muted text-sm mb-6">
            <span className="text-muted font-bold">{feature}</span> is locked behind reputation.
          </p>

          {/* Rep bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
              <span className={isMet ? "text-emerald-400" : "text-rose-400"}>
                Your rep: {current}
              </span>
              <span className="text-muted">Required: {required}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isMet ? "bg-emerald-500" : "bg-rose-500"}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-right text-[10px] text-subtle font-bold uppercase tracking-tighter">
              {progressPct}% of the way there
            </p>
          </div>

          {/* Deficit callout */}
          {!isMet && (
            <div className="mb-6 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
              <p className="text-rose-300 font-black tracking-tight text-sm">
                You need <span className="text-rose-200">{deficit} more reputation</span> to unlock this feature.
              </p>
            </div>
          )}

          {/* How to earn */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-tighter text-subtle">How to earn reputation</p>
            <div className="space-y-2">
              {HOW_TO_EARN.map(({ action, points }) => (
                <div
                  key={action}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-surface border border-border"
                >
                  <span className="text-sm text-muted font-bold">{action}</span>
                  <span className="text-xs font-black text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                    {points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-8 w-full py-3 rounded-2xl bg-surface border border-border text-muted font-black text-sm uppercase tracking-tighter hover:bg-surface hover:text-foreground transition-all"
          >
            Got it
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
