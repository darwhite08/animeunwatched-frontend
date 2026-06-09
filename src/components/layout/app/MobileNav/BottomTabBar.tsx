"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth.store"
import { MOBILE_ITEMS, resolvePath } from "../sidebarConfig"
import { useNavBadges } from "../useNavBadges"

function active(pathname: string, href: string) {
  const tail = href.split("/").filter(Boolean).pop() ?? ""
  return pathname === href || pathname.startsWith(href + "/") || pathname.endsWith("/" + tail)
}

/** <md fixed bottom tab bar (5 items max). */
export function BottomTabBar() {
  const pathname = usePathname()
  const slug = useAuthStore((s) => s.user?.slug)
  const badges = useNavBadges()

  return (
    <nav aria-label="Primary mobile" className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-background/95 backdrop-blur md:hidden">
      {MOBILE_ITEMS.map((item) => {
        const href = resolvePath(item, slug)
        const isOn = active(pathname, href)
        const count = item.badgeKey ? badges[item.badgeKey] : 0
        const Icon = item.icon
        return (
          <Link key={item.key} href={href} aria-current={isOn ? "page" : undefined} className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 ${isOn ? "text-accent-bright" : "text-muted"}`}>
            <span className="relative">
              <Icon size={22} weight={isOn ? "fill" : "regular"} />
              {count > 0 && <span aria-label={`${count} unread`} className="absolute -right-2 -top-1 min-w-[16px] rounded-full bg-rose-500 px-1 text-center text-[9px] font-black leading-4 text-white">{count > 9 ? "9+" : count}</span>}
            </span>
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
