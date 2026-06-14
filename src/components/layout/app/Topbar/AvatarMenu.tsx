"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth.store"
import { logout } from "@/lib/api/endpoints"
import ProfileMenu from "@/components/layout/ProfileMenu"

/** Avatar button → existing ProfileMenu (profile, settings, theme, logout).
 *  Guests browsing the app shell see a "Sign in" button instead. */
export function AvatarMenu() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const sessionReady = useAuthStore((s) => s.sessionReady)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  // Guest → prominent Sign in CTA (the whole point: nudge them to convert).
  if (sessionReady && !isAuthenticated) {
    return (
      <Link href="/login"
        className="flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-4 sm:px-5 text-[12px] font-black uppercase tracking-widest text-black transition-all hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}>
        Sign in
      </Link>
    )
  }

  const name = user?.displayName ?? user?.username ?? "?"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent-bright to-accent text-sm font-black text-white ring-2 ring-white/10 transition-all hover:ring-white/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          name[0]?.toUpperCase()
        )}
      </button>
      <ProfileMenu
        user={{ name: user?.displayName ?? user?.username ?? "" }}
        isOpen={open}
        onClose={() => setOpen(false)}
        onLogout={async () => {
          try { await logout() } catch { /* still clear client */ }
          useAuthStore.getState().clear()
          window.location.href = "/"
        }}
      />
    </div>
  )
}
