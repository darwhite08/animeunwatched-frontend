"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavItem } from "../sidebarConfig"
import { resolvePath } from "../sidebarConfig"
import { useNavBadges } from "../useNavBadges"

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  // Match nested routes: /clubs highlights for /clubs/123. Compare the final
  // path segment of slug-routes too (e.g. .../feed).
  const tail = href.split("/").filter(Boolean).pop() ?? ""
  return pathname === href || pathname.startsWith(href + "/") || pathname.endsWith("/" + tail)
}

export function SidebarItem({
  item, slug, collapsed,
}: { item: NavItem; slug?: string | null; collapsed: boolean }) {
  const pathname = usePathname()
  const badges = useNavBadges()
  const href = resolvePath(item, slug)
  const active = isActive(pathname, href)
  const count = item.badgeKey ? badges[item.badgeKey] : 0
  const Icon = item.icon

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center rounded-xl text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
        collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
      } ${
        active
          ? "font-black text-foreground"
          : "font-bold text-muted hover:bg-white/5 hover:text-foreground"
      }`}
    >
      <span className="relative shrink-0">
        <Icon size={20} weight={active ? "fill" : "regular"} />
        {count > 0 && collapsed && (
          <span aria-hidden className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500" />
        )}
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && count > 0 && (
        <span
          aria-label={`${count} unread`}
          className="ml-auto min-w-[20px] rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-black text-foreground"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  )
}
