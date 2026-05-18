"use client"

import { motion } from "framer-motion"
import { Lock, Shield, Sparkles } from "lucide-react"

const FEATURES = [
  { icon: "🔒", label: "End-to-end encrypted",    desc: "Only you and the recipient can read messages" },
  { icon: "⚡", label: "Real-time delivery",       desc: "Messages delivered instantly via WebSocket"   },
  { icon: "🎌", label: "Anime-native experience",  desc: "Share anime lists and discoveries in chat"    },
]

export default function ChatEmptyPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center select-none relative overflow-hidden" style={{ background: "#0a0a0c" }}>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
      </div>

      {/* Rings */}
      {[480, 340, 200].map((size, i) => (
        <motion.div key={size}
          className="absolute rounded-full border border-white/[0.04]"
          style={{ width: size, height: size }}
          animate={{ scale: [1, 1.02, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
        />
      ))}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-8 px-8 max-w-sm text-center">

        {/* Icon cluster */}
        <div className="relative">
          <div className="w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", boxShadow: "0 0 60px rgba(99,102,241,0.35)" }}>
            <Sparkles size={32} className="text-white" />
          </div>
          <motion.div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center border border-white/[0.08]"
            style={{ background: "#1a1a2e" }}
            animate={{ y: [0, -3, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
            <Lock size={13} className="text-emerald-400" />
          </motion.div>
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h2 className="text-[18px] font-bold text-white tracking-tight">Select a conversation</h2>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
            Pick a chat from the left panel or click ✏ to start a new encrypted conversation with any Shinobi on AnimeUnwatched.
          </p>
        </div>

        {/* Feature pills */}
        <div className="w-full space-y-2">
          {FEATURES.map(({ icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl text-left border"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
              <span className="text-[16px] shrink-0">{icon}</span>
              <div>
                <p className="text-[11.5px] font-semibold text-white/70">{label}</p>
                <p className="text-[10.5px] text-white/25 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Encryption badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.15)" }}>
          <Shield size={11} className="text-emerald-400/70" />
          <span className="text-[10px] font-medium" style={{ color: "rgba(52,211,153,0.7)" }}>
            Server cannot read your messages · ECDH P-256 + AES-GCM
          </span>
        </div>
      </motion.div>
    </div>
  )
}
