"use client"

import { use, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
  MessageSquare,
  Plus,
  ArrowLeft,
  Crown,
  Shield,
  CalendarDays,
  BookOpen,
  AlertTriangle,
  Trophy,
  Swords,
  CheckCircle2,
  Timer,
  X,
  Loader2,
  Trash2,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useClub, useJoinClub, useClubMembers, useDeleteClub } from "@/hooks/useClubs"
import { useClubThreads, useCreateClubThread } from "@/hooks/useThreads"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth.store"
import { ClubEventsTab } from "@/components/clubs/ClubEventsTab"
import { ClubLeaderboardTab } from "@/components/clubs/ClubLeaderboardTab"
import { ClubOnboarding } from "@/components/clubs/ClubOnboarding"
import { DenFeed } from "@/components/clubs/DenFeed"

/* ── Types ── */
type ClubTab = "threads" | "events" | "challenges" | "members" | "leaderboard" | "about"

interface ChallengeData {
  type: "WATCH_CHALLENGE"
  description: string
  animeTitle: string
  malId: number
  imageUrl: string
  deadline: string
  prize?: string
}

interface Challenge {
  id: string
  threadId: string
  animeTitle: string
  malId: number
  imageUrl: string
  description: string
  deadline: string
  prize?: string
  createdAt: string
  authorName: string
  replyCount: number
}

type MemberEntry = {
  id: string
  username: string
  avatar: string
  role: "USER" | "MOD" | "ADMIN"
}

const ROLE_STYLES: Record<MemberEntry["role"], string> = {
  ADMIN: "bg-accent/15 border-accent/30 text-accent-bright",
  MOD:   "bg-accent/15 border-accent/30 text-accent-bright",
  USER:  "bg-surface border-border text-muted",
}

const ROLE_ICONS: Record<MemberEntry["role"], typeof Crown> = {
  ADMIN: Crown,
  MOD:   Shield,
  USER:  Users,
}

function parseChallenge(thread: { id: string; title: string; content: string; author?: { displayName?: string; username?: string } | null; _count?: { replies: number } | null; createdAt: string }): Challenge | null {
  if (!thread.title.startsWith("[CHALLENGE]")) return null
  try {
    const data = JSON.parse(thread.content) as ChallengeData
    if (data.type !== "WATCH_CHALLENGE") return null
    return {
      id: thread.id,
      threadId: thread.id,
      animeTitle: data.animeTitle,
      malId: data.malId,
      imageUrl: data.imageUrl,
      description: data.description,
      deadline: data.deadline,
      prize: data.prize,
      createdAt: thread.createdAt,
      authorName: thread.author?.displayName ?? thread.author?.username ?? "Unknown",
      replyCount: thread._count?.replies ?? 0,
    }
  } catch {
    return null
  }
}

function CountdownBadge({ deadline }: { deadline: string }) {
  const now = Date.now()
  const end = new Date(deadline).getTime()
  const diff = end - now
  if (diff <= 0) return <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">Ended</span>
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const label = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`
  const urgent = diff < 3 * 86400000
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${urgent ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>
      <Timer size={8} /> {label}
    </span>
  )
}

function ChallengeCard({ challenge, onAccept, accepted }: { challenge: Challenge; onAccept: (c: Challenge) => void; accepted: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-[2rem] border border-border bg-surface hover:border-accent/20 transition-all duration-300"
    >
      <div className="flex gap-5 p-6">
        {/* Anime thumbnail */}
        <div className="shrink-0 w-20 h-28 rounded-xl overflow-hidden bg-surface border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" decoding="async"
            src={challenge.imageUrl}
            alt={challenge.animeTitle}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Swords size={11} className="text-accent-bright" />
                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-accent-bright/70">Watch Challenge</span>
              </div>
              <h3 className="text-base font-black uppercase italic tracking-tight text-foreground leading-snug group-hover:text-accent-bright transition-colors">
                {challenge.animeTitle}
              </h3>
            </div>
            <CountdownBadge deadline={challenge.deadline} />
          </div>

          <p className="text-xs text-muted leading-relaxed line-clamp-2">{challenge.description}</p>

          {challenge.prize && (
            <div className="flex items-center gap-1.5">
              <Trophy size={10} className="text-accent-bright" />
              <span className="text-[10px] font-bold text-accent-bright/80">{challenge.prize}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-3 text-[9px] text-subtle font-bold">
              <span className="flex items-center gap-1"><Users size={8} /> {challenge.replyCount} joined</span>
              <span>by @{challenge.authorName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/anime/${challenge.malId}`}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-[9px] font-black uppercase tracking-widest text-muted hover:text-foreground hover:border-border transition-all"
              >
                View Anime
              </Link>
              <button
                onClick={() => onAccept(challenge)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${accepted
                  ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 cursor-default"
                  : "text-black hover:scale-105"
                }`}
                style={!accepted ? { background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 2px 12px color-mix(in srgb, var(--app-accent) 30%, transparent)" } : undefined}
                disabled={accepted}
              >
                {accepted ? <><CheckCircle2 size={9} className="inline mr-1" />Accepted</> : "Accept Challenge"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CreateChallengeModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const { push } = useToast()
  const createThread = useCreateClubThread(slug)
  const [animeTitle, setAnimeTitle] = useState("")
  const [malId, setMalId] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [prize, setPrize] = useState("")

  const submit = () => {
    if (!animeTitle || !malId || !deadline) { push("Fill in all required fields", "error"); return }
    const content: ChallengeData = {
      type: "WATCH_CHALLENGE",
      animeTitle,
      malId: Number(malId),
      imageUrl: `https://cdn.myanimelist.net/images/anime/1/default.jpg`,
      description: description || `Watch ${animeTitle} with the den!`,
      deadline,
      prize: prize || undefined,
    }
    createThread.mutate(
      { title: `[CHALLENGE] ${animeTitle}`, content: JSON.stringify(content) },
      {
        onSuccess: () => { push("Challenge created!", "success"); onClose() },
        onError: () => push("Failed to create challenge", "error"),
      }
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-background border border-border rounded-[2rem] p-7 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords size={14} className="text-accent-bright" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Create Challenge</h2>
          </div>
          <button onClick={onClose} className="text-subtle hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: "Anime Title *", value: animeTitle, setter: setAnimeTitle, placeholder: "e.g. Fullmetal Alchemist: Brotherhood" },
            { label: "MAL ID *", value: malId, setter: setMalId, placeholder: "e.g. 5114 (from MyAnimeList URL)" },
            { label: "Prize (optional)", value: prize, setter: setPrize, placeholder: "e.g. Legendary badge + 500 XP" },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">{label}</label>
              <input
                type="text"
                value={value}
                onChange={e => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent/40 transition-all"
              />
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Deadline *</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
              style={{ colorScheme: "dark" }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's the challenge about? Any rules?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent/40 resize-none transition-all"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={createThread.isPending}
          className="w-full py-3 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 4px 20px color-mix(in srgb, var(--app-accent) 30%, transparent)" }}
        >
          {createThread.isPending ? "Creating…" : "Launch Challenge"}
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ── Page ── */
export default function ClubDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { push } = useToast()
  const router = useRouter()
  const authUser = useAuthStore(s => s.user)
  const { data: clubData, isLoading: clubLoading, isError: clubError } = useClub(slug)
  const { data: threadsData } = useClubThreads(slug)
  const { data: membersData } = useClubMembers(slug)
  const joinMut = useJoinClub(slug)
  const deleteMut = useDeleteClub(slug)

  const [acceptedChallenges, setAcceptedChallenges] = useState<Set<string>>(new Set())
  const [showCreateChallenge, setShowCreateChallenge] = useState(false)
  const [activeTab, setActiveTab] = useState<ClubTab>("threads")
  const [joined, setJoined] = useState(false)
  const [onboardDismissed, setOnboardDismissed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Real challenges parsed out of the thread list (a challenge is a thread whose
  // title is prefixed [CHALLENGE] with a JSON body). No mock fallback.
  const challenges = useMemo(
    () => (threadsData?.data ?? []).map(parseChallenge).filter((c): c is Challenge => c !== null),
    [threadsData]
  )

  const apiClub = clubData?.club

  // ── Loading ──
  if (clubLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-subtle" />
      </div>
    )
  }

  // ── Not found — this slug has no real club. Never fabricate one. ──
  if (clubError || !apiClub) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
        <div className="h-20 w-20 rounded-3xl bg-surface border border-border flex items-center justify-center mb-5">
          <Users size={28} className="text-subtle" />
        </div>
        <h1 className="text-2xl font-black uppercase italic tracking-tight text-foreground mb-2">Den not found</h1>
        <p className="text-sm text-muted max-w-sm mb-6">
          There&apos;s no club at <span className="font-bold text-foreground">/{slug}</span>. It may have been removed, or the link is out of date.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/clubs"
            className="flex items-center px-5 min-h-11 rounded-xl bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground hover:border-border active:scale-95 transition-all"
          >Browse Dens</Link>
          <Link
            href="/clubs/new"
            className="flex items-center px-5 min-h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-black active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
          >Create a Den</Link>
        </div>
      </div>
    )
  }

  // ── Real club — every value below comes from the API. ──
  const isMember = !!apiClub.isMember || joined
  const isAdmin = apiClub.myRole === "ADMIN"
  const isOwner = !!authUser && authUser.id === apiClub.ownerId
  const showOnboarding = !!apiClub.isMember && !!apiClub.needsOnboarding && !onboardDismissed

  const rules = (apiClub.rules ?? "").split("\n").map(r => r.trim()).filter(Boolean)
  const club = {
    slug: apiClub.slug,
    name: apiClub.name,
    description: apiClub.description?.trim() || "A community den for anime fans.",
    memberCount: apiClub._count?.members ?? 0,
    threadCount: apiClub._count?.threads ?? 0,
    category: apiClub.category?.trim() || "General",
    coverGradient: "from-indigo-900 via-indigo-950 to-black",
    rules,
    createdAt: apiClub.createdAt
      ? new Date(apiClub.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : "—",
    owner: apiClub.owner?.displayName ?? apiClub.owner?.username ?? "—",
    isJoined: isMember,
  }

  const apiMembers = membersData?.data ?? []
  const displayMembers: MemberEntry[] = apiMembers.map(m => ({
    id: m.userId,
    username: m.user.username,
    avatar: (m.user.displayName || m.user.username)[0]?.toUpperCase() ?? "?",
    role: m.role,
  }))

  const handleDelete = () => {
    deleteMut.mutate(undefined, {
      onSuccess: () => {
        push(`Deleted ${club.name}`, "success")
        router.push("/clubs")
      },
      onError: (e: Error) => push(e?.message || "Failed to delete den", "error"),
    })
  }

  const toggleJoin = () => {
    if (!authUser) { push("Sign in to join dens", "info"); return }
    const next = !isMember
    joinMut.mutate(
      { join: next },
      {
        onSuccess: () => { setJoined(next); push(next ? `Joined ${club.name}!` : `Left ${club.name}`, next ? "success" : "info") },
        onError: () => push("Failed to update membership", "error"),
      }
    )
  }

  const handleAcceptChallenge = async (challenge: Challenge) => {
    if (!authUser) { push("Sign in to accept challenges", "info"); return }
    if (acceptedChallenges.has(challenge.id)) return

    setAcceptedChallenges(prev => new Set(prev).add(challenge.id))
    push(`Challenge accepted! Watch ${challenge.animeTitle} by ${new Date(challenge.deadline).toLocaleDateString()}`, "success")

    try {
      await api(`/threads/${challenge.threadId}/replies`, {
        method: "POST",
        body: JSON.stringify({
          content: `ACCEPTED: I'm in for the ${challenge.animeTitle} watch challenge! Let's go!`,
        }),
      })
    } catch {
      /* soft failure — leave UI accepted */
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Hero banner */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${club.coverGradient}`}
        style={{ minHeight: "260px" }}
      >
        {apiClub.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={apiClub.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in srgb, var(--app-fg) 5%, transparent),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-[var(--app-bg)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-12 sm:pb-16">
          {/* Back */}
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 min-h-11 text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted active:scale-95 transition-all mb-6 sm:mb-8 group"
          >
            <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />All Dens</Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-3">
              {club.category}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-foreground leading-none mb-4">
              {club.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-6">
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
                <Users size={12} />
                {club.memberCount.toLocaleString()} member{club.memberCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
                <MessageSquare size={12} />
                {club.threadCount} thread{club.threadCount !== 1 ? "s" : ""}
              </span>
            </div>

            <button
              onClick={toggleJoin}
              disabled={joinMut.isPending}
              className={`px-8 min-h-11 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 ${
                club.isJoined
                  ? "bg-surface border border-border text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                  : "bg-accent hover:bg-accent-bright text-black shadow-[0_0_32px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
              }`}
            >
              {club.isJoined ? "Leave Den" : "Join Den"}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-[var(--sticky-top,72px)] z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {(["threads", "events", "challenges", "members", "leaderboard", "about"] as ClubTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative shrink-0 px-4 sm:px-5 py-4 text-[11px] font-black uppercase tracking-widest capitalize transition-colors active:scale-95 ${
                activeTab === tab ? "text-foreground" : "text-subtle hover:text-muted"
              }`}
            >
              {tab}
              {tab === "challenges" && challenges.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-[8px] font-black text-black" style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
                  {challenges.length}
                </span>
              )}
              {activeTab === tab && (
                <motion.div
                  layoutId="club-tab-line"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <AnimatePresence mode="wait">
          {/* ── Threads (Reddit/Twitter-style Den feed) ── */}
          {activeTab === "threads" && (
            <motion.div
              key="threads"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 lg:items-start"
            >
              {/* Feed */}
              <DenFeed slug={slug} denName={club.name} isMember={isMember} />

              {/* Reddit-style sidebar (desktop) */}
              <aside className="hidden lg:block lg:sticky lg:top-[var(--sticky-top,88px)] space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">About this Den</h2>
                  <p className="text-sm text-muted leading-relaxed">{club.description}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-xl bg-surface-2 px-3 py-2">
                      <p className="text-base font-black text-foreground">{club.memberCount.toLocaleString()}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-subtle">Members</p>
                    </div>
                    <div className="rounded-xl bg-surface-2 px-3 py-2">
                      <p className="text-base font-black text-foreground">{club.threadCount.toLocaleString()}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-subtle">Posts</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center justify-between"><span className="text-subtle">Created</span><span className="font-bold text-muted">{club.createdAt}</span></div>
                    <div className="flex items-center justify-between"><span className="text-subtle">Owner</span><span className="font-bold text-muted">@{club.owner}</span></div>
                    <div className="flex items-center justify-between"><span className="text-subtle">Category</span><span className="font-bold text-muted">{club.category}</span></div>
                  </div>
                </div>

                {club.rules.length > 0 && (
                  <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Den Rules</h2>
                    <ol className="space-y-2">
                      {club.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-muted">
                          <span className="shrink-0 h-4 w-4 rounded-full bg-accent/15 border border-accent/25 grid place-items-center text-[8px] font-black text-accent-bright">{i + 1}</span>
                          {rule}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </aside>
            </motion.div>
          )}

          {/* ── Challenges ── */}
          {activeTab === "challenges" && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle">
                    {challenges.length} active challenge{challenges.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-subtle mt-0.5">Complete challenges together, earn rewards as a club.</p>
                </div>
                {authUser && (
                  <button
                    onClick={() => setShowCreateChallenge(true)}
                    className="flex items-center gap-2 px-5 min-h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:-translate-y-0.5 active:scale-95"
                    style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 0 20px color-mix(in srgb, var(--app-accent) 25%, transparent)" }}
                  >
                    <Swords size={11} /> New Challenge
                  </button>
                )}
              </div>

              {challenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="h-20 w-20 rounded-3xl bg-surface border border-border flex items-center justify-center">
                    <Trophy size={28} className="text-subtle" />
                  </div>
                  <p className="text-sm font-black uppercase italic text-subtle">No active challenges</p>
                  <p className="text-xs text-subtle">Be the first to create a watch challenge for this club</p>
                  {authUser && (
                    <button
                      onClick={() => setShowCreateChallenge(true)}
                      className="mt-2 px-6 min-h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black active:scale-95 transition-transform"
                      style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}
                    >
                      Create First Challenge
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {challenges.map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onAccept={handleAcceptChallenge}
                      accepted={acceptedChallenges.has(challenge.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Members ── */}
          {activeTab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {displayMembers.length === 0 ? (
                <div className="py-16 text-center rounded-2xl bg-surface border border-border border-dashed">
                  <Users size={22} className="mx-auto text-subtle mb-2" />
                  <p className="text-sm font-bold text-muted">No members yet</p>
                  <p className="text-[11px] text-subtle mt-1">Be the first to join {club.name}.</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-6">
                    {club.memberCount.toLocaleString()} member{club.memberCount !== 1 ? "s" : ""} total — showing {displayMembers.length}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {displayMembers.map((member, i) => {
                      const RoleIcon = ROLE_ICONS[member.role]
                      return (
                        <motion.div key={member.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                          className="p-5 rounded-2xl bg-surface border border-border hover:border-border transition-all flex flex-col items-center gap-3 text-center group">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-xl text-foreground group-hover:scale-105 transition-transform">
                            {member.avatar}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-foreground">{member.username}</p>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${ROLE_STYLES[member.role]}`}>
                              <RoleIcon size={8} />{member.role}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── Events ── */}
          {activeTab === "events" && (
            <motion.div key="events" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              <ClubEventsTab slug={slug} isMember={isMember} isAdmin={isAdmin} />
            </motion.div>
          )}

          {/* ── Leaderboard ── */}
          {activeTab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="max-w-2xl">
              <ClubLeaderboardTab slug={slug} ownerId={apiClub.ownerId} />
            </motion.div>
          )}

          {/* ── About ── */}
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl space-y-8"
            >
              {/* Description */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-accent-bright" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                    About
                  </h2>
                </div>
                <p className="text-sm text-muted leading-relaxed">{club.description}</p>
              </div>

              {/* Rules — only if the club actually set any */}
              {club.rules.length > 0 && (
                <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-accent-bright" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Den Rules</h2>
                  </div>
                  <ol className="space-y-3">
                    {club.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted">
                        <span className="shrink-0 h-5 w-5 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-[9px] font-black text-accent-bright">
                          {i + 1}
                        </span>
                        {rule}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Meta */}
              <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} className="text-violet-400" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Den Info</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-subtle">Created</span>
                    <span className="font-bold text-muted">{club.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-subtle">Owner</span>
                    <span className="font-bold text-muted">@{club.owner}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-subtle">Category</span>
                    <span className="font-bold text-muted">{club.category}</span>
                  </div>
                </div>
              </div>

              {/* Danger zone — owner only */}
              {isOwner && (
                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                      Danger Zone
                    </h2>
                  </div>
                  {!confirmDelete ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted">
                        Permanently delete this den. Members and events are removed; threads are kept and detached.
                      </p>
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="shrink-0 inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl border border-red-500/30 bg-red-500/10 text-[11px] font-black uppercase tracking-widest text-red-300 transition-all hover:bg-red-500/20 active:scale-95"
                      >
                        <Trash2 size={13} /> Delete Den
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-red-200">
                        Delete <span className="italic">{club.name}</span>? This can&apos;t be undone.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={deleteMut.isPending}
                          className="inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl bg-red-500 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-red-600 active:scale-95 disabled:opacity-50"
                        >
                          {deleteMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          {deleteMut.isPending ? "Deleting…" : "Yes, delete"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          disabled={deleteMut.isPending}
                          className="min-h-11 px-4 rounded-xl bg-surface border border-border text-[11px] font-black uppercase tracking-widest text-muted transition-all hover:text-foreground active:scale-95 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCreateChallenge && (
          <CreateChallengeModal slug={slug} onClose={() => setShowCreateChallenge(false)} />
        )}
      </AnimatePresence>

      {showOnboarding && (
        <ClubOnboarding slug={slug} club={{ name: apiClub.name, rules: apiClub.rules, welcomeMessage: apiClub.welcomeMessage }} onDone={() => setOnboardDismissed(true)} />
      )}
    </div>
  )
}
