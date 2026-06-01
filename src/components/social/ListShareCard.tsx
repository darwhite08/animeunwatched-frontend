"use client"

import { useState } from "react"
import Image from "next/image"
import { Share2, Link2, Download } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"

// ─── Viral share card (non-modal, embeddable) ─────────────────────────────────

export default function ListShareCard() {
  const toast = useToast((s) => s.push)
  const [copied, setCopied] = useState(false)
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  const TOP_5 = (listData?.data ?? []).slice(0, 5).map(e => ({
    id: e.id, title: e.anime?.title ?? "Unknown", image: e.anime?.imageUrl ?? "",
    rating: e.score ?? 0, status: e.status,
  }))

  const PROFILE = { username: user?.username ?? "shinobi", totalCount: listData?.meta?.total ?? 0, year: new Date().getFullYear() }

  const shareUrl = `https://kaiveron.app/u/${PROFILE.username}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast("Link copied!", "success")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast("Could not copy — try manually.", "error")
    }
  }

  const handleTwitter = () => {
    const text = encodeURIComponent(
      `My ${PROFILE.year} anime list — ${PROFILE.totalCount} anime tracked on Kaiveron 🎌\n${shareUrl}`
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* ── The shareable card ── */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-700/60 bg-[#0d0d0d] shadow-2xl select-none">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-56 h-56 bg-accent/15 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-700/10 blur-[60px] rounded-full" />
        </div>

        {/* Header bar */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-zinc-800/80">
          <span className="font-black uppercase tracking-widest text-accent-bright text-sm">
            KAIVERON.
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Watchlist
          </span>
        </div>

        {/* Heading */}
        <div className="relative z-10 px-5 pt-5 pb-3">
          <h2 className="font-black uppercase text-2xl text-foreground leading-tight tracking-tight">
            My {PROFILE.year} Anime List
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            @{PROFILE.username} · {PROFILE.totalCount} anime tracked
          </p>
        </div>

        {/* Cover grid */}
        <div className="relative z-10 px-5 pb-5">
          <div className="grid grid-cols-5 gap-2">
            {TOP_5.map((anime) => (
              <div
                key={anime.id}
                className="relative aspect-[2/3] rounded-xl overflow-hidden border border-zinc-700/50 bg-zinc-900"
                title={anime.title}
              >
                <Image
                  src={anime.image}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
                {/* Overlay on hover — static for share card */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            ))}
          </div>

          {/* Titles list below grid */}
          <div className="mt-3 space-y-1">
            {TOP_5.map((anime, i) => (
              <div key={anime.id} className="flex items-center gap-2">
                <span className="text-[9px] font-black text-accent-bright/60 w-3 shrink-0">{i + 1}</span>
                <span className="text-[11px] font-bold text-zinc-300 truncate">{anime.title}</span>
                <span className="ml-auto text-[9px] font-bold text-accent-bright/70 shrink-0">
                  ★ {anime.rating}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer bar */}
        <div className="relative z-10 flex items-center justify-between px-5 py-3 bg-zinc-900/60 border-t border-zinc-800/60">
          <span className="text-zinc-500 text-xs">kaiveron.app</span>
          <span className="text-zinc-600 text-[10px] font-mono">Track. Share. Flex.</span>
        </div>
      </div>

      {/* ── Action buttons below card ── */}
      <div className="flex gap-2">
        {/* Twitter / X */}
        <button
          onClick={handleTwitter}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-accent/40 bg-accent/10 text-accent-bright hover:border-indigo-400 hover:bg-accent/20 transition-all duration-200 group"
        >
          <Share2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-[10px] font-black uppercase tracking-widest">Share on Twitter</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all duration-200 group"
        >
          <Link2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {copied ? "Copied!" : "Copy Link"}
          </span>
        </button>

        {/* Download (coming soon) */}
        <button
          disabled
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-zinc-700 cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Download</span>
        </button>
      </div>
    </div>
  )
}
