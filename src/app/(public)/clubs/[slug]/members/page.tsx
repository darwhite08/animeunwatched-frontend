"use client"

import { use, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Users,
  Crown,
  Shield,
  Search,
  ArrowLeft,
  ChevronRight,
  UserPlus,
  Star,
  Tv2,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"

/* ── Types ── */
type Role = "ADMIN" | "MOD" | "USER"

type Member = {
  id: string
  username: string
  displayName: string
  role: Role
  joinDate: string
  reputation: number
  animeCount: number
  avatarGradient: string
  isFollowed: boolean
}

/* ── Mock factory ── */
const CLUB_NAME_MAP: Record<string, string> = {
  "attack-on-titan-discussion": "Attack on Titan Discussion",
  "shonen-power-rankings": "Shonen Power Rankings",
  "hidden-gems-vault": "Hidden Gems Vault",
  "studio-mappa-fan-club": "Studio MAPPA Fan Club",
  "psychological-anime-society": "Psychological Anime Society",
  "slice-of-life-appreciation": "Slice of Life Appreciation",
}

function slugToName(slug: string): string {
  return (
    CLUB_NAME_MAP[slug] ??
    slug
      .split("-")
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ")
  )
}

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-accent to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
  "from-purple-500 to-fuchsia-600",
  "from-red-500 to-rose-600",
  "from-cyan-500 to-sky-600",
]

function buildMembers(slug: string): Member[] {
  const seed = slug.length

  const base: Omit<Member, "id" | "avatarGradient" | "isFollowed">[] = [
    { username: "TitanSlayer_X",   displayName: "Titan Slayer",   role: "ADMIN", joinDate: "Jan 2024", reputation: 2840, animeCount: 342 },
    { username: "Otaku_Arch",       displayName: "Archie Otaku",   role: "MOD",   joinDate: "Feb 2024", reputation: 1420, animeCount: 218 },
    { username: "ShadowWatcher",    displayName: "Shadow W.",      role: "MOD",   joinDate: "Mar 2024", reputation: 980,  animeCount: 175 },
    { username: "NeuralBot_X",      displayName: "Neural Bot",     role: "USER",  joinDate: "Apr 2024", reputation: 540,  animeCount: 98  },
    { username: "VoidSeeker",       displayName: "Void Seeker",    role: "USER",  joinDate: "Apr 2024", reputation: 320,  animeCount: 67  },
    { username: "Cipher_Ronin",     displayName: "Cipher Ronin",   role: "USER",  joinDate: "May 2024", reputation: 210,  animeCount: 54  },
    { username: "FrameRate_Fan",    displayName: "Frame Fan",      role: "USER",  joinDate: "May 2024", reputation: 180,  animeCount: 43  },
    { username: "LoreKeeper_99",    displayName: "Lore Keeper",    role: "USER",  joinDate: "Jun 2024", reputation: 150,  animeCount: 38  },
    { username: "SakuraDrift",      displayName: "Sakura Drift",   role: "USER",  joinDate: "Jun 2024", reputation: 120,  animeCount: 31  },
    { username: "MangaPhilosopher", displayName: "Manga Phil",     role: "USER",  joinDate: "Jul 2024", reputation: 95,   animeCount: 26  },
    { username: "AnimeLegend_7",    displayName: "Anime Legend",   role: "USER",  joinDate: "Jul 2024", reputation: 80,   animeCount: 22  },
    { username: "DarkHero_Z",       displayName: "Dark Hero",      role: "USER",  joinDate: "Aug 2024", reputation: 60,   animeCount: 18  },
  ]

  return base.map((m, i) => ({
    ...m,
    id: `${slug}-m${i + 1}`,
    avatarGradient: AVATAR_GRADIENTS[(i + seed) % AVATAR_GRADIENTS.length],
    isFollowed: i === 3 || i === 5,
  }))
}

/* ── Styles ── */
const ROLE_STYLES: Record<Role, string> = {
  ADMIN: "bg-accent/15 border-accent/30 text-accent-bright",
  MOD:   "bg-accent/15 border-accent/30 text-accent-bright",
  USER:  "bg-surface border-border text-muted",
}

const ROLE_ICONS: Record<Role, typeof Crown> = {
  ADMIN: Crown,
  MOD:   Shield,
  USER:  Users,
}

/* ── MemberCard ── */
function MemberCard({
  member,
  index,
  onFollow,
}: {
  member: Member
  index: number
  onFollow: (id: string) => void
}) {
  const RoleIcon = ROLE_ICONS[member.role]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group p-5 rounded-2xl bg-surface border border-border hover:border-border hover:bg-surface transition-all duration-300 flex flex-col items-center gap-4 text-center"
    >
      {/* Avatar */}
      <div
        className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${member.avatarGradient} flex items-center justify-center font-black text-2xl text-foreground group-hover:scale-105 transition-transform duration-300 shadow-lg`}
      >
        {member.username[0].toUpperCase()}
      </div>

      {/* Identity */}
      <div className="space-y-1.5 w-full">
        <p className="text-sm font-black text-foreground uppercase italic tracking-tighter leading-none">
          {member.displayName}
        </p>
        <p className="text-[10px] text-subtle font-mono">@{member.username}</p>

        {/* Role badge */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${ROLE_STYLES[member.role]}`}
        >
          <RoleIcon size={8} />
          {member.role}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 w-full border-t border-border pt-3">
        <div className="flex flex-col items-center gap-0.5">
          <Star size={10} className="text-accent-bright" />
          <span className="text-[10px] font-black text-muted">{member.reputation.toLocaleString()}</span>
          <span className="text-[8px] text-subtle uppercase tracking-widest">Rep</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Tv2 size={10} className="text-accent-bright" />
          <span className="text-[10px] font-black text-muted">{member.animeCount}</span>
          <span className="text-[8px] text-subtle uppercase tracking-widest">Anime</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <ChevronRight size={10} className="text-subtle" />
          <span className="text-[10px] font-black text-muted truncate w-full text-center">{member.joinDate}</span>
          <span className="text-[8px] text-subtle uppercase tracking-widest">Joined</span>
        </div>
      </div>

      {/* Follow button */}
      <button
        onClick={() => onFollow(member.id)}
        className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
          member.isFollowed
            ? "bg-surface border border-border text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
            : "bg-accent hover:bg-accent-bright text-black shadow-[0_0_16px_rgba(99,102,241,0.25)]"
        }`}
      >
        {member.isFollowed ? "Following" : "Follow"}
      </button>
    </motion.div>
  )
}

/* ── Stats bar ── */
function StatBox({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-2xl bg-surface border border-border min-w-[90px]">
      <span className={`text-xl font-black ${accent}`}>{value.toLocaleString()}</span>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-subtle">{label}</span>
    </div>
  )
}

/* ── Page ── */
export default function ClubMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { push } = useToast()
  const clubName = slugToName(slug)

  const [members, setMembers] = useState<Member[]>(() => buildMembers(slug))
  const [search, setSearch] = useState("")
  const [isJoined, setIsJoined] = useState(false)

  const filtered = members.filter(
    (m) =>
      m.username.toLowerCase().includes(search.toLowerCase()) ||
      m.displayName.toLowerCase().includes(search.toLowerCase()),
  )

  const admins   = members.filter((m) => m.role === "ADMIN").length
  const mods     = members.filter((m) => m.role === "MOD").length
  const regulars = members.filter((m) => m.role === "USER").length

  const handleFollow = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const next = { ...m, isFollowed: !m.isFollowed }
        push(
          next.isFollowed ? `Following @${m.username}` : `Unfollowed @${m.username}`,
          next.isFollowed ? "success" : "info",
        )
        return next
      }),
    )
  }

  const handleJoin = () => {
    setIsJoined((prev) => {
      push(
        !prev ? `Joined ${clubName}!` : `Left ${clubName}`,
        !prev ? "success" : "info",
      )
      return !prev
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-indigo-700/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle mb-8"
        >
          <Link href="/clubs" className="hover:text-muted transition-colors flex items-center gap-1">
            <ArrowLeft size={10} /> Clubs
          </Link>
          <ChevronRight size={10} className="text-subtle" />
          <Link
            href={`/clubs/${slug}`}
            className="hover:text-muted transition-colors truncate max-w-[120px]"
          >
            {clubName}
          </Link>
          <ChevronRight size={10} className="text-subtle" />
          <span className="text-accent-bright">Members</span>
        </motion.nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8"
        >
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-accent-bright/70">
              Community
            </p>
            <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-foreground leading-none">
              Members<span style={{color:"var(--app-accent)"}}>.</span>
            </h1>
            <p className="text-subtle text-xs">
              {members.length.toLocaleString()} members in {clubName}
            </p>
          </div>

          <button
            onClick={handleJoin}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
              isJoined
                ? "bg-surface border border-border text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                : "bg-accent hover:bg-accent-bright text-black shadow-[0_0_32px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
            }`}
          >
            <UserPlus size={14} />
            {isJoined ? "Joined" : "Join Club"}
          </button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <StatBox label="Total"   value={members.length} accent="text-foreground" />
          <StatBox label="Admins"  value={admins}          accent="text-accent-bright" />
          <StatBox label="Mods"    value={mods}            accent="text-accent-bright" />
          <StatBox label="Regular" value={regulars}        accent="text-muted" />
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative mb-8"
        >
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members…"
            className="w-full sm:max-w-md pl-10 pr-4 py-3 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-accent/40 focus:bg-surface transition-all"
          />
        </motion.div>

        {/* Results count */}
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-6">
          {filtered.length} member{filtered.length !== 1 ? "s" : ""}{search ? " found" : ""}
        </p>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((member, i) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={i}
                  onFollow={handleFollow}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-4"
            >
              <div className="h-20 w-20 rounded-3xl bg-surface border border-border flex items-center justify-center">
                <Users size={28} className="text-subtle" />
              </div>
              <p className="text-lg font-black uppercase italic text-subtle">
                No members found
              </p>
              <p className="text-xs text-subtle">Try a different search</p>
              <button
                onClick={() => setSearch("")}
                className="mt-2 px-5 py-2.5 rounded-xl bg-accent/20 border border-accent/20 text-xs font-black uppercase tracking-widest text-accent-bright hover:bg-accent/30 transition-all"
              >
                Clear search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
