"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Bell, User, Settings, LogOut } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { logout } from "@/lib/api/endpoints"
import { useNavBadges } from "../useNavBadges"

/**
 * Sidebar footer: Notifications + account, moved out of the top bar. Account
 * opens a small popover anchored to the avatar (top bar's ProfileMenu is pinned
 * to the screen's top-right, so it can't be reused down here).
 */
export function SidebarFooter({ collapsed, slug }: { collapsed: boolean; slug?: string | null }) {
  const user = useAuthStore((s) => s.user)
  const isAuth = useAuthStore((s) => s.isAuthenticated)
  const sessionReady = useAuthStore((s) => s.sessionReady)
  const { unreadNotifications } = useNavBadges()
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  // Guest → Sign in CTA (the avatar/notifications make no sense logged-out).
  if (sessionReady && !isAuth) {
    return (
      <Link href="/login"
        className={`mt-2 flex items-center justify-center rounded-xl py-2.5 text-[12px] font-black uppercase tracking-widest text-black transition hover:opacity-90 active:scale-95 ${collapsed ? "" : "px-4"}`}
        style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}>
        {collapsed ? "→" : "Sign in"}
      </Link>
    )
  }

  const name = user?.displayName ?? user?.username ?? "?"
  const notifHref = slug ? `/user/${slug}/notifications` : "/notifications"
  const profileHref = slug ? `/user/${slug}/profile` : "/login"
  const settingsHref = slug ? `/user/${slug}/settings/account` : "/login"
  const row = "flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-bold text-muted transition-colors hover:bg-white/5 hover:text-foreground"

  return (
    <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
      {/* Notifications */}
      <Link href={notifHref} aria-label="Notifications" className={`${row} ${collapsed ? "justify-center" : ""}`}>
        <span className="relative shrink-0">
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute -right-1.5 -top-1.5 min-w-[16px] rounded-full bg-rose-500 px-1 text-center text-[9px] font-black leading-[16px] text-white ring-2 ring-background">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </span>
        {!collapsed && <span>Notifications</span>}
      </Link>

      {/* Account */}
      <div className="relative" ref={ref}>
        <button onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}
          className={`${row} w-full ${collapsed ? "justify-center" : ""}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent-bright to-accent text-xs font-black text-foreground ring-2 ring-white/10">
            {user?.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : name[0]?.toUpperCase()}
          </span>
          {!collapsed && <span className="truncate">{name}</span>}
        </button>

        {menuOpen && (
          <div role="menu"
            className="absolute bottom-full left-0 z-[120] mb-2 w-52 overflow-hidden rounded-2xl border border-border bg-background p-1.5 shadow-2xl">
            <Link href={profileHref} role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-foreground">
              <User size={15} /> My Profile
            </Link>
            <Link href={settingsHref} role="menuitem" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-foreground">
              <Settings size={15} /> Settings
            </Link>
            <button role="menuitem"
              onClick={async () => { setMenuOpen(false); try { await logout() } catch { /* still clear */ } useAuthStore.getState().clear(); window.location.href = "/" }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
