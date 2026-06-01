"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { UserPlus, Copy, CheckCircle2, Zap } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"

export default function InviteFriendsCard() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const [copied, setCopied] = useState(false)

  const referralLink = user?.username
    ? `https://kaiveron.app/register?ref=${user.username}`
    : "https://kaiveron.app/register"

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      push("Invite link copied!", "success")
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => push("Failed to copy", "error"))
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join me on Kaiveron",
        text: `Hey! I've been tracking anime on Kaiveron — it's way better than MAL. Join using my link:`,
        url: referralLink,
      }).catch(() => {})
    } else {
      handleCopy()
    }
  }

  return (
    <div className="p-8 rounded-[2.5rem] border border-border bg-surface relative overflow-hidden group">
      {/* Glow */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />

      <div className="flex items-center gap-2 mb-5 relative z-10">
        <UserPlus size={14} className="text-emerald-400" />
        <h4 className="text-xs font-black uppercase tracking-[0.28em] text-subtle">Invite Shinobi</h4>
      </div>

      <div className="relative z-10 space-y-4">
        <p className="text-xs text-muted leading-relaxed">
          Invite friends to Kaiveron. When they sign up using your link, you both earn bonus XP.
        </p>

        {/* Referral link display */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-surface border border-border">
          <Zap size={11} className="text-emerald-400 shrink-0" />
          <code className="flex-1 text-[10px] text-muted font-mono truncate">
            kaiveron.app/register?ref={user?.username ?? "you"}
          </code>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className={`shrink-0 p-1.5 rounded-lg transition-colors ${copied ? "text-emerald-400" : "text-subtle hover:text-foreground"}`}
          >
            {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
          </motion.button>
        </div>

        <button
          onClick={handleShare}
          className="w-full py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}
        >
          {typeof navigator !== "undefined" && "share" in navigator ? "Share Invite" : "Copy Invite Link"}
        </button>
      </div>
    </div>
  )
}
