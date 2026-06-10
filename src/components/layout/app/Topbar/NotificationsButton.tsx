"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useNavBadges } from "../useNavBadges"

export function NotificationsButton() {
  const slug = useAuthStore((s) => s.user?.slug)
  const { unreadNotifications } = useNavBadges()
  const href = slug ? `/user/${slug}/notifications` : "/notifications"

  return (
    <Link
      href={href}
      aria-label={unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : "Notifications"}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-muted transition-all hover:border-white/15 hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
    >
      <Bell size={18} />
      {unreadNotifications > 0 && (
        <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-black leading-[18px] text-white ring-2 ring-background">
          {unreadNotifications > 9 ? "9+" : unreadNotifications}
        </span>
      )}
    </Link>
  )
}
