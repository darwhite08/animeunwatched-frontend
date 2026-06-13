"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { useAuthStore } from "@/stores/auth.store"
import { MOBILE_ITEMS, resolvePath } from "../sidebarConfig"
import { useNavBadges } from "../useNavBadges"
import { SPRING } from "@/lib/design/tokens"

function active(pathname: string, href: string) {
  const tail = href.split("/").filter(Boolean).pop() ?? ""
  return pathname === href || pathname.startsWith(href + "/") || pathname.endsWith("/" + tail)
}

/** <md fixed bottom tab bar (5 items max). Height + bottom safe-area inset are
 *  applied in globals.css to nav[aria-label="Primary mobile"]. */
export function BottomTabBar() {
  const pathname = usePathname()
  const slug = useAuthStore((s) => s.user?.slug)
  const badges = useNavBadges()

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-white/[0.06] bg-background/85 backdrop-blur-xl md:hidden"
    >
      {MOBILE_ITEMS.map((item) => {
        const href = resolvePath(item, slug)
        const isOn = active(pathname, href)
        const count = item.badgeKey ? badges[item.badgeKey] : 0
        const Icon = item.icon
        return (
          <Link
            key={item.key}
            href={href}
            aria-current={isOn ? "page" : undefined}
            className="group relative flex flex-1 flex-col items-center justify-center gap-1 pb-1 pt-2"
          >
            <span className="relative flex h-9 w-14 items-center justify-center">
              {isOn && (
                <motion.span
                  layoutId="tabbar-active"
                  transition={SPRING.snappy}
                  className="absolute inset-0 rounded-full bg-accent/15"
                />
              )}
              <Icon
                size={23}
                weight={isOn ? "fill" : "regular"}
                className={`relative transition-colors ${
                  isOn ? "text-accent-bright" : "text-muted group-active:text-foreground"
                }`}
              />
              {count > 0 && (
                <span
                  aria-label={`${count} unread`}
                  className="absolute right-1.5 top-0 min-w-[17px] rounded-full bg-rose-500 px-1 text-center text-[9px] font-black leading-[17px] text-white ring-2 ring-background"
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </span>
            <span
              className={`text-[11px] font-semibold tracking-wide transition-colors ${
                isOn ? "text-accent-bright" : "text-subtle"
              }`}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
