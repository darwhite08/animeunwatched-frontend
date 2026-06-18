"use client"

import { Sidebar } from "./Sidebar/Sidebar"
import { Topbar } from "./Topbar/Topbar"
import { BottomTabBar } from "./MobileNav/BottomTabBar"
import { MobileDrawer } from "./MobileNav/MobileDrawer"
import { EmailVerifyBanner } from "./EmailVerifyBanner"
import { useSidebarStore } from "./useSidebarStore"
import { PageTransition } from "../PageTransition"

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
      {/* Keyboard/screen-reader: jump straight past the nav to the page content */}
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:outline-none focus:ring-2 focus:ring-accent/60"
      >
        Skip to content
      </a>
      <Sidebar />
      <MobileDrawer />

      <div className={`flex min-h-screen flex-col transition-[margin] duration-200 motion-reduce:transition-none ${collapsed ? "md:ml-16" : "md:ml-60"}`}>
        <Topbar />
        <EmailVerifyBanner />
        <main id="main-content" tabIndex={-1} className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] outline-none md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      <BottomTabBar />
    </div>
  )
}
