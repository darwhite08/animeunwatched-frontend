"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import {
  LayoutGrid, Book, MonitorPlay, Activity, BarChart2,
  User, Users, Bell, Settings, Flame, Zap, ChevronRight, Rss, Trophy,
  BookOpen, History, Tag, Building2, Sparkles, Layers,
} from "lucide-react"
import { useWatchlist } from "@/stores/watchlist.store"
import { useUnreadCount } from "@/hooks/useNotificationsQuery"

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
      { name: "Manga",         href: "/manga",          icon: BookOpen     },
      { name: "History",       href: "/history",        icon: History      },
    ],
  },
  {
    label: "Explore",
    items: [
      { name: "Genres",          href: "/genres",          icon: Tag       },
      { name: "Studios",         href: "/studios",         icon: Building2 },
      { name: "Recommendations", href: "/recommendations", icon: Sparkles  },
      { name: "Collections",     href: "/collections",     icon: Layers    },
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
  const wlCount      = useWatchlist(s => s.count)
  const { data: unreadData } = useUnreadCount()
  const unreadCount  = unreadData?.count ?? 0
  const user         = useAuthStore(s => s.user)
  const rep       = user?.reputation ?? 0
  const level     = Math.max(1, Math.floor(Math.sqrt(Math.max(0, rep) * 100 / 1000)))
  const streak    = Math.min(365, Math.floor(rep / 10))
  const grade     = level >= 10 ? "Grade IV" : level >= 7 ? "Grade III" : level >= 4 ? "Grade II" : "Grade I"

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#050505] border-r border-white/5 flex flex-col z-50">

      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          {/* Kaiveron K mark */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="36" height="36" className="group-hover:scale-110 transition-transform flex-shrink-0">
            <rect width="100" height="100" rx="18" fill="#0A0F1E"/>
            <path d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z" fill="#F4F2EC"/>
          </svg>
          <span className="text-lg font-black tracking-tight text-white uppercase italic">
            KAIVERON<span style={{color:"#6366f1"}}>.</span>
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
                        {item.name === "Notifications" && unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-indigo-600/30 text-[8px] font-black text-indigo-400">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
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
                  <p className="text-xs font-black text-white leading-none">{streak} Day Streak</p>
                  <p className="text-[9px] text-white/20 uppercase tracking-tighter mt-0.5">Flame {grade}</p>
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
