"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutGrid, MonitorPlay, Compass, Users, Bell } from "lucide-react"
import { useNotifications } from "@/components/notifications/useNotifications"
import { useAuthStore } from "@/stores/auth.store"
import { userPath } from "@/hooks/useUserPath"

export default function MobileNav() {
  const pathname       = usePathname()
  const { unreadCount } = useNotifications()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const slug            = useAuthStore(s => s.user?.slug)

  if (!isAuthenticated) return null

  // Use slug-prefixed hrefs for protected routes so there's no redirect spinner
  const TABS = [
    { href: slug ? userPath(slug, "dashboard")     : "/dashboard",     icon: LayoutGrid, label: "Home"      },
    { href: slug ? userPath(slug, "watchlist")     : "/watchlist",     icon: MonitorPlay, label: "Watchlist" },
    { href: "/discover",                                                 icon: Compass,    label: "Discover"  },
    { href: "/community",                                                icon: Users,      label: "Community" },
    { href: slug ? userPath(slug, "notifications") : "/notifications",  icon: Bell,       label: "Alerts"    },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[80] md:hidden">
      <div className="bg-surface/95 backdrop-blur-2xl border-t border-border px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {TABS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/") ||
              // Also match the slug-less version for active state
              (label === "Home"      && pathname.includes("/dashboard")) ||
              (label === "Watchlist" && pathname.includes("/watchlist")) ||
              (label === "Alerts"    && pathname.includes("/notifications"))
            return (
              <Link key={label} href={href}
                className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all"
              >
                {active && (
                  <motion.div layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-accent/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative">
                  <Icon size={20} className={`transition-colors ${active ? "text-accent-bright" : "text-subtle"}`} />
                  {label === "Alerts" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-black"
                      style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                  active ? "text-accent-bright" : "text-subtle"
                }`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
