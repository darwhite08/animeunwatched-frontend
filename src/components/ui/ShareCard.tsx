"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Link2, Copy, Share2, Download, Star } from "lucide-react"
import { useToast } from "@/stores/toast.store"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShareCardProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  url: string
  type: "anime" | "profile" | "list" | "post" | "review"
  rating?: number
}

// ─── Badge labels ─────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ShareCardProps["type"], string> = {
  anime: "Anime",
  profile: "Profile",
  list: "Watchlist",
  post: "Post",
  review: "Anime Review",
}

// ─── Card Preview ─────────────────────────────────────────────────────────────

function CardPreview({
  title,
  subtitle,
  type,
  rating,
}: {
  title: string
  subtitle?: string
  type: ShareCardProps["type"]
  rating?: number
}) {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-700/60 bg-[#0d0d0d] shadow-2xl select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="font-black uppercase tracking-widest text-accent-bright text-sm">
          KAIVERON.
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
          {TYPE_LABELS[type]}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-5">
        <h3 className="font-black uppercase text-xl text-foreground leading-tight tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border-t border-zinc-800">
        {type === "anime" || type === "review" ? (
          <div className="flex items-center gap-1.5">
            {rating !== undefined ? (
              <>
                <Star className="w-3.5 h-3.5 text-accent-bright fill-amber-400" />
                <span className="text-accent-bright font-bold text-sm">{rating}/10</span>
              </>
            ) : (
              <span className="text-zinc-500 text-xs">No rating yet</span>
            )}
          </div>
        ) : (
          <span className="text-zinc-500 text-xs">kaiveron.app</span>
        )}
        <span className="text-zinc-600 text-[10px] font-mono">
          Track it on Kaiveron
        </span>
      </div>
    </div>
  )
}

// ─── Share Action Button ──────────────────────────────────────────────────────

function ShareButton({
  icon,
  label,
  onClick,
  disabled,
  muted,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
  muted?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex-1 flex flex-col items-center gap-2 px-3 py-3 rounded-2xl border transition-all duration-200 cursor-pointer group",
        disabled
          ? "border-zinc-800 bg-zinc-900/40 text-zinc-700 cursor-not-allowed"
          : muted
          ? "border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60"
          : "border-accent/40 bg-accent/10 text-accent-bright hover:border-indigo-400 hover:bg-accent/20",
      ].join(" ")}
    >
      <span className="transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ShareCard({
  isOpen,
  onClose,
  title,
  subtitle,
  url,
  type,
  rating,
}: ShareCardProps) {
  const toast = useToast((s) => s.push)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast("Link copied!", "success")
    } catch {
      toast("Could not copy — try manually.", "error")
    }
  }

  const handleCopyText = async () => {
    const text = [title, subtitle, url].filter(Boolean).join(" — ")
    try {
      await navigator.clipboard.writeText(text)
      toast("Copied!", "success")
    } catch {
      toast("Could not copy — try manually.", "error")
    }
  }

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle,
          url,
        })
      } catch (err) {
        // User cancelled or error — fall back silently
        if ((err as Error)?.name !== "AbortError") {
          handleCopyLink()
        }
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="share-card-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-surface border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4">
              <div>
                <h2 className="font-black uppercase text-base text-foreground tracking-tight">
                  Share
                </h2>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Drop it into the void
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-foreground hover:border-zinc-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card preview */}
            <div className="px-5">
              <CardPreview
                title={title}
                subtitle={subtitle}
                type={type}
                rating={rating}
              />
            </div>

            {/* URL preview */}
            <div className="px-5 mt-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800">
                <Link2 className="w-3 h-3 text-zinc-500 shrink-0" />
                <p className="text-zinc-500 text-xs truncate font-mono">{url}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-5 pt-4 pb-5 flex gap-2">
              <ShareButton
                icon={<Link2 className="w-4 h-4" />}
                label="Copy Link"
                onClick={handleCopyLink}
              />
              <ShareButton
                icon={<Copy className="w-4 h-4" />}
                label="Copy Text"
                onClick={handleCopyText}
                muted
              />
              <ShareButton
                icon={<Share2 className="w-4 h-4" />}
                label="Share"
                onClick={handleShare}
                muted
              />
              <ShareButton
                icon={<Download className="w-4 h-4" />}
                label="Coming soon"
                disabled
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
