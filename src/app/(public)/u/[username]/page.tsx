"use client"

import { use, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  UserPlus,
  UserCheck,
  Flame,
  Globe,
  Bookmark,
  Users,
  Award,
  Clock,
  Zap,
  Star,
  MessageSquare,
  Heart,
  ChevronRight,
  BookOpen,
  Trophy,
  Mail,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { BADGE_META, TIER_COLOR } from "@/lib/badges"
import { useUserProfile, useFollow } from "@/hooks/useUsers"
import { SupportCreator } from "@/components/social/SupportCreator"
import { VerifiedBadge } from "@/components/social/VerifiedBadge"
import { useUserList } from "@/hooks/useLists"
import { useActivityFeed } from "@/hooks/useActivityFeed"
import { useAuthStore } from "@/stores/auth.store"
import { usePresence } from "@/hooks/useRealtime"
import { PresenceDot } from "@/components/ui/PresenceDot"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000)     return "just now"
  if (diff < 3_600_000)  return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

// Inline label next to @username on profile pages — shows green-dot Active /
// grey dot Offline based on the user's real socket connection state.
function PresenceLabel({ userId }: { userId: string }) {
  const online = usePresence(userId)
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-subtle">
      <PresenceDot userId={userId} size={6} showOffline />
      {online ? "Active now" : "Offline"}
    </span>
  )
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type MockUser = {
  username: string
  displayName: string
  bio: string
  grade: string
  level: number
  avatar: string
  joined: string
  stats: {
    archived: number
    streak: number
    rank: number
    followers: number
  }
  dna: { label: string; percent: number; colors: string }[]
}

type ActivityEvent = {
  id: number
  type: "added" | "review" | "poll" | "milestone"
  text: string
  sub: string
  time: string
  icon: typeof Zap
}

/* Derive a "grade" + level from raw reputation rather than carrying any
   hardcoded user templates around. Mirrors the leaderboard logic. */
function gradeForLevel(level: number): string {
  if (level >= 30) return "Crimson Shinobi"
  if (level >= 20) return "Void Sentinel"
  if (level >= 12) return "Neural Oracle"
  if (level >= 7)  return "Elite Jonin"
  if (level >= 4)  return "Jonin"
  return "Iron Shinobi"
}
function levelFromRep(rep: number): number {
  // Same curve used elsewhere: level = floor(sqrt(rep * 100 / 1000))
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, rep) * 100 / 1000)))
}

/* Compute the user's anime-DNA from their actual watchlist genre frequencies. */
const DNA_GRADIENTS = [
  "from-indigo-600 via-blue-500 to-cyan-400",
  "from-emerald-600 via-teal-500 to-green-400",
  "from-red-600 via-orange-500 to-accent-bright",
  "from-purple-600 via-pink-500 to-rose-400",
  "from-pink-600 via-rose-500 to-fuchsia-400",
] as const

function dnaFromList(entries: Array<{ anime?: { genres?: Array<{ name?: string } | string> } | null }>): MockUser["dna"] {
  if (!entries.length) return []
  const tally = new Map<string, number>()
  for (const e of entries) {
    const gs = e.anime?.genres ?? []
    for (const g of gs) {
      const label = typeof g === "string" ? g : g?.name
      if (!label) continue
      tally.set(label, (tally.get(label) ?? 0) + 1)
    }
  }
  const total = Array.from(tally.values()).reduce((a, b) => a + b, 0) || 1
  return Array.from(tally.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([label, count], i) => ({
      label,
      percent: Math.round((count / total) * 100),
      colors:  DNA_GRADIENTS[i % DNA_GRADIENTS.length],
    }))
}

/* Map a backend Activity kind/verb to the icon + label this UI used to
   render statically. Keeps the visual language identical. */
function mapActivityToTimeline(a: {
  id: string; kind: string; body?: string | null; verb?: string | null
  linkedAnime?: { title?: string | null } | null; createdAt: string
}): ActivityEvent {
  const animeTitle = a.linkedAnime?.title ?? a.body ?? ""
  if (a.kind === "LIST_UPDATE") {
    const verb = a.verb ?? "UPDATED"
    if (verb === "RATED")     return { id: a.id as unknown as number, type: "review",    text: "Rated an Anime",      sub: animeTitle, time: timeAgo(a.createdAt), icon: Star }
    if (verb === "COMPLETED") return { id: a.id as unknown as number, type: "milestone", text: "Completed",           sub: animeTitle, time: timeAgo(a.createdAt), icon: Trophy }
    if (verb === "STARTED")   return { id: a.id as unknown as number, type: "added",     text: "Started Watching",    sub: animeTitle, time: timeAgo(a.createdAt), icon: Zap }
    return                     { id: a.id as unknown as number, type: "added",     text: "Added to Archive",    sub: animeTitle, time: timeAgo(a.createdAt), icon: Bookmark }
  }
  if (a.kind === "TEXT")   return { id: a.id as unknown as number, type: "review",    text: "Posted",             sub: (a.body ?? "").slice(0, 80), time: timeAgo(a.createdAt), icon: MessageSquare }
  if (a.kind === "REVIEW") return { id: a.id as unknown as number, type: "review",    text: "Posted a Review",    sub: animeTitle, time: timeAgo(a.createdAt), icon: Star }
  return                    { id: a.id as unknown as number, type: "added",     text: "Activity",           sub: (a.body ?? "").slice(0, 80), time: timeAgo(a.createdAt), icon: Zap }
}

// Everything on this page hydrates from the live API — no mock templates.

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function DNABar({
  label,
  percent,
  colors,
}: {
  label: string
  percent: number
  colors: string
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black uppercase tracking-widest text-muted">
          {label}
        </span>
        <span className="text-[10px] font-medium text-subtle tracking-tighter">
          {percent}%
        </span>
      </div>
      <div className="h-3 w-full bg-surface rounded-full overflow-hidden p-[3px] border border-border shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full bg-gradient-to-r ${colors} rounded-full relative`}
        >
          <div className="absolute inset-0 bg-white/15 animate-pulse mix-blend-overlay rounded-full" />
        </motion.div>
      </div>
    </div>
  )
}

/* Poster image with graceful fallback when the catalog has no cover. */
function CoverThumb({ src, title, sizes }: { src: string; title: string; sizes: string }) {
  if (!src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-violet-900/30 flex items-center justify-center">
        <BookOpen size={20} className="text-subtle" />
      </div>
    )
  }
  return (
    <Image
      src={src}
      alt={title}
      fill
      className="object-cover brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
      sizes={sizes}
    />
  )
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = use(params)
  const { push } = useToast()
  const currentUser = useAuthStore(s => s.user)

  const { data: profileData } = useUserProfile(username)
  const { data: listData }    = useUserList(username)
  const followMut             = useFollow(username)
  const realUser              = profileData?.user

  // User is derived 100% from the live API — no mock templates, no
  // hand-curated fallbacks. Anything missing renders as the empty value.
  const repField = realUser?.reputation ?? 0
  const level    = levelFromRep(repField)
  const dna      = dnaFromList(listData?.data ?? [])
  const user = {
    username,
    displayName: realUser?.displayName ?? username,
    bio:         realUser?.bio ?? "",
    grade:       gradeForLevel(level),
    level,
    avatar:      (realUser?.displayName ?? username).slice(0, 2).toUpperCase(),
    avatarUrl:   realUser?.avatarUrl ?? null,
    coverImage:  realUser?.coverImage ?? null,
    joined:      realUser?.createdAt
      ? new Date(realUser.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : "",
    stats: {
      archived:  profileData?.stats?.listCount ?? 0,
      streak:    realUser?.streakDays ?? 0,
      rank:      profileData?.stats?.rank ?? 0,
      followers: profileData?.stats?.followers ?? 0,
    },
    dna,
  } as MockUser & { avatarUrl: string | null; coverImage: string | null }

  const isOwnProfile = currentUser?.username === username
  // Follow state is hydrated from the API; local override applies after the
  // viewer toggles it in this session.
  const [followOverride, setFollowOverride] = useState<boolean | null>(null)
  const serverFollowing = realUser?.isFollowing ?? false
  const following = followOverride ?? serverFollowing

  // Real recent posts from the profile payload
  const recentPosts = profileData?.recentPosts ?? []

  // Real watchlist preview from API
  const watchlistAnime = (listData?.data ?? []).slice(0, 4).map(e => ({
    id: String(e.anime?.malId ?? e.animeId),
    title: e.anime?.title ?? "Unknown",
    image: e.anime?.imageUrl ?? "",
    rating: e.anime?.score ?? 0,
  }))

  // Real activity timeline for this profile — never fabricated entries.
  const { data: activityData } = useActivityFeed("profile", realUser?.id)
  const activityEvents: ActivityEvent[] = (activityData?.pages.flatMap(p => p.data) ?? [])
    .slice(0, 6)
    .map(mapActivityToTimeline)

  const toggleFollow = () => {
    if (!currentUser) { push("Sign in to follow users", "info"); return }
    const next = !following
    followMut.mutate(
      { follow: next },
      {
        onSuccess: () => {
          setFollowOverride(next)
          push(next ? `Following @${user.username}! 🎌` : `Unfollowed @${user.username}`, next ? "success" : "info")
        },
        onError: () => push("Failed to update follow", "error"),
      }
    )
  }

  const router = useRouter()
  const handleMessage = async () => {
    if (!currentUser) { push("Sign in to send messages", "info"); return }
    if (!realUser?.id) { push("User not found", "error"); return }
    try {
      const { conversation } = await import("@/lib/api/endpoints")
        .then(ep => ep.startConversation(realUser.id))
      router.push(`/chat/${conversation.id}`)
    } catch {
      push("Could not start conversation. Please try again.", "error")
    }
  }

  // Server count already includes the viewer's follow when isFollowing is
  // true — only adjust for a toggle made in this session.
  const displayedFollowers =
    user.stats.followers + (following && !serverFollowing ? 1 : 0) - (!following && serverFollowing ? 1 : 0)

  const stats = [
    {
      label: "Anime Archived",
      value: user.stats.archived.toLocaleString(),
      icon: Bookmark,
      color: "text-accent-bright",
      glow: "group-hover:bg-accent/10",
    },
    {
      label: "Day Streak",
      value: `${user.stats.streak}`,
      icon: Flame,
      color: "text-orange-400",
      glow: "group-hover:bg-orange-500/10",
    },
    {
      label: "Global Rank",
      value: user.stats.rank ? `#${user.stats.rank.toLocaleString()}` : "—",
      icon: Globe,
      color: "text-blue-400",
      glow: "group-hover:bg-blue-500/10",
    },
    {
      label: "Followers",
      value: displayedFollowers.toLocaleString(),
      icon: Users,
      color: "text-violet-400",
      glow: "group-hover:bg-violet-500/10",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Cover image (when set) + mesh gradient background */}
        <div className="absolute inset-0 z-0">
          {user.coverImage && (
            <Image
              src={user.coverImage}
              alt=""
              fill
              priority
              className="object-cover opacity-30"
              sizes="100vw"
            />
          )}
          <div className="absolute top-[-20%] right-[-10%] w-[55%] h-[120%] bg-accent/20 blur-[140px] rounded-full animate-pulse" />
          <div className="absolute top-[10%] left-[-15%] w-[45%] h-[90%] bg-violet-900/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[20%] w-[30%] h-[60%] bg-blue-800/10 blur-[100px] rounded-full animate-pulse [animation-delay:1.5s]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--app-bg)]/40 to-[var(--app-bg)]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">

            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative shrink-0"
            >
              <div className="h-40 w-40 md:h-52 md:w-52 rounded-[2.5rem] p-[3px] bg-gradient-to-br from-indigo-500 via-white/10 to-violet-600 shadow-2xl shadow-indigo-500/20">
                {user.avatarUrl ? (
                  <div className="relative h-full w-full rounded-[2.3rem] overflow-hidden border border-border">
                    <Image
                      src={user.avatarUrl}
                      alt={user.displayName}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 160px, 208px"
                    />
                  </div>
                ) : (
                  <div className="h-full w-full rounded-[2.3rem] bg-gradient-to-br from-indigo-600/30 to-violet-700/30 flex items-center justify-center backdrop-blur-sm border border-border">
                    <span className="text-5xl md:text-6xl font-black text-foreground tracking-tighter select-none">
                      {user.avatar}
                    </span>
                  </div>
                )}
              </div>
              {/* Level pip */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background border border-accent/40 text-[9px] font-black text-accent-bright uppercase tracking-widest whitespace-nowrap">
                Lvl {user.level}
              </div>
            </motion.div>

            {/* Identity */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="space-y-2"
              >
                {/* Grade badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-accent/30 text-[9px] font-black uppercase tracking-[0.2em] text-accent-bright">
                  <Award size={10} />
                  {user.grade}
                </div>

                <h1 className="flex items-center justify-center gap-3 text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-foreground leading-none md:justify-start">
                  {user.displayName}
                  <VerifiedBadge kind={realUser?.verifiedKind} size={36} />
                </h1>
                <p className="text-muted text-sm font-mono flex items-center gap-2">
                  @{user.username}
                  {realUser?.id && <PresenceLabel userId={realUser.id} />}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted text-base max-w-lg leading-relaxed"
              >
                {user.bio}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center md:justify-start gap-3 flex-wrap"
              >
                {!isOwnProfile && (
                <button
                  onClick={toggleFollow}
                  className={`flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                    following
                      ? "bg-surface border border-border text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                      : "bg-accent text-black hover:bg-accent-bright shadow-[0_0_32px_rgba(99,102,241,0.35)] hover:-translate-y-0.5"
                  }`}
                >
                  {following ? (
                    <><UserCheck size={15} /> Following</>
                  ) : (
                    <><UserPlus size={15} /> Follow</>
                  )}
                </button>
                )}

                {!isOwnProfile && <SupportCreator username={username} />}

                {!isOwnProfile && (
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-widest bg-surface border border-border text-muted hover:bg-surface hover:text-foreground transition-all duration-300"
                >
                  <Mail size={15} /> Message
                </button>
                )}

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-subtle uppercase tracking-widest">
                  <Clock size={11} />
                  Joined {user.joined}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAT CARDS ── */}
      <section className="max-w-6xl mx-auto px-6 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative overflow-hidden p-7 rounded-[2rem] border border-border bg-surface hover:bg-surface-2 transition-all duration-500 cursor-default`}
            >
              <div className={`mb-5 ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                <stat.icon size={26} strokeWidth={1.5} />
              </div>
              <p className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
              <p className="mt-2 text-[9px] font-black text-subtle uppercase tracking-[0.25em]">
                {stat.label}
              </p>
              <div className={`absolute -bottom-3 -right-3 w-20 h-20 bg-surface rounded-full blur-2xl ${stat.glow} transition-all`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WATCHLIST PREVIEW TAB ── */}
      <section className="max-w-6xl mx-auto px-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-7 rounded-[2rem] bg-surface border border-border space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-accent-bright" />
              <h2 className="text-lg font-black tracking-tighter uppercase italic text-foreground">
                Public Watchlist
              </h2>
            </div>
            <Link
              href={`/u/${user.username}/list`}
              className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent-bright hover:text-accent-bright transition-colors"
            >
              See full list <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {watchlistAnime.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <BookOpen size={22} className="mx-auto text-subtle" />
              <p className="text-sm font-bold text-muted">No titles archived yet</p>
              <p className="text-xs text-subtle">
                {isOwnProfile
                  ? "Start tracking anime and they'll show up here."
                  : `@${user.username} hasn't added anything to their archive yet.`}
              </p>
              {isOwnProfile && (
                <Link href="/bestanimelist" className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-black uppercase tracking-widest text-accent-bright">
                  Browse anime <ChevronRight size={11} />
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {watchlistAnime.map((anime, i) => (
                  <motion.div
                    key={anime.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link href={`/anime/${anime.id}`} className="group block">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border group-hover:border-accent/30 transition-all">
                        <CoverThumb src={anime.image} title={anime.title} sizes="(max-width: 768px) 25vw, 160px" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-[10px] font-black text-foreground leading-tight line-clamp-2">
                            {anime.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Link
                href={`/u/${user.username}/list`}
                className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border hover:border-accent/20 hover:bg-surface transition-all group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={15} className="text-accent-bright" />
                  <p className="text-sm font-bold text-muted group-hover:text-foreground transition-colors">
                    See full list →
                  </p>
                </div>
                <span className="text-[10px] font-black text-subtle uppercase tracking-widest">
                  {user.stats.archived} titles
                </span>
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 mt-16 grid lg:grid-cols-12 gap-12">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-7 space-y-14">

          {/* ── Chronicles ── */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                Chronicles
              </h2>
              <Link href={`/u/${username}/posts`} className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-subtle hover:text-foreground transition-colors">
                Full Log <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {activityEvents.length === 0 ? (
              <div className="p-8 rounded-[1.5rem] bg-surface border border-border text-center space-y-2">
                <Zap size={20} className="mx-auto text-subtle" />
                <p className="text-sm font-bold text-muted">No activity yet</p>
                <p className="text-xs text-subtle">
                  {isOwnProfile
                    ? "Rate, review or archive an anime to start your chronicle."
                    : `@${user.username} hasn't logged any activity yet.`}
                </p>
              </div>
            ) : (
            <div className="relative space-y-3">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-white/5 to-transparent" />

              {activityEvents.map((evt, i) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative pl-20 group"
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center z-10 group-hover:border-accent/40 transition-all shadow-lg">
                    <evt.icon size={20} className="text-accent-bright" />
                  </div>
                  <div className="p-5 rounded-[1.5rem] bg-surface border border-border group-hover:bg-white/[0.04] transition-all flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-foreground">{evt.text}</h3>
                      <p className="text-xs text-muted font-medium mt-0.5">{evt.sub}</p>
                    </div>
                    <span className="text-[9px] font-black text-subtle uppercase tracking-widest shrink-0 ml-4">
                      {evt.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </div>

          {/* ── Recent Posts ── */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              Recent Posts
            </h2>

            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <div className="p-8 rounded-2xl bg-surface-2 border border-border text-center space-y-2">
                  <MessageSquare size={20} className="mx-auto text-subtle" />
                  <p className="text-sm font-bold text-muted">No posts yet</p>
                  <p className="text-xs text-subtle">
                    {isOwnProfile
                      ? "Share your first take with the community."
                      : `@${user.username} hasn't posted anything yet.`}
                  </p>
                </div>
              ) : recentPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="p-6 rounded-2xl bg-surface-2 border border-border hover:border-border transition-colors space-y-4"
                >
                  {post.anime && (
                    <Link
                      href={`/anime/${post.anime.malId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/8 border border-accent/15 text-[10px] font-bold text-accent-bright hover:bg-accent/15 transition-colors"
                    >
                      <Star size={9} /> {post.anime.title}
                    </Link>
                  )}

                  <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  {post.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.imageUrl}
                      alt=""
                      loading="lazy"
                      className="max-h-72 w-auto rounded-xl border border-border object-cover"
                    />
                  )}

                  <div className="flex items-center gap-5 pt-2 border-t border-border">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-subtle">
                      <Heart size={13} />
                      {post._count?.likes ?? 0}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-subtle">
                      <MessageSquare size={13} />
                      {post._count?.comments ?? 0}
                    </span>
                    <span className="ml-auto text-[9px] font-black text-subtle uppercase tracking-widest">
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-10">

          {/* ── Anime DNA ── */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              Anime DNA
            </h2>

            <div className="p-8 rounded-[2.5rem] border border-border bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-3xl space-y-7 relative shadow-2xl">
              <div className="absolute top-6 right-8 opacity-[0.07]">
                <Award size={72} strokeWidth={1} />
              </div>

              {user.dna.length === 0 ? (
                <p className="text-xs text-subtle leading-relaxed py-2">
                  {isOwnProfile
                    ? "Archive a few anime and your genre DNA will appear here."
                    : "Not enough archived anime to compute a genre DNA yet."}
                </p>
              ) : user.dna.map((bar) => (
                <DNABar key={bar.label} label={bar.label} percent={bar.percent} colors={bar.colors} />
              ))}

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-subtle uppercase tracking-[0.2em]">Total Runtime</p>
                  <p className="text-2xl font-black text-foreground tracking-tighter">
                    {Math.round(user.stats.archived * 23.5).toLocaleString()}
                    <span className="text-xs font-medium text-subtle ml-1 italic">hrs</span>
                  </p>
                </div>
                <Clock size={36} className="text-accent opacity-20" strokeWidth={1} />
              </div>
            </div>
          </div>

          {/* ── Dojo Wall (earned badges — rare/first/completion feats only) ── */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              Dojo Wall
            </h2>
            {(profileData?.badges?.length ?? 0) === 0 ? (
              <div className="p-6 rounded-[2rem] border border-border bg-surface text-center space-y-1.5">
                <Award size={20} className="mx-auto text-subtle" strokeWidth={1.5} />
                <p className="text-sm font-bold text-muted">No badges yet</p>
                <p className="text-xs text-subtle leading-relaxed">
                  {isOwnProfile
                    ? "Badges mark rare feats — first steps, finished arcs, long streaks. They arrive when you least expect them."
                    : "Rare feats earn their place on the wall."}
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-[2rem] border border-border bg-surface grid grid-cols-2 gap-3">
                {(profileData?.badges ?? []).map(b => {
                  const meta = BADGE_META[b.code]
                  if (!meta) return null
                  return (
                    <div key={b.code} title={meta.desc}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-surface-2 border border-border">
                      <span className="text-xl leading-none">{meta.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-foreground leading-tight">{meta.name}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: TIER_COLOR[meta.tier] }}>
                          {meta.tier}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Watchlist Preview ── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                Watchlist
              </h2>
              <Link
                href="/bestanimelist"
                className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-subtle hover:text-foreground transition-colors"
              >
                Browse All <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {watchlistAnime.length === 0 ? (
              <div className="p-8 rounded-2xl bg-surface border border-border text-center space-y-2">
                <BookOpen size={20} className="mx-auto text-subtle" />
                <p className="text-sm font-bold text-muted">Nothing here yet</p>
                <p className="text-xs text-subtle">Archived anime will show up with their posters.</p>
              </div>
            ) : (
            <div className="grid grid-cols-2 gap-4">
              {watchlistAnime.map((anime, i) => (
                <motion.div
                  key={anime.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link href={`/anime/${anime.id}`} className="group block">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border group-hover:border-accent/30 transition-all">
                      <CoverThumb src={anime.image} title={anime.title} sizes="(max-width: 768px) 50vw, 200px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-xs font-black text-foreground leading-tight line-clamp-2">
                          {anime.title}
                        </p>
                        {anime.rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={9} fill="var(--app-accent)" className="text-accent-bright" />
                            <span className="text-[9px] text-muted font-bold">{anime.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            )}

            {/* Reading list CTA */}
            <Link
              href="/bestanimelist"
              className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-border hover:border-accent/20 hover:bg-surface transition-all group"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-accent-bright" />
                <div>
                  <p className="text-sm font-bold text-muted group-hover:text-foreground transition-colors">
                    Full Watchlist
                  </p>
                  <p className="text-[10px] text-subtle mt-0.5">
                    {user.stats.archived} titles archived
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-subtle group-hover:text-accent-bright group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
