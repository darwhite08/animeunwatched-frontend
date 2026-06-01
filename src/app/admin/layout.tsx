"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { useSession } from "@/lib/auth/useSession"
import { useAuthStore } from "@/stores/auth.store"

const NAV = [
  { href: "/admin",         label: "Overview" },
  { href: "/admin/users",   label: "Users" },
  { href: "/admin/reports", label: "Moderation" },
  { href: "/admin/audit",   label: "Audit log" },
  { href: "/admin/health",  label: "System health" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const { user, isAuthenticated } = useSession()
  const sessionReady = useAuthStore((s) => s.sessionReady)

  // Skip the gate on /admin/login — that's where the user goes to authenticate
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (isLoginPage) return
    if (!sessionReady) return                     // wait for SessionProvider hydration
    if (!isAuthenticated) {
      router.replace(`/admin/login?returnTo=${encodeURIComponent(pathname ?? "/admin")}`)
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/403")
    }
  }, [sessionReady, isAuthenticated, user?.role, isLoginPage, pathname, router])

  if (isLoginPage) {
    return <div className="min-h-screen bg-background text-foreground">{children}</div>
  }

  if (!sessionReady || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted">
        <div className="text-xs font-mono uppercase tracking-[0.4em] opacity-60">
          Verifying admin access…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-60 border-r border-foreground/10 flex flex-col">
        <div className="px-5 py-6 border-b border-foreground/10">
          <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-1">
            Kaiveron
          </div>
          <div className="text-base font-black uppercase tracking-tight">
            Admin Console
          </div>
        </div>

        <nav className="flex-1 py-4">
          {NAV.map((item) => {
            const active = pathname === item.href
              || (item.href !== "/admin" && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "block px-5 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-foreground/5 text-foreground border-l-2 border-accent-bright"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-5 py-4 border-t border-foreground/10 text-[10px] font-mono uppercase tracking-[0.3em] text-subtle">
          <div className="opacity-60">Signed in as</div>
          <div className="text-foreground/80 truncate">{user.username}</div>
          <Link href="/" className="mt-2 inline-block text-accent-bright/80 hover:text-accent-bright">
            ← Back to site
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
