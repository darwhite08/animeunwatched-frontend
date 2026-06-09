"use client"

import { Sidebar } from "./Sidebar/Sidebar"
import { Topbar } from "./Topbar/Topbar"
import { BottomTabBar } from "./MobileNav/BottomTabBar"
import { MobileDrawer } from "./MobileNav/MobileDrawer"
import { useSidebarStore } from "./useSidebarStore"

/**
 * Authenticated app chrome: collapsible left sidebar + slim utility topbar on
 * ≥md, bottom tab bar + drawer on <md. Wraps the page content. Mount this at
 * the authenticated layout boundary (the (user) and legacy (dashboard) groups).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useSidebarStore((s) => s.collapsed)

  return (
    <div className="min-h-screen bg-background">
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
