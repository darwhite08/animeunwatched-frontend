"use client"

/**
 * Sidebar widget: people-you-may-know.
 *
 * Backed by GET /api/v1/users/suggestions — see who-to-follow-v1 in
 * users.service. The "reason" string explains *why* each person is
 * suggested ("Followed by people you follow" / "Similar taste" / etc),
 * which is what makes this widget feel different from a leaderboard.
 *
 * Renders nothing when the viewer isn't authenticated (no FOAF signal).
 * Renders nothing when the algorithm returns zero suggestions (cold-start
 * before the user follows anyone or builds a watchlist).
 */

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { UserPlus, Check, Users } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useWhoToFollow } from "@/hooks/usePosts"
import { useFollow } from "@/hooks/useUsers"

export function WhoToFollowWidget() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const { data, isLoading } = useWhoToFollow(5, isAuthenticated)
  const [followedLocal, setFollowedLocal] = useState<Set<string>>(new Set())

  if (!isAuthenticated) return null
  if (!isLoading && (data?.data ?? []).length === 0) return null

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-accent-bright" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Who to follow</h3>
        </div>
        <Link href="/users" className="text-[10px] font-bold text-accent-bright/80 hover:text-white transition-colors">
          More →
        </Link>
      </div>

      {isLoading && (
        <ul className="space-y-3" aria-busy="true">
          {[0, 1, 2].map(i => (
            <li key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-surface-2" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-24 bg-surface-2 rounded" />
                <div className="h-2 w-32 bg-surface-2 rounded" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && (data?.data ?? []).length > 0 && (
        <ul className="space-y-3.5">
          {(data?.data ?? []).map(({ user, reason }) => {
            const followedHere = followedLocal.has(user.id)
            return (
              <li key={user.id} className="flex items-center gap-3">
                {/* 44×44 tap target on mobile for the avatar+name region;
                    shrinks to a compact 36px circle on larger viewports
                    where pointers replace thumbs. */}
                <Link
                  href={`/u/${user.username}`}
                  className="shrink-0 inline-flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 -m-1.5 sm:m-0 rounded-full"
                  aria-label={`Open ${user.displayName}'s profile`}
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt=""
                      width={40} height={40}
                      className="rounded-full object-cover w-10 h-10 sm:w-9 sm:h-9"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[11px] font-black text-accent-bright">
                      {(user.displayName || user.username).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/u/${user.username}`}
                    className="block text-sm sm:text-xs font-bold text-foreground hover:text-white transition-colors truncate py-0.5"
                  >
                    {user.displayName}
                  </Link>
                  <p className="text-[11px] sm:text-[10px] text-subtle truncate" title={reason}>
                    {reason}
                  </p>
                </div>
                <FollowButton
                  username={user.username}
                  initiallyFollowing={followedHere}
                  onChange={(followed) => {
                    setFollowedLocal(prev => {
                      const next = new Set(prev)
                      if (followed) next.add(user.id); else next.delete(user.id)
                      return next
                    })
                  }}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function FollowButton({ username, initiallyFollowing, onChange }: {
  username: string
  initiallyFollowing: boolean
  onChange: (followed: boolean) => void
}) {
  const [following, setFollowing] = useState(initiallyFollowing)
  const mut = useFollow(username)

  const handleClick = () => {
    if (mut.isPending) return
    const next = !following
    setFollowing(next)
    onChange(next)
    mut.mutate({ follow: next })
  }

  return (
    <button
      onClick={handleClick}
      disabled={mut.isPending}
      aria-pressed={following}
      // min-h-9 (36px) + larger touch padding on mobile to satisfy the
      // 44×44 thumb-target heuristic; tightens on sm+ for desktop density.
      className={`shrink-0 min-h-9 px-3 sm:px-2.5 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50 inline-flex items-center gap-1 ${
        following
          ? "border border-border text-muted hover:text-foreground hover:bg-surface-2"
          : "bg-accent text-black hover:bg-accent-bright"
      }`}
    >
      {following ? <><Check size={11} /> Following</> : <><UserPlus size={11} /> Follow</>}
    </button>
  )
}
