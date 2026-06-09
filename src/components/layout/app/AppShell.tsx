"use client"

import { Sidebar } from "./Sidebar/Sidebar"
import { Topbar } from "./Topbar/Topbar"
import { BottomTabBar } from "./MobileNav/BottomTabBar"
import { MobileDrawer } from "./MobileNav/MobileDrawer"
import { useSidebarStore } from "./useSidebarStore"

/**
 * Authenticated app chrome: collapsible left sidebar + slim utility topbar on
 * ≥md, bottom tab bar + drawer on <md. Wraps the page content.
 *
 * `publicMode` is set when wrapping pages from the (public) route group for a
 * logged-in user. Those pages bake in fixed-marketing-navbar top spacing, so we
 * add the `app-public-shell` class which neutralises that clearance (the sticky
 * topbar provides the offset) and exposes --sticky-top / --page-top.
 */
export function AppShell({ children, publicMode = false }: { children: React.ReactNode; publicMode?: boolean }) {
  const collapsed = useSidebarStore((s) => s.collapsed)

  return (
    <div className={`min-h-screen bg-background ${publicMode ? "app-public-shell" : ""}`}>
      <Sidebar />
      <MobileDrawer />

      <div className={`flex min-h-screen flex-col transition-[margin] duration-200 ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Topbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>

      <BottomTabBar />
    </div>
  )
}
