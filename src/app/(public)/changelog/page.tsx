"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Cpu, Zap } from "lucide-react"

/* ── Types ── */
type Release = {
  version: string
  date: string
  tag: "Major" | "Minor"
  title: string
  features: string[]
}

/* ── Releases ── */
const RELEASES: Release[] = [
  {
    version: "v4.5.0",
    date: "2026-05-21",
    tag: "Major",
    title: "Research-Driven Features: Viral Loops + Retention Engine",
    features: [
      "Den Watch Challenges: watch anime together with countdown timers and acceptance flow",
      "Shareable profile cards at /share/[username] with stats, top picks, and anime DNA",
      "Referral system: invite friends and earn +100 rep when they join",
      "Airing Today dashboard card showing what's airing today and tomorrow",
      "Streak 'At Risk' indicator when user hasn't logged activity today",
      "Floating feedback button (bug/suggestion/love) available on all pages",
      "500+ SEO-indexed anime pages via sitemap.ts with rich Open Graph metadata",
      "Anime detail pages show real social proof: X watching, Y completed, Z planning",
      "Weekly digest + streak reminder cron endpoints for email re-engagement",
      "Password change with automatic session invalidation (OWASP security)",
      "Milestone achievement notifications: 1, 10, 25, 50, 100, 250, 500 anime completed",
      "Streak updates on list activity and post creation (not just login)",
      "Genre filter bug fix in anime browse endpoint",
      "Loading skeletons for anime detail, dens, user profile, and calendar pages",
    ],
  },
  {
    version: "v4.3.0",
    date: "2026-05-14",
    tag: "Major",
    title: "Security + Spoiler Tags + MAL Import + Community Features",
    features: [
      "MAL/AniList XML import with client-side parser and batch progress bar",
      "Spoiler tags in community posts with blur-until-click rendering",
      "Mood Picker: 9 vibes → real anime recommendations from API",
      "Friends Activity Card showing what followed users are watching",
      "GDPR Cookie Consent banner (non-blocking, localStorage persistence)",
      "Real streak tracking: DB-backed streakDays, lastActiveAt, bestStreak",
      "REWATCHING status added (most-requested missing status)",
      "Episode discussion threads at /anime/:id/discuss",
      "Pricing page with transparent Free vs Pro comparison",
      "Brute-force lockout: 5 failures → 15min lockout per email",
      "Stack trace guard in production (OWASP A10)",
      "Rate limit Retry-After header with user-friendly messages",
    ],
  },
  {
    version: "v4.2.0",
    date: "2026-05-10",
    tag: "Major",
    title: "Cinematic Homepage + Gamification System",
    features: [
      "Cinematic hero section with ambient video background and particle overlay",
      "XP + level system: earn points for watching, rating, reviewing, and streaking",
      "Shinobi rank titles (levels 1–100) with public leaderboard integration",
      "About page, Changelog page, and expanded dashboard card suite",
      "TopAnimeCard and RecentlyReviewedCard added to dashboard grid",
      "Framer Motion page transitions across all public routes",
      "Performance budget enforced: first-load JS gzip < 200kB",
    ],
  },
  {
    version: "v4.1.0",
    date: "2026-05-03",
    tag: "Major",
    title: "Creator Studio + Blog System",
    features: [
      "Full Creator Studio dashboard with level card and publish queue",
      "Rich blog editor with Markdown preview and DOMPurify sanitisation",
      "Creator-specific XP tier and public reader profile",
      "Blog feed with cover images, read-time estimation, and like system",
      "Poll creation tool — single-choice, multi-choice, and ranked-choice modes",
      "Creator leaderboard with follower and engagement metrics",
    ],
  },
  {
    version: "v4.0.0",
    date: "2026-04-26",
    tag: "Major",
    title: "AI Oracle Neural Engine",
    features: [
      "AI Oracle: natural language anime discovery via Neural Engine",
      "Taste-profile builder capturing 12 mood/genre/era dimensions on onboarding",
      "AI result cards with match %, mood tags, and instant-add to watchlist",
      "\"Why this?\" explainer panel per recommendation",
      "AI Discover route (/ai-discover) with streaming SSE response rendering",
      "Oracle integrates with existing catalog — no external API calls exposed to client",
    ],
  },
  {
    version: "v3.5.0",
    date: "2026-04-10",
    tag: "Minor",
    title: "Community Features + Dens",
    features: [
      "Community feed with Trending / Following / Latest tabs",
      "Post composer with @mention, #hashtag, and image attachment toolbar",
      "Dens: create, join, leave, set member roles",
      "Den thread system with nested reply tree and spoiler tags",
      "Active polls widget in community sidebar",
      "Real-time like and comment counts via Socket.io",
      "ShareCard modal for posts and reviews with copy-link and native share",
    ],
  },
  {
    version: "v3.0.0",
    date: "2026-03-10",
    tag: "Major",
    title: "Full Backend Launch",
    features: [
      "Express + Prisma backend live on Vercel serverless",
      "JWT auth with httpOnly refresh cookie and single-flight token rotation",
      "PostgreSQL catalog mirrored from Jikan API (swappable via CATALOG_PROVIDER env)",
      "Socket.io real-time server for notifications and live feed updates",
      "REST API contract: 60+ endpoints across auth, users, anime, lists, posts, clubs, reviews, blogs",
      "Sentry error tracking and structured logging integrated",
    ],
  },
]

/* ── Helpers ── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/* ── Page ── */
export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* Header */}
      <div className="border-b border-border bg-black/30 backdrop-blur-md sticky top-[var(--sticky-top,72px)] z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center gap-3">
          <Cpu size={16} className="text-accent-bright" />
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-foreground">
              Changelog<span className="text-accent"> — Neural Archive</span>
            </h1>
            <p className="text-[10px] text-subtle mt-0.5">Every release. Every feature. Full transparency.</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-surface" />

          <div className="space-y-12">
            {RELEASES.map((release, i) => (
              <motion.div
                key={release.version}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="relative pl-9"
              >
                {/* Timeline dot */}
                <div className={`absolute left-0 top-1.5 h-[22px] w-[22px] rounded-full border-2 flex items-center justify-center ${
                  i === 0
                    ? "border-accent bg-accent/30"
                    : "border-border bg-background"
                }`}>
                  <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-accent-bright" : "bg-white/20"}`} />
                </div>

                {/* Card */}
                <div className={`rounded-[1.75rem] border p-7 space-y-5 ${
                  i === 0
                    ? "border-accent/25 bg-accent/5"
                    : "border-border bg-surface"
                }`}>
                  {/* Top row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-lg bg-accent/15 border border-accent/25 text-xs font-black text-accent-bright font-mono tracking-wider">
                      {release.version}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      release.tag === "Major"
                        ? "bg-violet-600/10 border border-violet-500/20 text-violet-400"
                        : "bg-surface border border-border text-muted"
                    }`}>
                      {release.tag}
                    </span>
                    <span className="ml-auto text-[10px] text-subtle font-mono">
                      {formatDate(release.date)}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-foreground leading-snug">
                      {release.title}
                    </h2>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-2.5">
                    {release.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3">
                        <CheckCircle2 size={13} className="text-accent-bright shrink-0 mt-0.5" />
                        <span className="text-sm text-muted leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex items-center gap-2 text-[10px] text-subtle font-mono"
        >
          <Zap size={10} className="text-accent/50" />
          Changelog auto-archives every production deploy. All times UTC.
        </motion.div>
      </div>
    </div>
  )
}
