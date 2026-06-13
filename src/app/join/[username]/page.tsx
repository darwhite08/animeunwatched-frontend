"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { api } from "@/lib/api/client"
import { EASE, DURATION } from "@/lib/design/tokens"

type Inviter = { username?: string; displayName?: string; avatarUrl?: string | null }

/**
 * Public invite landing: kaiveron.com/join/<handle>. Personalizes for the
 * inviter, persists the referral (sessionStorage "aw_ref" — the same key the
 * register page reads), and funnels to signup with ?ref so the backend can
 * attribute the new user to the inviter.
 */
export default function JoinPage() {
  const params = useParams()
  const username = String(params?.username ?? "")
  const [inviter, setInviter] = useState<Inviter | null>(null)

  useEffect(() => {
    if (!username) return
    try {
      sessionStorage.setItem("aw_ref", username)
    } catch {
      /* private mode — ?ref on the CTA still carries it */
    }
    // Best-effort personalization; failure just falls back to the @handle.
    api<Inviter & { user?: Inviter }>(`/users/${encodeURIComponent(username)}`)
      .then((r) => {
        const u = r?.user ?? r
        if (u?.username) setInviter({ displayName: u.displayName, avatarUrl: u.avatarUrl, username: u.username })
      })
      .catch(() => {})
  }, [username])

  const name = inviter?.displayName || `@${username}`

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-background px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] text-foreground sm:px-6">
      <div
        className="pointer-events-none absolute left-1/2 top-[-160px] h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: "color-mix(in srgb, var(--app-accent) 22%, transparent)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.slow, ease: EASE.out }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        <div className="mx-auto mb-6 flex items-center justify-center">
          {inviter?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={inviter.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-20 w-20 rounded-3xl object-cover ring-2 ring-accent/40" />
          ) : (
            <div
              className="grid h-20 w-20 place-items-center rounded-3xl text-3xl font-black text-black"
              style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}
            >
              {username[0]?.toUpperCase() || "K"}
            </div>
          )}
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted">You&apos;re invited</p>
        <h1 className="mt-2 text-3xl font-black uppercase italic tracking-tighter sm:text-4xl">
          {name} invited you to <span style={{ color: "var(--app-accent)" }}>Kaiveron</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Track, rate &amp; discover anime — AI mood discovery, episode tracking, streaks, and a community that actually gets it. Free forever.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href={`/register?ref=${encodeURIComponent(username)}`}
            className="flex h-12 items-center justify-center rounded-2xl text-[12px] font-black uppercase tracking-widest text-black transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))", boxShadow: "0 8px 24px color-mix(in srgb, var(--app-accent) 30%, transparent)" }}
          >
            Create free account
          </Link>
          <Link
            href="/community"
            className="flex h-12 items-center justify-center rounded-2xl border border-border bg-surface text-[12px] font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-surface/70 active:scale-[0.98]"
          >
            Explore first
          </Link>
        </div>

        <p className="mt-5 text-[11px] text-subtle">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-bright hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
