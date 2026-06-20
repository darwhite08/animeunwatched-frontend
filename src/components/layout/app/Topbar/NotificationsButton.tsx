"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useNavBadges } from "../useNavBadges"
import { NOTIF_RING_EVENT } from "@/components/layout/RealtimeListeners"

export function NotificationsButton() {
  const slug = useAuthStore((s) => s.user?.slug)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { unreadNotifications } = useNavBadges()
  const href = slug ? `/user/${slug}/notifications` : "/notifications"

  // Ring the bell when a new notification arrives (global event from RealtimeListeners).
  const [ringing, setRinging] = useState(false)
  useEffect(() => {
    const onRing = () => { setRinging(true); window.setTimeout(() => setRinging(false), 900) }
    window.addEventListener(NOTIF_RING_EVENT, onRing)
    return () => window.removeEventListener(NOTIF_RING_EVENT, onRing)
  }, [])

  // Guests have no notifications — hide the bell entirely.
  if (!isAuthenticated) return null

  return (
    <Link
      href={href}
      aria-label={unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : "Notifications"}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-muted transition-all hover:border-white/15 hover:bg-white/5 hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <Bell size={19} className={ringing ? "notif-ringing text-accent-bright" : ""} />
      {unreadNotifications > 0 && (
        <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-black leading-[18px] text-foreground ring-2 ring-background">
          {unreadNotifications > 9 ? "9+" : unreadNotifications}
        </span>
      )}
    </Link>
  )
}
