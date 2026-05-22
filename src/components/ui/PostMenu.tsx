"use client"

import { useEffect, useRef, useState } from "react"
import { MoreHorizontal, Link2, Share2, Flag, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/stores/toast.store"

type Props = {
  postId: string
  postUrl?: string
  isOwner?: boolean
  onDelete?: () => void
}

/**
 * Three-dot dropdown menu for a post.
 * Always present: Copy link, Share. Optional: Delete (owner), Report (other users).
 */
export function PostMenu({ postId, postUrl, isOwner, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { push } = useToast()

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [open])

  const url = postUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/posts/${postId}` : `/posts/${postId}`)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      push("Link copied to clipboard", "success")
    } catch {
      push("Couldn't copy — your browser blocked clipboard access", "error")
    }
    setOpen(false)
  }

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({ url, title: "Kaiveron post" })
      } catch {
        // user dismissed share sheet — no-op
      }
    } else {
      await copyLink()
    }
    setOpen(false)
  }

  function report() {
    push("Reported. Our team will review this within 24h.", "info")
    setOpen(false)
  }

  function deletePost() {
    setOpen(false)
    onDelete?.()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Post options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="p-1.5 rounded-md text-white/30 hover:text-white/80 hover:bg-white/5 transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border border-white/8 bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl overflow-hidden"
          >
            <MenuItem icon={Link2}   label="Copy link"  onClick={copyLink} />
            <MenuItem icon={Share2}  label="Share post" onClick={share} />
            {isOwner && onDelete ? (
              <MenuItem icon={Trash2} label="Delete" onClick={deletePost} danger />
            ) : (
              <MenuItem icon={Flag} label="Report" onClick={report} danger />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({
  icon: Icon, label, onClick, danger,
}: { icon: typeof Link2; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
        danger ? "text-red-300/80 hover:text-red-200 hover:bg-red-500/10" : "text-white/60 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={12} />
      {label}
    </button>
  )
}
