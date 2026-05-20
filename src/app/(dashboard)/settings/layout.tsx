"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User, Bell, Palette, Shield, CreditCard, Link2, Lock, Settings,
} from "lucide-react"
import { motion } from "framer-motion"

const NAV = [
  { href: "/settings/account",       icon: User,     label: "Account"       },
  { href: "/settings/notifications",  icon: Bell,     label: "Notifications" },
  { href: "/settings/appearance",     icon: Palette,  label: "Appearance"    },
  { href: "/settings/privacy",        icon: Shield,   label: "Privacy"       },
  { href: "/settings/security",       icon: Lock,     label: "Security"      },
  { href: "/settings/billing",        icon: CreditCard, label: "Billing"     },
  { href: "/settings/connected",      icon: Link2,    label: "Connected"     },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Settings size={14} className="text-amber-400" />
          <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em]"
            style={{ color: "rgba(245,158,11,0.6)" }}>
            System Configuration
          </p>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
          Settings<span style={{ color: "#f59e0b" }}>.</span>
        </h1>
        {/* Gold divider */}
        <div className="mt-6 h-px"
          style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), rgba(245,158,11,0.2) 40%, transparent)" }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar nav */}
        <nav className="lg:w-52 flex lg:flex-col gap-1 shrink-0">
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active ? "text-white" : "text-white/40 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {active && (
                  <motion.div layoutId="settings-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <item.icon size={15}
                  className={`relative z-10 transition-colors ${active ? "text-amber-400" : "group-hover:text-amber-400/70"}`}
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
