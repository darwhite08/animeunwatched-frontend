"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { User, Bell, Palette, Shield, CreditCard, Link2, Lock, Settings } from "lucide-react"
import { motion } from "framer-motion"

export default function UserSettingsLayout({ children }: { children: React.ReactNode }) {
  const params   = useParams<{ slug: string }>()
  const pathname = usePathname()
  const slug     = params.slug

  const NAV = [
    { href: `/user/${slug}/settings/account`,       icon: User,       label: "Account"       },
    { href: `/user/${slug}/settings/notifications`, icon: Bell,       label: "Notifications" },
    { href: `/user/${slug}/settings/appearance`,    icon: Palette,    label: "Appearance"    },
    { href: `/user/${slug}/settings/privacy`,       icon: Shield,     label: "Privacy"       },
    { href: `/user/${slug}/settings/security`,      icon: Lock,       label: "Security"      },
    { href: `/user/${slug}/settings/billing`,       icon: CreditCard, label: "Billing"       },
    { href: `/user/${slug}/settings/connected`,     icon: Link2,      label: "Connected"     },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 pb-32">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Settings size={14} className="text-accent-bright" />
          <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em]"
            style={{ color: "rgba(245,158,11,0.6)" }}>
            user / {slug} / settings
          </p>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
          Settings<span style={{ color: "#f59e0b" }}>.</span>
        </h1>
        <div className="mt-6 h-px"
          style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.5), rgba(245,158,11,0.2) 40%, transparent)" }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="lg:w-52 flex lg:flex-col gap-1 shrink-0">
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active ? "text-foreground" : "text-muted hover:text-foreground hover:bg-surface"
                }`}
              >
                {active && (
                  <motion.div layoutId="user-settings-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <item.icon size={15} className={`relative z-10 ${active ? "text-accent-bright" : ""}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
