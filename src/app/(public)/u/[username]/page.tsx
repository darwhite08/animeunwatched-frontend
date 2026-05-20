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
import { useUserProfile, useFollow } from "@/hooks/useUsers"
import { useUserList } from "@/hooks/useLists"
import { useAuthStore } from "@/stores/auth.store"

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

type MockPost = {
  id: number
  content: string
  anime?: string
  likes: number
  comments: number
  time: string
}

/* ─────────────────────────────────────────────
   Mock data factory
───────────────────────────────────────────── */
const USER_TEMPLATES: Record<string, Partial<MockUser>> = {
  otaku_arch: {
    displayName: "Otaku Arch",
    bio: "Cataloging anime since 2009. Psychological and seinen enjoyer. Will recommend Monster to everyone I meet.",
    grade: "Crimson Shinobi",
    level: 38,
    stats: { archived: 312, streak: 47, rank: 228, followers: 1_840 },
    dna: [
      { label: "Psychological", percent: 91, colors: "from-purple-600 via-pink-500 to-rose-400" },
      { label: "Seinen",        percent: 78, colors: "from-indigo-600 via-blue-500 to-cyan-400" },
      { label: "Thriller",      percent: 62, colors: "from-red-600 via-orange-500 to-amber-400" },
      { label: "Fantasy",       percent: 34, colors: "from-emerald-600 via-teal-500 to-green-400" },
    ],
  },
  shadowwatcher: {
    displayName: "ShadowWatcher",
    bio: "MAPPA defender. Chainsaw Man is a religious experience. Hot takes are my love language.",
    grade: "Void Sentinel",
    level: 22,
    stats: { archived: 184, streak: 12, rank: 1_204, followers: 720 },
    dna: [
      { label: "Action",    percent: 88, colors: "from-red-600 via-orange-500 to-amber-400" },
      { label: "Shonen",    percent: 74, colors: "from-indigo-600 via-blue-500 to-cyan-400" },
      { label: "Horror",    percent: 55, colors: "from-purple-600 via-pink-500 to-rose-400" },
      { label: "Sci-Fi",    percent: 28, colors: "from-emerald-600 via-teal-500 to-green-400" },
    ],
  },
}

function buildMockUser(username: string): MockUser {
  const slug = username.toLowerCase().replace(/[^a-z0-9_]/g, "")
  const template = USER_TEMPLATES[slug] ?? {}
  const initials = username.slice(0, 2).toUpperCase()

  return {
    username,
    displayName: template.displayName ?? username,
    bio:
      template.bio ??
      "Anime archivist. Watcher of worlds. Building the ultimate watchlist one episode at a time.",
    grade: template.grade ?? "Iron Shinobi",
    level: template.level ?? 7,
    avatar: initials,
    joined: "March 2023",
    stats: template.stats ?? {
      archived: 64,
      streak: 8,
      rank: 4_200,
      followers: 210,
    },
    dna: template.dna ?? [
      { label: "Shonen",  percent: 72, colors: "from-indigo-600 via-blue-500 to-cyan-400" },
      { label: "Fantasy", percent: 55, colors: "from-emerald-600 via-teal-500 to-green-400" },
      { label: "Action",  percent: 48, colors: "from-red-600 via-orange-500 to-amber-400" },
      { label: "Romance", percent: 20, colors: "from-pink-600 via-rose-500 to-fuchsia-400" },
    ],
  }
}

const ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 1, type: "added",
    text: "Added to Archive",
    sub: "Frieren: Beyond Journey's End",
    time: "2h ago", icon: Bookmark,
  },
  {
    id: 2, type: "review",
    text: "Posted a Review",
    sub: "Attack on Titan • 10/10",
    time: "1d ago", icon: Star,
  },
  {
    id: 3, type: "poll",
    text: "Voted in a Poll",
    sub: "Greatest anime protagonist of all time",
    time: "2d ago", icon: Trophy,
  },
  {
    id: 4, type: "milestone",
    text: "Reached Milestone",
    sub: "50-episode streak unlocked",
    time: "4d ago", icon: Zap,
  },
]

const MOCK_POSTS: MockPost[] = [
  {
    id: 1,
    content:
      "Frieren's arc on mana concealment is the best exposition of a magic system I've ever seen. It recontextualizes everything.",
    anime: "Frieren: Beyond Journey's End",
    likes: 218,
    comments: 31,
    time: "3h ago",
  },
  {
    id: 2,
    content:
      "Finished Monster for the third time. Every rewatch reveals new layers. Johan Liebert remains unmatched as an anime villain. Not a take — a fact.",
    anime: "Monster",
    likes: 396,
    comments: 57,
    time: "2d ago",
  },
  {
    id: 3,
    content:
      "Unpopular opinion: HxH 2011 never got the ending it deserved and we should be angry about it every single day.",
    likes: 142,
    comments: 89,
    time: "5d ago",
  },
]

const WATCHLIST_PREVIEW_IDS = [
  "frieren",
  "attack-on-titan",
  "steins-gate",
  "hunter-x-hunter-2011",
]

// WATCHLIST_ANIME now comes from listData in the component

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
        <span className="text-xs font-black uppercase tracking-widest text-white/80">
          {label}
        </span>
        <span className="text-[10px] font-medium text-white/30 tracking-tighter">
          {percent}%
        </span>
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-[3px] border border-white/5 shadow-inner">
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

  // Try real API first, fall back to mock if not found
  const { data: profileData } = useUserProfile(username)
  const { data: listData } = useUserList(username)
  const followMut = useFollow(username)

  const realUser = profileData?.user
  const user = realUser
    ? {
        ...buildMockUser(username),
        username: realUser.username,
        displayName: realUser.displayName,
        bio: realUser.bio ?? buildMockUser(username).bio,
        stats: {
          ...buildMockUser(username).stats,
          archived: realUser.stats?.listCount ?? buildMockUser(username).stats.archived,
          followers: realUser.stats?.followers ?? buildMockUser(username).stats.followers,
        },
      }
    : buildMockUser(username)

  const isOwnProfile = currentUser?.username === username
  const [following, setFollowing] = useState(false)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  // Real watchlist preview from API
  const watchlistAnime = (listData?.data ?? []).slice(0, 4).map(e => ({
    id: String(e.anime?.malId ?? e.animeId),
    title: e.anime?.title ?? "Unknown",
    image: e.anime?.imageUrl ?? "",
    rating: e.anime?.score ?? 0,
  }))

  const toggleFollow = () => {
    if (!currentUser) { push("Sign in to follow users", "info"); return }
    const next = !following
    followMut.mutate(
      { follow: next },
      {
        onSuccess: () => {
          setFollowing(next)
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

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const displayedFollowers = user.stats.followers + (following ? 1 : 0)

  const stats = [
    {
      label: "Anime Archived",
      value: user.stats.archived.toLocaleString(),
      icon: Bookmark,
      color: "text-amber-400",
      glow: "group-hover:bg-indigo-500/10",
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
      value: `#${user.stats.rank.toLocaleString()}`,
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
    <div className="min-h-screen bg-[#020202] text-white pb-32">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[55%] h-[120%] bg-indigo-700/20 blur-[140px] rounded-full animate-pulse" />
          <div className="absolute top-[10%] left-[-15%] w-[45%] h-[90%] bg-violet-900/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[20%] w-[30%] h-[60%] bg-blue-800/10 blur-[100px] rounded-full animate-pulse [animation-delay:1.5s]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020202]/40 to-[#020202]" />
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
                <div className="h-full w-full rounded-[2.3rem] bg-gradient-to-br from-indigo-600/30 to-violet-700/30 flex items-center justify-center backdrop-blur-sm border border-white/5">
                  <span className="text-5xl md:text-6xl font-black text-white tracking-tighter select-none">
                    {user.avatar}
                  </span>
                </div>
              </div>
              {/* Level pip */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black border border-indigo-500/40 text-[9px] font-black text-amber-400 uppercase tracking-widest whitespace-nowrap">
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">
                  <Award size={10} />
                  {user.grade}
                </div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">
                  {user.displayName}
                </h1>
                <p className="text-white/40 text-sm font-mono">@{user.username}</p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/55 text-base max-w-lg leading-relaxed"
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
                      ? "bg-white/8 border border-white/15 text-white/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                      : "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_32px_rgba(99,102,241,0.35)] hover:-translate-y-0.5"
                  }`}
                >
                  {following ? (
                    <><UserCheck size={15} /> Following</>
                  ) : (
                    <><UserPlus size={15} /> Follow</>
                  )}
                </button>
                )}

                {!isOwnProfile && (
                <button
                  onClick={handleMessage}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-widest bg-white/8 border border-white/15 text-white/70 hover:bg-white/12 hover:text-white transition-all duration-300"
                >
                  <Mail size={15} /> Message
                </button>
                )}

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
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
              className={`group relative overflow-hidden p-7 rounded-[2rem] border border-white/5 bg-[#0a0a0a] hover:bg-zinc-900/50 transition-all duration-500 cursor-default`}
            >
              <div className={`mb-5 ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                <stat.icon size={26} strokeWidth={1.5} />
              </div>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              <p className="mt-2 text-[9px] font-black text-white/30 uppercase tracking-[0.25em]">
                {stat.label}
              </p>
              <div className={`absolute -bottom-3 -right-3 w-20 h-20 bg-white/5 rounded-full blur-2xl ${stat.glow} transition-all`} />
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
          className="p-7 rounded-[2rem] bg-white/[0.02] border border-white/8 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-amber-400" />
              <h2 className="text-lg font-black tracking-tighter uppercase italic text-white">
                Public Watchlist
              </h2>
            </div>
            <Link
              href={`/u/${user.username}/list`}
              className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
            >
              See full list <ChevronRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {watchlistAnime.map((anime, i) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={`/anime/${anime.id}`} className="group block">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/8 group-hover:border-indigo-500/30 transition-all">
                    <Image
                      src={anime.image}
                      alt={anime.title}
                      fill
                      className="object-cover brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                      sizes="(max-width: 768px) 25vw, 160px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-[10px] font-black text-white leading-tight line-clamp-2">
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
            className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/8 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={15} className="text-amber-400" />
              <p className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                See full list →
              </p>
            </div>
            <span className="text-[10px] font-black text-white/25 uppercase tracking-widest">
              {user.stats.archived} titles
            </span>
          </Link>
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
              <button className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                Full Log <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="relative space-y-3">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-white/5 to-transparent" />

              {ACTIVITY_EVENTS.map((evt, i) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative pl-20 group"
                >
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center z-10 group-hover:border-indigo-500/40 transition-all shadow-lg">
                    <evt.icon size={20} className="text-amber-400" />
                  </div>
                  <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-all flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black text-white/90">{evt.text}</h3>
                      <p className="text-xs text-white/40 font-medium mt-0.5">{evt.sub}</p>
                    </div>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest shrink-0 ml-4">
                      {evt.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Recent Posts ── */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              Recent Posts
            </h2>

            <div className="space-y-4">
              {MOCK_POSTS.map((post, i) => {
                const liked = likedPosts.has(post.id)
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="p-6 rounded-2xl bg-zinc-900/60 border border-white/8 hover:border-white/15 transition-colors space-y-4"
                  >
                    {post.anime && (
                      <Link
                        href="/bestanimelist"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/8 border border-indigo-500/15 text-[10px] font-bold text-amber-400 hover:bg-indigo-500/15 transition-colors"
                      >
                        <Star size={9} /> {post.anime}
                      </Link>
                    )}

                    <p className="text-sm text-white/75 leading-relaxed">{post.content}</p>

                    <div className="flex items-center gap-5 pt-2 border-t border-white/5">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                          liked ? "text-rose-400" : "text-white/30 hover:text-rose-400"
                        }`}
                      >
                        <Heart size={13} fill={liked ? "currentColor" : "none"} />
                        {liked ? post.likes + 1 : post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-amber-400 transition-colors">
                        <MessageSquare size={13} />
                        {post.comments}
                      </button>
                      <span className="ml-auto text-[9px] font-black text-white/20 uppercase tracking-widest">
                        {post.time}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
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

            <div className="p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-zinc-900/80 to-black backdrop-blur-3xl space-y-7 relative shadow-2xl">
              <div className="absolute top-6 right-8 opacity-[0.07]">
                <Award size={72} strokeWidth={1} />
              </div>

              {user.dna.map((bar) => (
                <DNABar key={bar.label} label={bar.label} percent={bar.percent} colors={bar.colors} />
              ))}

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em]">Total Runtime</p>
                  <p className="text-2xl font-black text-white tracking-tighter">
                    {Math.round(user.stats.archived * 23.5).toLocaleString()}
                    <span className="text-xs font-medium text-white/35 ml-1 italic">hrs</span>
                  </p>
                </div>
                <Clock size={36} className="text-amber-500 opacity-20" strokeWidth={1} />
              </div>
            </div>
          </div>

          {/* ── Watchlist Preview ── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                Watchlist
              </h2>
              <Link
                href="/bestanimelist"
                className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
              >
                Browse All <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

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
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/8 group-hover:border-indigo-500/30 transition-all">
                      <Image
                        src={anime.image}
                        alt={anime.title}
                        fill
                        className="object-cover brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-xs font-black text-white leading-tight line-clamp-2">
                          {anime.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={9} fill="#f59e0b" className="text-amber-400" />
                          <span className="text-[9px] text-white/60 font-bold">{anime.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Reading list CTA */}
            <Link
              href="/bestanimelist"
              className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-amber-400" />
                <div>
                  <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                    Full Watchlist
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {user.stats.archived} titles archived
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-white/20 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
