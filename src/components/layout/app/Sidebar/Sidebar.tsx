"use client"

import Link from "next/link"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { NAV_ITEMS } from "../sidebarConfig"
import { SidebarItem } from "./SidebarItem"
import { SidebarFlyoutItem } from "./SidebarFlyoutItem"
import { SidebarGamification } from "./SidebarGamification"
import { useSidebarStore } from "../useSidebarStore"
import KaiveronLogo from "@/components/ui/KaiveronLogo"

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const slug = user?.slug
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggle = useSidebarStore((s) => s.toggle)

  return (
    <nav
      aria-label="Primary"
      className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-background px-3 py-4 transition-[width] duration-200 md:flex ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo + collapse toggle */}
      <div className={`mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"} px-1`}>
        <Link href="/community" aria-label="Kaiveron home">
          <KaiveronLogo size={collapsed ? 30 : 30} showWordmark={!collapsed} />
        </Link>
        {!collapsed && (
          <button onClick={toggle} aria-label="Collapse sidebar" className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-foreground">
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Primary nav */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) =>
          item.flyout ? (
            <SidebarFlyoutItem key={item.key} item={item} slug={slug} collapsed={collapsed} />
          ) : (
            <SidebarItem key={item.key} item={item} slug={slug} collapsed={collapsed} />
          )
        )}
      </div>

      {/* Gamification strip */}
      <div className="mt-3">
        <SidebarGamification slug={slug} collapsed={collapsed} />
      </div>

      {/* Expand toggle when collapsed */}
      {collapsed && (
        <button onClick={toggle} aria-label="Expand sidebar" className="mt-3 flex justify-center rounded-lg py-2 text-muted hover:bg-white/5 hover:text-foreground">
          <PanelLeftOpen size={18} />
        </button>
      )}
    </nav>
  )
}
