"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid, Book, MonitorPlay,
  Trophy, Vote, ShoppingBag,
  Settings, Flame, Zap,
  ChevronRight, Activity, Bell,
  Sparkles, PenSquare,
} from "lucide-react"

const NAV_GROUPS = [
  {
    label: "Primary",
    items: [
      { name: "Dashboard",      href: "/dashboard",      icon: LayoutGrid   },
      { name: "Watchlist",      href: "/watchlist",      icon: MonitorPlay  },
      { name: "Archives",       href: "/readlist",       icon: Book         },
      { name: "Notifications",  href: "/notifications",  icon: Bell, badge: true },
    ],
  },
  {
    label: "The Dojo",
    items: [
      { name: "Hall of Fame",   href: "/leaderboard",    icon: Trophy       },
      { name: "Streak Hub",     href: "/streak",         icon: Activity     },
      { name: "Polls",          href: "/poll",           icon: Vote, pulse: true },
      { name: "Rate Anime",     href: "/rate",           icon: ShoppingBag  },
    ],
  },
  {
    label: "Creator Studio",
    items: [
      { name: "Studio Hub",     href: "/creators",       icon: PenSquare    },
      { name: "AI Discover",    href: "/ai-discover",    icon: Sparkles     },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings",       href: "/settings",       icon: Settings     },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#050505] border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <div className="p-8 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-transform">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">
            UNWATCHED<span className="text-indigo-500">.</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 hide-scrollbar pb-6">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="space-y-1">
            <h4 className="px-4 mb-2 text-[9px] font-black uppercase tracking-[0.4em] text-white/18">
              {group.label}
            </h4>
            {group.items.map(item => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${
                    isActive ? "text-white" : "text-white/40 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-indigo-600/10 border border-indigo-500/20 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <item.icon
                      size={16}
                      className={isActive ? "text-indigo-400" : "group-hover:text-indigo-400 transition-colors"}
                    />
                    <span className="text-sm font-bold tracking-tight">{item.name}</span>
                  </div>
                  {"pulse" in item && item.pulse && (
                    <div className="relative z-10 h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                  {"badge" in item && item.badge && (
                    <span className="relative z-10 px-1.5 py-0.5 rounded-full bg-indigo-600/30 text-[8px] font-black text-indigo-400">
                      2
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Streak footer */}
      <div className="p-5 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <Link href="/streak" className="block group">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 space-y-3 group-hover:bg-white/[0.06] group-hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                  <Flame size={15} fill="currentColor" className="animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-none">22 Day Streak</p>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mt-0.5">Flame Grade III</p>
                </div>
              </div>
              <ChevronRight size={13} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/25">
                <span>Daily Goal</span>
                <span>80%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-orange-500 to-indigo-500"
                />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  )
}
