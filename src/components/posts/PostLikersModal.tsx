"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, Loader2 } from "lucide-react"
import * as ep from "@/lib/api/endpoints"
import type { PostLiker } from "@/lib/api/endpoints"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"

/**
 * Instagram-style "Liked by" list. Opened by tapping a post's like count.
 * Fetches the likers (most recent first), shows verified badges + a follow
 * button per person, and links each to their profile.
 */
export function PostLikersModal({ postId, open, onClose }: { postId: string; open: boolean; onClose: () => void }) {
  const me = useAuthStore(s => s.user)
  const { push } = useToast()
  const [likers, setLikers] = useState<PostLiker[]>([])
  const [loading, setLoading] = useState(true)
  const [follow, setFollow] = useState<Map<string, boolean>>(new Map())
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    ep.getPostLikers(postId)
      .then(r => setLikers(r.data))
      .catch(() => setLikers([]))
      .finally(() => setLoading(false))
  }, [open, postId])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  const toggleFollow = useCallback((liker: PostLiker) => {
    if (!me) { push("Sign in to follow users", "info"); return }
    const cur = follow.get(liker.username) ?? liker.isFollowedByMe
    const next = !cur
    setFollow(m => new Map(m).set(liker.username, next))
    ;(next ? ep.follow(liker.username) : ep.unfollow(liker.username)).catch(() => {
      setFollow(m => new Map(m).set(liker.username, cur))
      push("Failed to update follow", "error")
    })
  }, [me, follow, push])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-sm max-h-[70vh] flex flex-col rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-rose-400" fill="currentColor" />
                <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Likes</h2>
              </div>
              <button onClick={onClose} className="text-subtle hover:text-foreground transition-colors" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1.5">
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-accent" size={22} /></div>
              ) : likers.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted">No likes yet.</p>
              ) : (
                likers.map(liker => {
                  const isFollowing = follow.get(liker.username) ?? liker.isFollowedByMe
                  return (
                    <div key={liker.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-2 transition-colors">
                      <Link href={`/u/${liker.username}`} onClick={onClose} className="flex items-center gap-3 min-w-0 flex-1">
                        {liker.avatarUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={liker.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black text-white shrink-0">
                            {liker.displayName[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate flex items-center gap-1">
                            <span className="truncate">{liker.displayName}</span>
                            {liker.verifiedKind && <VerifiedBadge kind={liker.verifiedKind} size={13} />}
                          </p>
                          <p className="text-[11px] text-subtle truncate">@{liker.username}</p>
                        </div>
                      </Link>
                      {!liker.isMe && (
                        <button
                          onClick={() => toggleFollow(liker)}
                          className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            isFollowing
                              ? "bg-surface-2 border border-border text-muted hover:text-foreground"
                              : "bg-accent text-black hover:bg-accent-bright"
                          }`}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
