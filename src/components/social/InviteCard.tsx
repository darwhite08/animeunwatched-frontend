"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Copy, Check, Share2, UserPlus } from "lucide-react"
import { getMyReferrals } from "@/lib/api/endpoints"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"

/** Compact relative time: "now", "5m", "3h", "2d", "1w", "3mo". */
function since(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return "now"
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  if (d < 35) return `${Math.floor(d / 7)}w`
  return `${Math.floor(d / 30)}mo`
}

/**
 * "Invite friends" card for the owner's own profile: their personal invite link
 * (copy + native share), how many people joined through it, the rep it earned,
 * and avatars of who joined. Backed by GET /users/me/referrals.
 */
export function InviteCard() {
  const username = useAuthStore((s) => s.user?.username)
  const { push } = useToast()
  const [copied, setCopied] = useState(false)

  const { data } = useQuery({
    queryKey: ["my-referrals"],
    queryFn: getMyReferrals,
    staleTime: 60_000,
    enabled: !!username,
  })

  if (!username) return null

  // Handles are case-insensitive — always present the link in lowercase.
  const handle = username.toLowerCase()
  const link = `https://kaiveron.com/join/${handle}`
  const count = data?.count ?? 0

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      push("Invite link copied!", "success")
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked */
    }
  }

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Join me on Kaiveron", text: "Track, rate & discover anime with me on Kaiveron", url: link })
      } catch {
        /* user dismissed */
      }
    } else {
      copy()
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <UserPlus size={15} className="text-accent-bright" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Invite friends</h3>
        {count > 0 && <span className="ml-auto text-[11px] font-bold text-foreground">{count.toLocaleString()} joined</span>}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
        <span className="flex-1 truncate font-mono text-[13px] text-muted">kaiveron.com/join/{handle}</span>
        <button
          onClick={copy}
          aria-label="Copy invite link"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-foreground active:scale-95"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
        </button>
        <button
          onClick={share}
          aria-label="Share invite link"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-black transition-transform active:scale-95"
          style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}
        >
          <Share2 size={15} />
        </button>
      </div>

      {count > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-[12px] text-muted">
            <span className="font-bold text-foreground">{count.toLocaleString()}</span> joined through you ·{" "}
            <span className="font-bold text-accent-bright">+{(data?.repEarned ?? 0).toLocaleString()} rep</span>
          </p>
          <ul className="space-y-1">
            {(data?.recent ?? []).slice(0, 10).map((u) => (
              <li key={u.username} className="flex items-center gap-3 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-white/[0.03]">
                <Link href={`/u/${u.username}`} className="shrink-0">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-bright to-accent text-[12px] font-black text-black">
                      {u.displayName[0]?.toUpperCase()}
                    </span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/u/${u.username}`} className="block truncate text-[13px] font-semibold text-foreground transition-colors hover:text-white">
                    {u.displayName}
                  </Link>
                  <p className="truncate text-[11px] text-subtle">@{u.username}</p>
                </div>
                {!u.verified && (
                  <span className="shrink-0 rounded-full bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-subtle">pending</span>
                )}
                <span className="shrink-0 text-[11px] tabular-nums text-subtle">{since(u.joinedAt)}</span>
              </li>
            ))}
          </ul>
          {count > 10 && <p className="text-[11px] text-subtle">+{(count - 10).toLocaleString()} more</p>}
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-subtle">
          Share your link — earn <span className="font-bold text-accent-bright">+100 rep</span> for every friend who joins (and climb the leaderboard).
        </p>
      )}
    </div>
  )
}
