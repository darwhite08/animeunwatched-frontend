"use client"

import {
  Home,
  User,
  Trophy,
  Bookmark,
  Flame,
  LayoutDashboard,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import Image from "next/image"

type NavItem = {
  name: string
  href: string
  icon?: any
  iconSrc?: string
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Watchlist",
    href: "/watchlist",
    icon: Bookmark,
  },
  {
    name: "My Readlist",
    href: "/readlist",
    icon: User,
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Streak",
    href: "/streak",
    icon: Flame,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 border-r border-white/10 bg-neutral-950 p-6 hidden md:flex flex-col">
      <div className="mb-10">
        <h2 className="text-lg font-semibold">
          Anime Unwatched
        </h2>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              {Icon && (
                <Icon
                  size={18}
                  className={clsx(
                    active ? "text-white" : "text-white/60"
                  )}
                />
              )}

              {item.iconSrc && (
                <Image
                className="bg-black"
                  src={item.iconSrc}
                  alt={item.name}
                  width={18}
                  height={18}
                />
              )}

              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}