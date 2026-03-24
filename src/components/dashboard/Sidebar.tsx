"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutGrid, Book, MonitorPlay, 
  Trophy, Vote, ShoppingBag, 
  Settings, Flame, Zap, 
  ChevronRight, Activity
} from "lucide-react"

const NAV_GROUPS = [
  {
    label: "Primary",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
      { name: "Archives", href: "/readlist", icon: Book },
      { name: "Watchlist", href: "/watchlist", icon: MonitorPlay },
    ]
  },
  {
    label: "The Dojo",
    items: [
      { name: "Hall of Fame", href: "/leaderboard", icon: Trophy },
      { name: "Polls", href: "/poll", icon: Vote },
      { name: "Streak Hub", href: "/streak", icon: Activity }, // New dedicated streak link
    ]
  },
  {
    label: "System",
    items: [
      { name: "Black Market", href: "/rate", icon: ShoppingBag },
      { name: "Settings", href: "#", icon: Settings },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#050505] border-r border-white/5 flex flex-col z-50">
      {/* 1. BRANDING & LOGO */}
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-transform">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">
            UNWATCHED<span className="text-indigo-500">.</span>
          </span>
        </Link>
      </div>

      {/* 2. NAVIGATION */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8 hide-scrollbar pb-10">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <h4 className="px-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
              {group.label}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                      isActive ? "text-white" : "text-white/40 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon size={18} className={isActive ? "text-indigo-400" : "group-hover:text-indigo-400 transition-colors"} />
                      <span className="text-sm font-bold tracking-tight">{item.name}</span>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute inset-0 bg-indigo-600/10 border border-indigo-500/20 rounded-xl"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {item.name === "Polls" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. PREMIUM STREAK FOOTER */}
      <div className="p-6 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-md">
        <Link href="/streak" className="block group">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 group-hover:bg-white/[0.06] group-hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <Flame size={16} fill="currentColor" className="animate-pulse" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-white leading-none">22 Day Streak</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">Flame Grade III</p>
                  </div>
               </div>
               <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
                <span>Daily Goal</span>
                <span>80%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "80%" }} 
                  transition={{ duration: 1, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-orange-600 to-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]" 
                />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  )
}