"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Map } from "lucide-react"

/* ─── Site sections ─── */
interface SiteLink {
  label: string
  href: string
}

interface SiteSection {
  title: string
  color: string
  border: string
  links: SiteLink[]
}

const SECTIONS: SiteSection[] = [
  {
    title: "Discovery",
    color: "text-accent-bright",
    border: "border-accent/20",
    links: [
      { label: "Home",          href: "/" },
      { label: "Browse",        href: "/discover" },
      { label: "Best Anime",    href: "/bestanimelist" },
      { label: "AI Discover",   href: "/ai-discover" },
      { label: "Trending",      href: "/trending" },
      { label: "Collections",   href: "/collections" },
      { label: "Calendar",      href: "/calendar" },
      { label: "Seasonal",      href: "/seasonal" },
      { label: "New Releases",  href: "/discover?filter=new" },
      { label: "Popular",       href: "/discover?filter=popular" },
    ],
  },
  {
    title: "Community",
    color: "text-violet-400",
    border: "border-violet-500/20",
    links: [
      { label: "Community",    href: "/community" },
      { label: "Clubs",        href: "/clubs" },
      { label: "Polls",        href: "/poll" },
      { label: "Chronicle",    href: "/blog" },
      { label: "Reviews",      href: "/reviews" },
      { label: "Leaderboard",  href: "/leaderboard" },
      { label: "Users",        href: "/users" },
      { label: "Watch Party",  href: "/watch-party" },
    ],
  },
  {
    title: "My Space",
    color: "text-fuchsia-400",
    border: "border-fuchsia-500/20",
    links: [
      { label: "Dashboard",    href: "/dashboard" },
      { label: "Watchlist",    href: "/watchlist" },
      { label: "Library",      href: "/readlist" },
      { label: "Streak",       href: "/streak" },
      { label: "Achievements", href: "/achievements" },
      { label: "Watch Stats",  href: "/stats" },
      { label: "Following",    href: "/following" },
      { label: "Manga",        href: "/manga" },
    ],
  },
  {
    title: "Platform",
    color: "text-cyan-400",
    border: "border-cyan-500/20",
    links: [
      { label: "About",       href: "/about" },
      { label: "Changelog",   href: "/changelog" },
      { label: "Roadmap",     href: "/roadmap" },
      { label: "Help",        href: "/help" },
      { label: "Contact",     href: "/contact" },
      { label: "Privacy",     href: "/privacy" },
      { label: "Terms",       href: "/terms" },
      { label: "API Docs",    href: "/api" },
      { label: "Stats",       href: "/stats" },
    ],
  },
]

/* ─── Page ─── */
export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* ── Header ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-accent/6 blur-[130px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <Map size={18} className="text-accent-bright" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-bright/70">
              Navigation
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.92] text-foreground mb-5"
          >
            Site<span className="text-accent-bright"> Map</span><span className="text-foreground">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted text-base max-w-xl leading-relaxed"
          >
            Every page on Kaiveron, organized by section. Find what you need — fast.
          </motion.p>
        </div>
      </section>

      {/* ── Sitemap grid ── */}
      <section className="max-w-5xl mx-auto px-6 pt-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SECTIONS.map((section, si) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.07 }}
              className={`rounded-3xl border ${section.border} bg-surface p-7`}
            >
              {/* Section heading */}
              <h2 className={`text-[10px] font-black uppercase tracking-[0.35em] ${section.color} mb-5`}>
                {section.title}
              </h2>

              {/* Links */}
              <ul className="space-y-1">
                {section.links.map((link, li) => (
                  <motion.li
                    key={link.href + link.label}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: si * 0.07 + li * 0.03 }}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 py-1.5 text-sm text-muted hover:text-foreground transition-colors duration-150"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-accent-bright">
                        →
                      </span>
                      <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                        {link.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer note ── */}
      <div className="max-w-5xl mx-auto px-6 pt-14">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[10px] text-subtle font-mono text-center"
        >
          {SECTIONS.reduce((acc, s) => acc + s.links.length, 0)} pages · updated with every release
        </motion.p>
      </div>

    </div>
  )
}
