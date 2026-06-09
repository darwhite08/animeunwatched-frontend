"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CaretRight } from "@phosphor-icons/react"
import type { NavItem } from "../sidebarConfig"
import { resolvePath } from "../sidebarConfig"

/**
 * Sidebar item with a hover flyout panel of sub-destinations. The panel is
 * `fixed`-positioned (anchored to the item's measured rect) so it escapes the
 * sidebar's vertical scroll/overflow clipping. Clicking the item itself still
 * navigates to the section hub.
 */
export function SidebarFlyoutItem({
  item, slug, collapsed,
}: { item: NavItem; slug?: string | null; collapsed: boolean }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const href = resolvePath(item, slug)
  const Icon = item.icon
  const links = (item.flyout ?? []).map((l) => ({ ...l, href: resolvePath(l, slug) }))
  const active =
    pathname === href ||
    pathname.startsWith(href + "/") ||
    links.some((l) => pathname === l.href || pathname.startsWith(l.href + "/"))

  const openFlyout = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    const r = ref.current?.getBoundingClientRect()
    if (r) setPos({ top: Math.max(8, Math.min(r.top, window.innerHeight - 480)), left: r.right + 2 })
    setOpen(true)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 260)
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={openFlyout} onMouseLeave={scheduleClose}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        title={collapsed ? item.label : undefined}
        className={`group relative flex items-center rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
          collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
        } ${active ? "bg-accent/15 text-accent-bright" : "text-muted hover:bg-white/5 hover:text-foreground"}`}
      >
        <span className="shrink-0">
          <Icon size={20} weight={active ? "fill" : "regular"} />
        </span>
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && <CaretRight size={13} className="ml-auto opacity-60" />}
      </Link>

      {open && (
        <div
          role="menu"
          aria-label={`${item.label} sections`}
          onMouseEnter={openFlyout}
          onMouseLeave={scheduleClose}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 w-64 max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-xl"
        >
          {links.map((l) => {
            const LIcon = l.icon
            const lActive = pathname === l.href || pathname.startsWith(l.href + "/")
            return (
              <Link
                key={l.path}
                href={l.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${
                  lActive ? "bg-accent/15 text-accent-bright" : "text-muted hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-accent-bright">
                  <LIcon size={16} weight={lActive ? "fill" : "regular"} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{l.label}</span>
                  <span className="block truncate text-[11px] text-subtle">{l.desc}</span>
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
