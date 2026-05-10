"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid, Book, MonitorPlay, Activity, BarChart2,
  User, Users, Bell, Settings, Flame, Zap, ChevronRight, Rss, Trophy,
} from "lucide-react"
import { useWatchlist } from "@/stores/watchlist.store"

const NAV = [
  {
    label: "My Space",
    items: [
      { name: "Dashboard",     href: "/dashboard",      icon: LayoutGrid   },
      { name: "My Feed",       href: "/feed",           icon: Rss          },
      { name: "Watchlist",     href: "/watchlist",      icon: MonitorPlay  },
      { name: "Library",       href: "/readlist",       icon: Book         },
      { name: "Streak",        href: "/streak",         icon: Activity     },
      { name: "Achievements",  href: "/achievements",   icon: Trophy       },
      { name: "Watch Stats",   href: "/stats",          icon: BarChart2    },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Profile",       href: "/profile",        icon: User         },
      { name: "Following",     href: "/following",      icon: Users        },
      { name: "Notifications", href: "/notifications",  icon: Bell,  badge: true },
      { name: "Settings",      href: "/settings",       icon: Settings     },
    ],
  },
]

export default function Sidebar() {
  const pathname  = usePathname()
  const wlCount   = useWatchlist(s => s.count)

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#050505] border-r border-white/5 flex flex-col z-50">

      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_18px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-transform">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="text-lg font-black tracking-tighter text-white uppercase">
            UNWATCHED<span className="text-indigo-500">.</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 space-y-5 pb-4 scrollbar-hide">
        {NAV.map(group => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                      active ? "text-white" : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-pill"
                        className="absolute inset-0 bg-indigo-600/10 border border-indigo-500/20 rounded-xl"
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      />
                    )}
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon
                        size={15}
                        className={active ? "text-indigo-400" : "group-hover:text-indigo-400 transition-colors"}
                      />
                      <span className="text-[13px] font-bold">{item.name}</span>
                    </div>
                    {"badge" in item && item.badge && (
                      <span className="relative z-10 flex items-center gap-1">
                        {wlCount > 0 && item.name === "Watchlist" ? null : null}
                        {item.name === "Notifications" && (
                          <span className="px-1.5 py-0.5 rounded-full bg-indigo-600/30 text-[8px] font-black text-indigo-400">2</span>
                        )}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Watchlist count chip */}
        {wlCount > 0 && (
          <div className="mx-3 p-3 rounded-xl bg-white/[0.03] border border-white/8 flex items-center justify-between">
            <span className="text-[11px] font-bold text-white/50">Watchlist items</span>
            <span className="text-[11px] font-black text-indigo-400">{wlCount}</span>
          </div>
        )}
      </div>

      {/* Streak footer */}
      <div className="px-4 pb-5 pt-3 border-t border-white/5">
        <Link href="/streak" className="block group">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-3 group-hover:bg-white/[0.05] group-hover:border-indigo-500/25 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                  <Flame size={14} fill="currentColor" className="animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">22 Day Streak</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-tighter mt-0.5">Flame Grade III</p>
                </div>
              </div>
              <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">
                <span>Daily Goal</span><span>80%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-orange-500 to-indigo-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  )
}
