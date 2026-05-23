"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User, Bell, Palette, Shield, CreditCard, Link2, Lock, Settings, Download,
} from "lucide-react"
import { motion } from "framer-motion"

const NAV = [
  { href: "/me/settings/account",       icon: User,       label: "Account"       },
  { href: "/me/settings/notifications", icon: Bell,       label: "Notifications" },
  { href: "/me/settings/appearance",    icon: Palette,    label: "Appearance"    },
  { href: "/me/settings/privacy",       icon: Shield,     label: "Privacy"       },
  { href: "/me/settings/security",      icon: Lock,       label: "Security"      },
  { href: "/me/settings/billing",       icon: CreditCard, label: "Billing"       },
  { href: "/me/settings/connected",     icon: Link2,      label: "Connected"     },
  { href: "/me/import",                 icon: Download,   label: "Import List"   },
]

export default function MeSettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Settings size={14} className="text-accent" />
          <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-accent/60">
            me / settings
          </p>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
          Settings<span className="text-accent">.</span>
        </h1>
        {/* Accent divider */}
        <div className="mt-6 h-px"
          style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--app-accent) 50%, transparent), color-mix(in srgb, var(--app-accent) 20%, transparent) 40%, transparent)" }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar nav */}
        <nav className="lg:w-52 flex lg:flex-col gap-1 shrink-0">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active ? "text-foreground" : "text-muted hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {active && (
                  <motion.div layoutId="me-settings-pill"
                    className="absolute inset-0 rounded-xl border border-accent/25"
                    style={{
                      background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--app-accent) 10%, transparent), color-mix(in srgb, var(--app-accent) 5%, transparent))",
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <item.icon size={15}
                  className={`relative z-10 transition-colors ${active ? "text-accent" : ""}`}
                />
                <span className="relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Page content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
