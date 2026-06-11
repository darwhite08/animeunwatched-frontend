"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CaretRight } from "@phosphor-icons/react"
import type { NavItem } from "../sidebarConfig"
import { resolvePath } from "../sidebarConfig"

/**
 * Sidebar item with a flyout panel of sub-destinations.
 *
 * Accessibility: the section hub is a normal link; a separate caret *button*
 * (aria-haspopup/aria-expanded) toggles the menu so keyboard + screen-reader
 * users can open it (mouse users also get hover). Escape closes and returns
 * focus to the button; a click outside closes. The panel is `fixed`-positioned
 * (anchored to the row's measured rect) so it escapes the sidebar scroll clip.
 */
export function SidebarFlyoutItem({
  item, slug, collapsed,
}: { item: NavItem; slug?: string | null; collapsed: boolean }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
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

  const place = () => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setPos({ top: Math.max(8, Math.min(r.top, window.innerHeight - 480)), left: r.right + 2 })
  }
  const openFlyout = () => { if (closeTimer.current) clearTimeout(closeTimer.current); place(); setOpen(true) }
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setOpen(false), 260) }
  const closeNow = (focusBtn = false) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(false)
    if (focusBtn) btnRef.current?.focus()
  }

  // Close on Escape (return focus to the toggle) + click/focus outside.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeNow(true) }
    const onPointer = (e: Event) => { if (ref.current && !ref.current.contains(e.target as Node)) closeNow() }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onPointer)
    document.addEventListener("focusin", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("focusin", onPointer)
    }
  }, [open])

  return (
    <div ref={ref} className="relative" onMouseEnter={openFlyout} onMouseLeave={scheduleClose}>
      <div
        className={`relative flex items-center rounded-xl text-sm font-bold transition-all ${
          active
            ? "bg-gradient-to-r from-accent/20 to-accent/[0.06] text-accent-bright shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--app-accent)_25%,transparent)]"
            : "text-muted hover:bg-white/5 hover:text-foreground"
        }`}
      >
        {active && (
          <span aria-hidden className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent-bright shadow-[0_0_10px_color-mix(in_srgb,var(--app-accent)_70%,transparent)]" />
        )}
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          title={collapsed ? item.label : undefined}
          className={`flex flex-1 items-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
            collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-2.5"
          }`}
        >
          <span className="shrink-0"><Icon size={20} weight={active ? "fill" : "regular"} /></span>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
        {!collapsed && (
          <button
            ref={btnRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Show"} ${item.label} sections`}
            onClick={() => (open ? closeNow(true) : openFlyout())}
            onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); openFlyout() } }}
            className="mr-1 rounded-lg p-1.5 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            <CaretRight size={13} className={`transition-transform motion-reduce:transition-none ${open ? "rotate-90" : "opacity-60"}`} />
          </button>
        )}
      </div>

      {open && (
        <div
          role="menu"
          aria-label={`${item.label} sections`}
          onMouseEnter={openFlyout}
          onMouseLeave={scheduleClose}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[120] w-64 max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-background/95 p-2 shadow-2xl backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5"
        >
          {links.map((l) => {
            const LIcon = l.icon
            const lActive = pathname === l.href || pathname.startsWith(l.href + "/")
            return (
              <Link
                key={l.path}
                href={l.href}
                role="menuitem"
                aria-current={lActive ? "page" : undefined}
                onClick={() => closeNow()}
                className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
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
