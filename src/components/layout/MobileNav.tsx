"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutGrid, MonitorPlay, Compass, Users, Bell } from "lucide-react"
import { useNotifications } from "@/components/notifications/useNotifications"
import { useAuthStore } from "@/stores/auth.store"

const TABS = [
  { href: "/dashboard",  icon: LayoutGrid, label: "Home"      },
  { href: "/watchlist",  icon: MonitorPlay, label: "Watchlist" },
  { href: "/discover",   icon: Compass,     label: "Discover"  },
  { href: "/community",  icon: Users,       label: "Community" },
  { href: "/notifications", icon: Bell,     label: "Alerts"    },
]

export default function MobileNav() {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  if (!isAuthenticated) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 z-[80] md:hidden">
      {/* Frosted glass bar */}
      <div className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/8 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {TABS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all"
              >
                {/* Active pill background */}
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-indigo-600/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative">
                  <Icon
                    size={20}
                    className={`transition-colors ${active ? "text-amber-400" : "text-white/35"}`}
                  />
                  {/* Notification badge */}
                  {label === "Alerts" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black text-black" style={{background:"linear-gradient(135deg,#fbbf24,#f59e0b)"}} className-removed=" flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                  active ? "text-amber-400" : "text-white/25"
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
