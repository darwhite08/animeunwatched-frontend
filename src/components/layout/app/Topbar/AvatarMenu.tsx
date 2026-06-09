"use client"

import { useState, useRef, useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"
import { logout } from "@/lib/api/endpoints"
import ProfileMenu from "@/components/layout/ProfileMenu"

/** Avatar button → existing ProfileMenu (profile, settings, theme, logout). */
export function AvatarMenu() {
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  const name = user?.displayName ?? user?.username ?? "?"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-accent text-sm font-black text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
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
