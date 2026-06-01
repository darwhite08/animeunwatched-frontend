"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Github, Twitter, Zap, ShieldCheck, ArrowUpRight,
  BookOpen, Users, Sparkles, Trophy, Vote, PenSquare, BarChart3,
} from "lucide-react"

const NAV_COLS = [
  {
    title: "Platform",
    links: [
      { label: "Home",          href: "/" },
      { label: "AI Discover",   href: "/ai-discover" },
      { label: "Best Anime",    href: "/bestanimelist" },
      { label: "Community",     href: "/community" },
      { label: "Leaderboard",   href: "/leaderboard" },
      { label: "Polls",         href: "/poll" },
    ],
  },
  {
    title: "My Space",
    links: [
      { label: "Dashboard",     href: "/dashboard" },
      { label: "Watchlist",     href: "/watchlist" },
      { label: "Library",       href: "/readlist" },
      { label: "Streak Hub",    href: "/streak" },
      { label: "Profile",       href: "/profile" },
      { label: "Settings",      href: "/settings" },
    ],
  },
  {
    title: "Creator Studio",
    links: [
      { label: "Studio Hub",    href: "/creators" },
      { label: "Write a Blog",  href: "/creators/create/blog" },
      { label: "Create a Poll", href: "/creators/create/polls" },
      { label: "Feed Post",     href: "/creators/create/feed" },
      { label: "Analytics",     href: "/creators/analytics" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pricing",       href: "/pricing" },
      { label: "About",         href: "/about" },
      { label: "Changelog",     href: "/changelog" },
      { label: "Roadmap",       href: "/roadmap" },
      { label: "Help Center",   href: "/help" },
      { label: "Contact",       href: "/contact" },
      { label: "Privacy",       href: "/privacy" },
      { label: "Terms",         href: "/terms" },
    ],
  },
]

const STATS = [
  { value: "12.4k",  label: "Active Shinobi" },
  { value: "1.2M+",  label: "Archives Logged" },
  { value: "30,161", label: "Anime in Index"  },
  { value: "98.4%",  label: "Oracle Accuracy" },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-border bg-surface overflow-hidden">
      {/* Background glows */}
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] blur-[100px] rounded-full pointer-events-none"
        style={{ background: "color-mix(in srgb, var(--app-accent) 5%, transparent)" }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[250px] blur-[120px] rounded-full pointer-events-none"
        style={{ background: "rgba(99,102,241,0.05)" }} />

      {/* Stats strip */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-xl md:text-2xl font-black tracking-tighter"
                style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {value}
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 lg:gap-12">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-2 space-y-6 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="36" height="36" className="group-hover:scale-110 transition-transform flex-shrink-0">
                <rect width="100" height="100" rx="18" fill="var(--app-bg)"/>
                <path d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z" fill="#F4F2EC"/>
              </svg>
              <span className="text-lg font-black tracking-tight text-foreground uppercase italic">
                KAIVERON<span style={{color:"var(--app-accent)"}}>.</span>
              </span>
            </Link>

            <p className="text-sm text-subtle leading-relaxed max-w-xs">
              The neural anime tracking platform built for true enthusiasts. Track, rate, and discover anime that deserves more hype.
            </p>

            <div className="flex items-center gap-3">
              {[
                { Icon: Github,  href: "https://github.com/kaiveron", label: "GitHub"  },
                { Icon: Twitter, href: "https://twitter.com",           label: "Twitter" },
              ].map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2, scale: 1.05 }}
                  className="p-2.5 rounded-xl border border-border bg-surface text-subtle hover:text-foreground hover:border-accent/30 transition-all"
                  title={label}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>

            {/* System status */}
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-subtle">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck size={11} className="text-emerald-500/50" />
              All systems operational • v4.0.0
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map(col => (
            <div key={col.title}>
              <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-subtle mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted hover:text-foreground transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-black text-subtle uppercase tracking-widest">
            © {year} Kaiveron • Neural Archive Protocol
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: "Privacy Policy",  href: "/privacy" },
              { label: "Terms of Service", href: "/terms"  },
              { label: "Help Center",     href: "/help"    },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[9px] font-bold text-subtle uppercase tracking-wider hover:text-accent-bright transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
