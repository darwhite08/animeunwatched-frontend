"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Play, PenLine, Flame, Users, Zap, Globe, Search, Check, Plus,
  Crown, Medal, BadgeCheck, TrendingUp, ChevronUp, ChevronDown,
} from "lucide-react"
import { useBoardLeaderboard } from "@/hooks/useLeaderboard"
import { useAuthStore } from "@/stores/auth.store"
import { useToast } from "@/stores/toast.store"
import * as ep from "@/lib/api/endpoints"
import type { BoardLeaderboardRow, LeaderboardBoardId } from "@/lib/api/types"

/* ─── Board config — every board reads from this; the podium and rows are
       metric-agnostic and format whatever the active board points at. ─────── */
type WindowId = "week" | "month" | "all"
type AudienceId = "global" | "friends"

// Contribution boards lead; raw-volume boards trail (engagement research:
// contribution framing over competitive volume).
const BOARDS: Array<{
  id: LeaderboardBoardId; label: string; icon: typeof Play
  unit: string; secondaryLabel: string; windowed: boolean; accent: string
}> = [
  { id: "reviews",  label: "Top Reviewers",    icon: PenLine,   unit: "reviews",   secondaryLabel: "likes",  windowed: true,  accent: "#00D4FF" },
  { id: "streak",   label: "Longest Streaks",  icon: Flame,     unit: "days",      secondaryLabel: "best",   windowed: false, accent: "#F0883E" },
  { id: "episodes", label: "Most Episodes",    icon: Play,      unit: "eps",       secondaryLabel: "titles", windowed: true,  accent: "#5B3BFF" },
  { id: "followed", label: "Most Followed",    icon: Users,     unit: "followers", secondaryLabel: "level",  windowed: false, accent: "#3FB950" },
  { id: "xp",       label: "Top Contributors", icon: Zap,       unit: "XP",        secondaryLabel: "titles", windowed: false, accent: "#8B5CF6" },
]

const WINDOWS: Array<{ id: WindowId; label: string }> = [
  { id: "week", label: "This Week" }, { id: "month", label: "This Month" }, { id: "all", label: "All-Time" },
]

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const compact = (n: number) => {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M"
  if (n >= 1e4) return (n / 1e3).toFixed(0) + "K"
  return n.toLocaleString()
}

function gradeForLevel(level: number): string {
  if (level >= 30) return "Crimson Shinobi"
  if (level >= 20) return "Void Sentinel"
  if (level >= 12) return "Neural Oracle"
  if (level >= 7)  return "Elite Jonin"
  if (level >= 4)  return "Jonin"
  return "Iron Shinobi"
}

// Stable per-user avatar hue from the username
function hueFor(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360
  return h
}
const avColor = (username: string) => `oklch(0.62 0.17 ${hueFor(username)})`

// Anime power-tier from board rank — instant status read
function tierFor(rank: number): { t: string; c: string; ss?: boolean } {
  if (rank === 1)  return { t: "SS", c: "var(--lb-gold)", ss: true }
  if (rank <= 3)   return { t: "S",  c: "#FF6B9D" }
  if (rank <= 10)  return { t: "A",  c: "#00D4FF" }
  if (rank <= 25)  return { t: "B",  c: "#3FB950" }
  return            { t: "C",  c: "#8DA2C0" }
}

function Tier({ rank, lg }: { rank: number; lg?: boolean }) {
  const t = tierFor(rank)
  return (
    <span className={"lb-tier" + (t.ss ? " is-ss" : "") + (lg ? " lg" : "")} style={{ "--tc": t.c } as React.CSSProperties}>
      <span>{t.t}</span>
    </span>
  )
}

/** Rank-movement chip — real data from daily snapshots; hidden when null. */
function Delta({ row }: { row: BoardLeaderboardRow }) {
  if (row.isNew) return <span className="lb-delta new">NEW</span>
  if (row.delta == null) return null
  if (row.delta === 0) return <span className="lb-delta flat">—</span>
  const up = row.delta > 0
  return (
    <span className={"lb-delta " + (up ? "up" : "down")}>
      {up ? <ChevronUp size={11} strokeWidth={2.6} /> : <ChevronDown size={11} strokeWidth={2.6} />}
      {Math.abs(row.delta)}
    </span>
  )
}

function Ava({ row, size, fontSize }: { row: BoardLeaderboardRow; size: number; fontSize: number }) {
  const u = row.user
  return u.avatarUrl ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={u.avatarUrl} alt={u.displayName} loading="lazy"
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }} />
  ) : (
    <span style={{
      width: size, height: size, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize, color: "var(--lb-paper)",
      background: `radial-gradient(120% 120% at 30% 20%, ${avColor(u.username)}, var(--lb-surface-2))`,
    }}>{u.displayName[0]?.toUpperCase()}</span>
  )
}

function Verified({ kind, size = 14 }: { kind: BoardLeaderboardRow["user"]["verifiedKind"]; size?: number }) {
  if (!kind) return null
  return <span className="lb-verified" title="Verified"><BadgeCheck size={size} strokeWidth={1.8} /></span>
}

/* ─── Follow button (real mutation, optimistic) ──────────────────────────── */
function FollowBtn({ row, overrides, onToggle }: {
  row: BoardLeaderboardRow
  overrides: Map<string, boolean>
  onToggle: (username: string, next: boolean) => void
}) {
  const me = useAuthStore(s => s.user)
  const { push } = useToast()
  const following = overrides.get(row.user.username) ?? row.isFollowing
  if (me?.id === row.user.id) return <span />
  return (
    <button
      className={"lb-fbtn" + (following ? " is-following" : "")}
      onClick={() => {
        if (!me) { push("Sign in to follow users", "info"); return }
        onToggle(row.user.username, !following)
      }}
    >
      {following
        ? <><Check size={14} strokeWidth={2.2} />Following</>
        : <><Plus size={14} strokeWidth={2.4} />Follow</>}
    </button>
  )
}

/* ─── Podium ─────────────────────────────────────────────────────────────── */
function PodCard({ row, board }: { row: BoardLeaderboardRow; board: (typeof BOARDS)[number] }) {
  const place = row.rank
  const size = place === 1 ? 112 : 92
  const r = size / 2 - 6, c = 2 * Math.PI * r
  const ringTier = place === 1 ? "var(--lb-gold)" : place === 2 ? "var(--lb-silver)" : "var(--lb-bronze)"
  const u = row.user
  const grade = gradeForLevel(u.level)
  return (
    <div className={"lb-pod lb-pod-" + place} style={{ "--av": avColor(u.username), "--ped": ringTier } as React.CSSProperties}>
      <div className="lb-pod-crown">
        {place === 1 && <div className="lb-ribbon"><Crown size={11} strokeWidth={2} />Board Champion</div>}
        {place === 1 ? <Crown size={30} strokeWidth={1.7} /> : <Medal size={24} strokeWidth={1.7} />}
      </div>
      <div className="lb-pod-av" style={{ width: size, height: size }}>
        <svg className="lb-pod-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--lb-rule-strong)" strokeWidth="4" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringTier} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={c * 0.12} transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ filter: `drop-shadow(0 0 8px color-mix(in oklab, ${ringTier} 60%, transparent))` }} />
        </svg>
        <div className="lb-pod-ava"><Ava row={row} size={size - 20} fontSize={place === 1 ? 42 : 34} /></div>
        <span className="lb-pod-medal">{place}</span>
      </div>
      <Link href={`/u/${u.username}`} className="lb-pod-name" style={{ color: "inherit", textDecoration: "none" }}>
        {u.displayName}
        <Verified kind={u.verifiedKind} size={place === 1 ? 18 : 15} />
      </Link>
      <div className="lb-pod-handle"><span className="lb-mono">@{u.username}</span></div>
      <div className="lb-pod-metric tnum">
        {row.value.toLocaleString()}<span className="lb-pm-unit">{board.unit}</span>
      </div>
      <div className="lb-pod-tier">
        <Tier rank={place} lg={place === 1} />
        <span className="lb-mono">Lv {u.level} · {grade}</span>
      </div>
      <div className="lb-pedestal"><span>{place}</span></div>
    </div>
  )
}

function Podium({ top, board }: { top: BoardLeaderboardRow[]; board: (typeof BOARDS)[number] }) {
  if (top.length < 3) return null
  const order = [top[1], top[0], top[2]]
  return (
    <div className="lb-podium-wrap lb-rise" style={{ "--board": board.accent } as React.CSSProperties}>
      <div className="lb-speedlines" />
      <div className="lb-halftone" />
      <div className="lb-podium-glow" />
      <div className="lb-podium">
        {order.map(row => <PodCard key={row.user.id} row={row} board={board} />)}
      </div>
    </div>
  )
}

/* ─── Ranked row ─────────────────────────────────────────────────────────── */
function Row({ row, board, isMe, overrides, onToggle }: {
  row: BoardLeaderboardRow; board: (typeof BOARDS)[number]; isMe: boolean
  overrides: Map<string, boolean>; onToggle: (username: string, next: boolean) => void
}) {
  const u = row.user
  return (
    <div className={"lb-row" + (isMe ? " is-you" : "")}>
      <div className="lb-rk"><span className="lb-rk-n">{row.rank}</span><Delta row={row} /></div>
      <Link href={`/u/${u.username}`} className="lb-who" style={{ color: "inherit", textDecoration: "none" }}>
        <span className="lb-ava" style={{ "--av": avColor(u.username) } as React.CSSProperties}>
          <Ava row={row} size={44} fontSize={17} />
          <span className="lb-ava-lv">{u.level}</span>
        </span>
        <div className="lb-who-txt">
          <div className="lb-who-name">
            <Tier rank={row.rank} />
            {u.displayName}
            <Verified kind={u.verifiedKind} />
            {isMe && <span className="lb-you-tag">YOU</span>}
          </div>
          <div className="lb-who-sub">
            <span className="lb-mono">@{u.username}</span>
            <span className="lb-grade">· {gradeForLevel(u.level)}</span>
          </div>
        </div>
      </Link>
      <div className="lb-sec col-sec">
        <b>{board.secondaryLabel === "level" ? `Lv ${row.secondary}` : compact(row.secondary)}</b>{" "}
        <span className="lb-mono">{board.secondaryLabel}</span>
      </div>
      <div className="lb-metric">
        <div className="lb-metric-n tnum">{row.value.toLocaleString()}</div>
        <div className="lb-metric-u">{board.unit}</div>
      </div>
      <div className="lb-follow col-follow">
        <FollowBtn row={row} overrides={overrides} onToggle={onToggle} />
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="lb-row" style={{ pointerEvents: "none" }}>
      <span className="lb-skel" style={{ width: 26, height: 20, borderRadius: 6 }} />
      <div className="lb-who">
        <span className="lb-skel" style={{ width: 44, height: 44, borderRadius: "50%" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          <span className="lb-skel" style={{ width: "42%", height: 12 }} />
          <span className="lb-skel" style={{ width: "26%", height: 10 }} />
        </div>
      </div>
      <span className="lb-skel col-sec" style={{ width: 56, height: 14, justifySelf: "end" }} />
      <span className="lb-skel" style={{ width: 64, height: 20, justifySelf: "end" }} />
      <span className="lb-skel col-follow" style={{ width: 84, height: 32, borderRadius: 10, justifySelf: "end" }} />
    </div>
  )
}

/* ─── Sticky you-bar ─────────────────────────────────────────────────────── */
function YouBar({ me, total, board }: {
  me: { rank: number; value: number; secondary: number; nextValue: number | null }
  total: number; board: (typeof BOARDS)[number]
}) {
  const user = useAuthStore(s => s.user)
  if (!user) return null
  const atTop = me.rank <= 1
  const gap = me.nextValue != null ? Math.max(1, me.nextValue - me.value) : null
  const pct = gap != null ? Math.min(0.97, Math.max(0.12, me.value / (me.value + gap))) : 1
  return (
    <div className="lb-youbar" style={{ "--accent": board.accent } as React.CSSProperties}>
      <div className="lb-youbar-id">
        <div className="lb-youbar-rk">
          <span className="lb-mono" style={{ color: "rgba(244,242,236,.7)" }}>Rank</span>
          <b>#{me.rank.toLocaleString()}</b>
        </div>
        <span className="lb-youbar-ava">
          {user.avatarUrl
            /* eslint-disable-next-line @next/next/no-img-element */
            ? <img src={user.avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
            : user.displayName[0]?.toUpperCase()}
        </span>
        <div>
          <div className="lb-youbar-name">{user.displayName}<span className="lb-you-tag">YOU</span></div>
          <div className="lb-youbar-sub">
            {compact(me.value)} {board.unit}
            {total > 100 ? " · top " + Math.max(0.1, (me.rank / total) * 100).toFixed(1) + "%" : ` · #${me.rank} of ${total}`}
          </div>
        </div>
      </div>
      <div className="lb-youbar-prog">
        <div className="lb-yp-top">
          <span className="lb-yp-label">
            {atTop
              ? <>You&apos;re <b>#1</b> — defend your spot</>
              : gap != null
                ? <><b>{compact(gap)}</b> {board.unit} to pass <b>#{(me.rank - 1).toLocaleString()}</b></>
                : <>Keep going — every {board.unit.replace(/s$/, "")} counts</>}
          </span>
        </div>
        <div className="lb-youbar-track"><span style={{ width: pct * 100 + "%" }} /></div>
      </div>
      <div className="lb-youbar-metric">
        <div className="lb-mono" style={{ color: "rgba(244,242,236,.6)" }}>of {compact(total)}</div>
        <b className="tnum">{compact(me.value)}</b>
      </div>
      <Link href="/dashboard" className="lb-youbar-cta" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Zap size={15} strokeWidth={2} />Climb
      </Link>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const me = useAuthStore(s => s.user)
  const { push } = useToast()
  const qc = useQueryClient()

  // Defaults follow the engagement research: lead with a CONTRIBUTION board
  // (reviews), not a volume board, and default signed-in users to the Friends
  // cohort — global competitive ranking is opt-in, never the headline.
  const [boardId, setBoardId] = useState<LeaderboardBoardId>("reviews")
  const [win, setWin] = useState<WindowId>("all")
  const [audienceChoice, setAudienceChoice] = useState<AudienceId | null>(null)
  const audience: AudienceId = audienceChoice ?? (me ? "friends" : "global")
  const setAudience = setAudienceChoice
  const [q, setQ] = useState("")

  const board = BOARDS.find(b => b.id === boardId)!
  const effectiveWin = board.windowed ? win : "all"
  const { data, isLoading } = useBoardLeaderboard(boardId, effectiveWin, audience)

  // Optimistic follow overrides, keyed by username (cleared on refetch via key)
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())
  const followMut = useMutation({
    mutationFn: ({ username, next }: { username: string; next: boolean }) =>
      next ? ep.follow(username) : ep.unfollow(username),
    onError: (_e, { username }) => {
      setOverrides(prev => { const n = new Map(prev); n.delete(username); return n })
      push("Failed to update follow", "error")
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaderboard-board"] }),
  })
  const onToggle = (username: string, next: boolean) => {
    setOverrides(prev => new Map(prev).set(username, next))
    followMut.mutate({ username, next })
  }

  const rows = useMemo(() => data?.data ?? [], [data])
  const searching = q.trim().length > 0
  const filtered = useMemo(() => {
    if (!searching) return rows
    const needle = q.trim().toLowerCase()
    return rows.filter(r =>
      r.user.displayName.toLowerCase().includes(needle) || r.user.username.toLowerCase().includes(needle))
  }, [rows, q, searching])

  const showPodium = !searching && filtered.length >= 3
  const listRows = searching || !showPodium ? filtered : filtered.slice(3)

  return (
    <div className="lb-page" style={{ "--accent": board.accent } as React.CSSProperties}>
      <style>{LB_CSS}</style>
      <div className="lb-shell">

        {/* Top bar */}
        <div className="lb-topbar">
          <div className="lb-brand">
            <div className="lb-brand-mark">
              <svg viewBox="-6 -8 88 116" style={{ width: 20, height: 20, display: "block" }} aria-label="Kaiveron">
                <path d="M 0 0 L 24 0 L 24 36 L 40 36 L 56 0 L 76 0 L 50 44 L 42 44 L 64 100 L 44 100 L 30 64 L 24 64 L 24 100 L 0 100 Z" fill="#F4F2EC" fillRule="evenodd" />
              </svg>
            </div>
            <div className="lb-titleblock">
              <h1>Leaderboard</h1>
              <div className="lb-mono lb-tagline">
                <span className="lb-live" />
                Live rankings{data ? ` · ${compact(data.total)} ranked` : ""}
              </div>
            </div>
          </div>
          <div className="lb-search">
            <Search size={16} strokeWidth={1.9} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search ranked users…" />
          </div>
        </div>

        {/* Board tabs */}
        <div className="lb-boards">
          {BOARDS.map(b => {
            const BIcon = b.icon
            return (
              <button key={b.id} className={"lb-board" + (b.id === boardId ? " is-active" : "")}
                style={{ "--board": b.accent } as React.CSSProperties} onClick={() => setBoardId(b.id)}>
                <span className="lb-board-ic"><BIcon size={16} strokeWidth={1.9} /></span>
                {b.label}
              </button>
            )
          })}
        </div>

        {/* Controls */}
        <div className="lb-controls">
          <div className="lb-board-meta">
            <h2>{board.label}</h2>
            <span className="lb-mono">
              · {board.windowed ? WINDOWS.find(w => w.id === win)!.label : "All-Time"}
              {audience === "friends" ? " · Friends" : ""}
            </span>
          </div>
          <div className="lb-controls-l">
            <div className="lb-seg" style={{ opacity: board.windowed ? 1 : 0.45 }}
              title={board.windowed ? undefined : "This board is all-time only"}>
              {WINDOWS.map(w => (
                <button key={w.id} disabled={!board.windowed}
                  className={w.id === effectiveWin ? "is-on" : ""}
                  onClick={() => board.windowed && setWin(w.id)}>{w.label}</button>
              ))}
            </div>
            <div className="lb-aud">
              <button className={audience === "global" ? "is-on" : ""} onClick={() => setAudience("global")}>
                <Globe size={15} strokeWidth={1.9} />Global
              </button>
              <button className={audience === "friends" ? "is-on" : ""}
                onClick={() => {
                  if (!me) { push("Sign in to see your friends board", "info"); return }
                  setAudience("friends")
                }}>
                <Users size={15} strokeWidth={1.9} />Friends
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        {isLoading && !data ? (
          <div className="lb-list lb-rise">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="lb-list lb-rise">
            <div className="lb-empty">
              <span className="lb-empty-ic">
                {searching ? <Search size={24} strokeWidth={1.8} /> : <TrendingUp size={24} strokeWidth={1.8} />}
              </span>
              {searching ? (
                <>
                  <h3>No one matches &ldquo;{q}&rdquo;</h3>
                  <p>Try a different name or handle, or clear the search to see the full board.</p>
                </>
              ) : audience === "friends" ? (
                <>
                  <h3>No friends ranked yet</h3>
                  <p>Follow people on Kaiveron and they&apos;ll show up here, ranked against you.</p>
                </>
              ) : (
                <>
                  <h3>Nothing on this board yet</h3>
                  <p>Be the first — watch, review, and climb the rankings.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {showPodium && <Podium top={filtered.slice(0, 3)} board={board} />}
            <div className="lb-list lb-rise" style={{ animationDelay: ".08s" }}>
              <div className="lb-list-head lb-mono">
                <span>Rank</span>
                <span>User</span>
                <span className="col-sec ta-r">{board.secondaryLabel}</span>
                <span className="ta-r">{board.unit}</span>
                <span className="col-follow" />
              </div>
              {listRows.map(row => (
                <Row key={row.user.id} row={row} board={board}
                  isMe={me?.id === row.user.id} overrides={overrides} onToggle={onToggle} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sticky you-bar */}
      {me && data?.me && !searching && (
        <YouBar me={data.me} total={data.total} board={board} />
      )}
    </div>
  )
}

/* ─── Page CSS (ported from the approved standalone design) ──────────────── */
const LB_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  .lb-page {
    --lb-bg: #060A14; --lb-surface: #0D1224; --lb-surface-2: #121a33; --lb-surface-3: #18223f;
    --lb-rule: rgba(244,242,236,0.07); --lb-rule-strong: rgba(244,242,236,0.14);
    --lb-paper: #F4F2EC; --lb-muted: rgba(244,242,236,0.58); --lb-faint: rgba(244,242,236,0.34);
    --accent-2: #00D4FF;
    --lb-gold: #F2C94C; --lb-silver: #C7D2E0; --lb-bronze: #E08A4B;
    --pad: 24px; --gap: 16px; --radius: 22px;
    position: relative; min-height: 100vh; padding: 34px 32px 150px;
    font-family: 'Sora', system-ui, sans-serif; color: var(--lb-paper); -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(1300px 640px at 78% -12%, color-mix(in oklab, var(--accent) 20%, transparent), transparent 60%),
      radial-gradient(1000px 520px at 6% -4%, color-mix(in oklab, var(--accent-2) 12%, transparent), transparent 55%),
      var(--lb-bg);
  }
  .lb-page button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
  .lb-page input { font-family: inherit; }
  .lb-mono { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lb-faint); }
  .tnum { font-variant-numeric: tabular-nums; }
  @keyframes lbrise { from { transform: translateY(14px); opacity: 0; } to { transform: none; opacity: 1; } }
  .lb-rise { animation: lbrise .6s cubic-bezier(.2,.7,.2,1) both; }
  @media (prefers-reduced-motion: reduce) { .lb-rise { animation: none; } }

  .lb-shell { margin: 0 auto; max-width: 1180px; display: flex; flex-direction: column; gap: var(--gap); }

  .lb-topbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 4px; }
  .lb-brand { display: flex; align-items: center; gap: 12px; }
  .lb-brand-mark { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, color-mix(in oklab, var(--accent) 70%, #000), color-mix(in oklab, var(--accent) 30%, var(--accent-2)));
    box-shadow: 0 6px 18px color-mix(in oklab, var(--accent) 40%, transparent), inset 0 1px 0 rgba(255,255,255,.2); }
  .lb-titleblock h1 { margin: 0; font-size: 25px; font-weight: 800; letter-spacing: -0.02em; line-height: 1;
    text-shadow: 0 0 24px color-mix(in oklab, var(--accent) 45%, transparent); }
  .lb-titleblock .lb-tagline { margin-top: 6px; color: var(--accent-2); display: flex; align-items: center; gap: 7px; }
  .lb-live { width: 7px; height: 7px; border-radius: 50%; background: #3FB950; animation: lblive 1.8s infinite; }
  @keyframes lblive { 0% { box-shadow: 0 0 0 0 rgba(63,185,80,.55); } 70% { box-shadow: 0 0 0 7px rgba(63,185,80,0); } 100% { box-shadow: 0 0 0 0 rgba(63,185,80,0); } }
  @media (prefers-reduced-motion: reduce) { .lb-live { animation: none; } }
  .lb-search { display: flex; align-items: center; gap: 9px; height: 42px; padding: 0 14px; min-width: 230px;
    border-radius: 13px; background: var(--lb-surface); border: 1px solid var(--lb-rule-strong); color: var(--lb-muted); transition: border-color .16s, background .16s; }
  .lb-search:focus-within { border-color: color-mix(in oklab, var(--accent) 55%, transparent); background: var(--lb-surface-2); }
  .lb-search input { flex: 1; min-width: 0; border: none; outline: none; background: none; color: var(--lb-paper); font-size: 13.5px; }
  .lb-search input::placeholder { color: var(--lb-faint); }

  .lb-boards { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
  .lb-boards::-webkit-scrollbar { display: none; }
  .lb-board { flex-shrink: 0; display: flex; align-items: center; gap: 9px; height: 46px; padding: 0 17px; border-radius: 14px;
    background: var(--lb-surface); border: 1px solid var(--lb-rule); color: var(--lb-muted); font-size: 14px; font-weight: 600;
    transition: transform .14s, color .16s, border-color .16s, background .16s; }
  .lb-board:hover { color: var(--lb-paper); border-color: var(--lb-rule-strong); transform: translateY(-1px); }
  .lb-board .lb-board-ic { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    background: color-mix(in oklab, var(--board) 16%, transparent); color: var(--board); transition: background .16s; }
  .lb-board.is-active { color: var(--lb-paper); border-color: color-mix(in oklab, var(--board) 60%, transparent);
    background: color-mix(in oklab, var(--board) 14%, var(--lb-surface)); box-shadow: 0 8px 22px color-mix(in oklab, var(--board) 22%, transparent); }
  .lb-board.is-active .lb-board-ic { background: color-mix(in oklab, var(--board) 28%, transparent); }

  .lb-controls { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 6px 4px 2px; }
  .lb-seg { display: inline-flex; padding: 4px; border-radius: 13px; background: var(--lb-surface); border: 1px solid var(--lb-rule); }
  .lb-seg button { position: relative; height: 34px; padding: 0 16px; border-radius: 9px; font-size: 13px; font-weight: 600; color: var(--lb-muted); white-space: nowrap; transition: color .15s; }
  .lb-seg button.is-on { color: var(--lb-paper); background: color-mix(in oklab, var(--accent) 22%, var(--lb-surface-3)); box-shadow: 0 2px 8px color-mix(in oklab, var(--accent) 25%, transparent); }
  .lb-seg button:not(.is-on):hover { color: var(--lb-paper); }
  .lb-aud { display: inline-flex; gap: 6px; }
  .lb-aud button { display: inline-flex; align-items: center; gap: 7px; height: 42px; padding: 0 15px; border-radius: 12px;
    background: var(--lb-surface); border: 1px solid var(--lb-rule); color: var(--lb-muted); font-size: 13px; font-weight: 600; transition: color .15s, border-color .15s, background .15s; }
  .lb-aud button svg { color: var(--lb-faint); transition: color .15s; }
  .lb-aud button:hover { color: var(--lb-paper); border-color: var(--lb-rule-strong); }
  .lb-aud button.is-on { color: var(--lb-paper); border-color: color-mix(in oklab, var(--accent-2) 55%, transparent); background: color-mix(in oklab, var(--accent-2) 12%, var(--lb-surface)); }
  .lb-aud button.is-on svg { color: var(--accent-2); }
  .lb-controls-l { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .lb-board-meta { display: flex; align-items: center; gap: 9px; }
  .lb-board-meta h2 { margin: 0; font-size: 17px; font-weight: 700; letter-spacing: -.01em; }
  .lb-board-meta .lb-mono { color: var(--lb-muted); }

  .lb-podium-wrap { position: relative; border-radius: var(--radius); padding: 30px var(--pad) 0; overflow: hidden;
    background:
      radial-gradient(620px 280px at 50% -30%, color-mix(in oklab, var(--lb-gold) 14%, transparent), transparent 70%),
      linear-gradient(180deg, var(--lb-surface-2), var(--lb-surface));
    border: 1px solid var(--lb-rule-strong); }
  .lb-podium-glow { position: absolute; inset: -40% 20% auto 20%; height: 320px; filter: blur(56px); opacity: .5; pointer-events: none;
    background: radial-gradient(40% 60% at 50% 40%, color-mix(in oklab, var(--lb-gold) 60%, transparent), transparent 70%); }
  .lb-podium { position: relative; display: grid; grid-template-columns: 1fr 1.18fr 1fr; align-items: end; gap: 18px; max-width: 760px; margin: 0 auto; z-index: 1; }

  .lb-pod { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .lb-pod-2 { order: 1; } .lb-pod-1 { order: 2; } .lb-pod-3 { order: 3; }
  .lb-pod-crown { display: flex; flex-direction: column; align-items: center; margin-bottom: 8px; filter: drop-shadow(0 3px 8px rgba(0,0,0,.5)); }
  .lb-pod-1 .lb-pod-crown { color: var(--lb-gold); filter: drop-shadow(0 0 14px color-mix(in oklab, var(--lb-gold) 70%, transparent)); animation: lbcrown 3.4s ease-in-out infinite; }
  .lb-pod-2 .lb-pod-crown { color: var(--lb-silver); }
  .lb-pod-3 .lb-pod-crown { color: var(--lb-bronze); }
  @keyframes lbcrown { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(-2deg); } }

  .lb-pod-av { position: relative; }
  .lb-pod-1 .lb-pod-av::before { content: ''; position: absolute; inset: -16px; border-radius: 50%; z-index: -1;
    background: radial-gradient(circle, color-mix(in oklab, var(--lb-gold) 50%, transparent), transparent 68%); animation: lbaura 2.8s ease-in-out infinite; }
  @keyframes lbaura { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.16); opacity: .95; } }
  .lb-pod-ring { display: block; }
  .lb-pod-ava { position: absolute; inset: 7px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(120% 120% at 30% 20%, color-mix(in oklab, var(--av) 60%, var(--lb-surface-3)), var(--lb-surface-2));
    border: 3px solid var(--lb-surface); box-shadow: inset 0 2px 14px rgba(0,0,0,.5); }
  .lb-pod-ava img { width: 100%; height: 100%; object-fit: cover; }
  .lb-pod-medal { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); z-index: 3;
    display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%;
    font-size: 13px; font-weight: 800; color: var(--lb-bg); border: 3px solid var(--lb-surface); box-shadow: 0 4px 10px rgba(0,0,0,.45); }
  .lb-pod-1 .lb-pod-medal { background: linear-gradient(135deg, #FFE08A, var(--lb-gold)); }
  .lb-pod-2 .lb-pod-medal { background: linear-gradient(135deg, #E6EEF8, var(--lb-silver)); }
  .lb-pod-3 .lb-pod-medal { background: linear-gradient(135deg, #F6B27A, var(--lb-bronze)); }

  .lb-pod-name { margin-top: 16px; display: flex; align-items: center; gap: 6px; font-weight: 700; letter-spacing: -.01em; }
  .lb-pod-name:hover { text-decoration: underline !important; }
  .lb-verified { color: var(--accent-2); display: inline-flex; flex-shrink: 0; }
  .lb-pod-handle { margin-top: 3px; display: inline-flex; align-items: center; gap: 7px; color: var(--lb-muted); }
  .lb-pod-handle .lb-mono { text-transform: none; letter-spacing: 0; font-size: 12px; }
  .lb-pod-metric { margin-top: 13px; font-weight: 800; letter-spacing: -.02em; line-height: 1; }
  .lb-pod-metric .lb-pm-unit { font-size: .42em; font-weight: 600; color: var(--lb-muted); margin-left: 5px; letter-spacing: .04em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }
  .lb-pod-tier { margin-top: 11px; display: flex; align-items: center; gap: 8px; justify-content: center; }
  .lb-pod-tier .lb-mono { color: var(--lb-muted); }

  .lb-pedestal { margin-top: 18px; width: 100%; border-radius: 14px 14px 0 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 13px;
    background: linear-gradient(180deg, color-mix(in oklab, var(--ped) 26%, var(--lb-surface-3)), color-mix(in oklab, var(--ped) 6%, var(--lb-surface))); border: 1px solid var(--lb-rule); border-bottom: none; }
  .lb-pedestal span { font-size: 42px; font-weight: 800; line-height: 1; color: color-mix(in oklab, var(--ped) 70%, var(--lb-paper)); opacity: .9; text-shadow: 0 2px 12px color-mix(in oklab, var(--ped) 40%, transparent); }
  .lb-pod-1 .lb-pedestal { height: 98px; } .lb-pod-1 .lb-pedestal span { font-size: 52px; }
  .lb-pod-2 .lb-pedestal { height: 74px; }
  .lb-pod-3 .lb-pedestal { height: 60px; }
  .lb-pod-1 .lb-pod-name { font-size: 20px; } .lb-pod-1 .lb-pod-metric { font-size: 38px; }
  .lb-pod-2 .lb-pod-name, .lb-pod-3 .lb-pod-name { font-size: 17px; }
  .lb-pod-2 .lb-pod-metric, .lb-pod-3 .lb-pod-metric { font-size: 29px; }

  .lb-ribbon { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 11px; padding: 5px 13px; border-radius: 999px;
    font-family: 'JetBrains Mono', monospace; font-size: 9.5px; letter-spacing: .2em; font-weight: 700; text-transform: uppercase; color: #2A1A00;
    background: linear-gradient(135deg, #FFE7A6, var(--lb-gold)); box-shadow: 0 4px 18px color-mix(in oklab, var(--lb-gold) 55%, transparent), inset 0 1px 0 rgba(255,255,255,.5); }
  .lb-pod-1 .lb-pod-metric { background: linear-gradient(100deg, #FFE7A6 0%, #FFFFFF 28%, #FFD24A 52%, #FFFFFF 74%, #FFE08A 100%);
    background-size: 220% auto; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
    animation: lbshine 4.5s linear infinite; filter: drop-shadow(0 2px 12px color-mix(in oklab, var(--lb-gold) 45%, transparent)); }
  @keyframes lbshine { to { background-position: 220% center; } }
  .lb-pod-1 .lb-pod-metric .lb-pm-unit { -webkit-text-fill-color: var(--lb-muted); color: var(--lb-muted); }

  .lb-speedlines { position: absolute; inset: -30% 0 auto 0; height: 560px; pointer-events: none; opacity: .55; z-index: 0;
    background: repeating-conic-gradient(from 0deg at 50% 36%,
      transparent 0deg 2.4deg, color-mix(in oklab, var(--board) 34%, transparent) 2.4deg 3.2deg);
    -webkit-mask: radial-gradient(closest-side at 50% 36%, transparent 28%, #000 60%, transparent 86%);
    mask: radial-gradient(closest-side at 50% 36%, transparent 28%, #000 60%, transparent 86%);
    animation: lbspin 90s linear infinite; }
  @keyframes lbspin { to { transform: rotate(360deg); } }
  .lb-halftone { position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: .5;
    background-image: radial-gradient(rgba(244,242,236,0.10) 1px, transparent 1.4px); background-size: 13px 13px;
    -webkit-mask: linear-gradient(180deg, #000, transparent 70%); mask: linear-gradient(180deg, #000, transparent 70%); }
  @media (prefers-reduced-motion: reduce) {
    .lb-speedlines, .lb-pod-1 .lb-pod-crown, .lb-pod-1 .lb-pod-av::before, .lb-pod-1 .lb-pod-metric { animation: none; }
  }

  .lb-tier { display: inline-flex; align-items: center; justify-content: center; transform: skewX(-11deg);
    min-width: 24px; height: 21px; padding: 0 7px; border-radius: 5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12px; letter-spacing: .03em;
    color: #0A0A0A; background: var(--tc); box-shadow: 0 2px 9px color-mix(in oklab, var(--tc) 50%, transparent), inset 0 1px 0 rgba(255,255,255,.35); flex-shrink: 0; }
  .lb-tier > span { display: inline-block; transform: skewX(11deg); }
  .lb-tier.is-ss { background: linear-gradient(135deg, #FFE7A6, var(--lb-gold)); box-shadow: 0 0 16px color-mix(in oklab, var(--lb-gold) 75%, transparent), inset 0 1px 0 rgba(255,255,255,.5); }
  .lb-tier.lg { min-width: 34px; height: 27px; font-size: 15px; border-radius: 7px; }

  .lb-list { border-radius: var(--radius); background: var(--lb-surface); border: 1px solid var(--lb-rule); overflow: hidden;
    --cols: minmax(64px,auto) minmax(0,2.4fr) 1fr 1.1fr auto; }
  .lb-list-head { display: grid; grid-template-columns: var(--cols); align-items: center; gap: 14px; padding: 13px var(--pad); border-bottom: 1px solid var(--lb-rule); }
  .lb-list-head span { color: var(--lb-faint); }
  .lb-list-head .ta-r { text-align: right; }
  .lb-row { display: grid; grid-template-columns: var(--cols); align-items: center; gap: 14px; padding: 13px var(--pad);
    border-bottom: 1px solid var(--lb-rule); transition: background .14s; position: relative; }
  .lb-row:last-child { border-bottom: none; }
  .lb-row:hover { background: var(--lb-surface-2); }
  .lb-row.is-you { background: color-mix(in oklab, var(--accent) 12%, var(--lb-surface)); box-shadow: inset 3px 0 0 var(--accent-2); }
  .lb-row.is-you:hover { background: color-mix(in oklab, var(--accent) 16%, var(--lb-surface)); }

  .lb-rk { display: flex; align-items: center; gap: 11px; }
  .lb-rk-n { font-size: 18px; font-weight: 800; color: var(--lb-muted); min-width: 26px; font-variant-numeric: tabular-nums; }
  .lb-row.is-you .lb-rk-n { color: var(--lb-paper); }
  .lb-delta { display: inline-flex; align-items: center; gap: 2px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; min-width: 34px; }
  .lb-delta.up { color: #3FB950; } .lb-delta.down { color: #E5577D; }
  .lb-delta.flat { color: var(--lb-faint); } .lb-delta.new { color: #00D4FF; }

  .lb-who { display: flex; align-items: center; gap: 13px; min-width: 0; }
  .lb-ava { position: relative; width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(120% 120% at 30% 20%, color-mix(in oklab, var(--av) 62%, var(--lb-surface-3)), var(--lb-surface-2));
    border: 1px solid color-mix(in oklab, var(--av) 40%, var(--lb-rule-strong)); box-shadow: inset 0 1px 8px rgba(0,0,0,.4); overflow: visible; }
  .lb-ava img { border: none; }
  .lb-ava .lb-ava-lv { position: absolute; bottom: -4px; right: -5px; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600; color: var(--lb-paper);
    padding: 1px 4px; border-radius: 6px; background: var(--lb-surface-3); border: 1px solid var(--lb-rule-strong); letter-spacing: .02em; z-index: 2; }
  .lb-who-txt { min-width: 0; }
  .lb-who-name { display: flex; align-items: center; gap: 7px; font-size: 15px; font-weight: 600; }
  .lb-you-tag { font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: .12em; padding: 2px 6px; border-radius: 5px; color: var(--lb-bg); background: var(--accent-2); font-weight: 700; }
  .lb-who-sub { margin-top: 3px; display: flex; align-items: center; gap: 8px; color: var(--lb-faint); }
  .lb-who-sub .lb-mono { text-transform: none; letter-spacing: 0; font-size: 12px; }
  .lb-grade { color: var(--lb-muted); font-size: 12px; }

  .lb-sec { text-align: right; color: var(--lb-muted); }
  .lb-sec b { color: var(--lb-paper); font-weight: 700; font-variant-numeric: tabular-nums; }
  .lb-sec .lb-mono { color: var(--lb-faint); }
  .lb-metric { text-align: right; }
  .lb-metric-n { font-size: 21px; font-weight: 800; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
  .lb-metric-u { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--lb-faint); margin-top: 2px; }
  .lb-follow { display: flex; justify-content: flex-end; }
  .lb-fbtn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border-radius: 10px; font-size: 12.5px; font-weight: 600;
    color: var(--lb-paper); background: var(--lb-rule); border: 1px solid var(--lb-rule-strong); transition: background .15s, border-color .15s, transform .12s; white-space: nowrap; }
  .lb-fbtn:hover { background: var(--lb-rule-strong); transform: translateY(-1px); }
  .lb-fbtn.is-following { color: var(--lb-muted); }

  .lb-youbar { position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 40; width: min(1116px, calc(100vw - 48px));
    display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 20px; padding: 13px 18px; border-radius: 18px;
    font-family: 'Sora', system-ui, sans-serif; color: var(--lb-paper, #F4F2EC);
    background: color-mix(in oklab, var(--accent) 20%, rgba(13,18,36,.86)); backdrop-filter: blur(20px) saturate(150%); -webkit-backdrop-filter: blur(20px) saturate(150%);
    border: 1px solid color-mix(in oklab, var(--accent-2) 40%, transparent); box-shadow: 0 18px 50px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1); }
  .lb-youbar-id { display: flex; align-items: center; gap: 13px; }
  .lb-youbar-rk { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 64px; padding: 6px 12px; border-radius: 12px;
    background: rgba(6,10,20,.4); border: 1px solid var(--lb-rule-strong); }
  .lb-youbar-rk b { font-size: 22px; font-weight: 800; line-height: 1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
  .lb-youbar-ava { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0; overflow: hidden;
    background: radial-gradient(120% 120% at 30% 20%, color-mix(in oklab, var(--accent) 65%, var(--lb-surface-3)), var(--lb-surface-2)); border: 1px solid var(--lb-rule-strong); }
  .lb-youbar-name { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 7px; }
  .lb-youbar-sub { margin-top: 2px; color: rgba(244,242,236,.7); font-size: 12.5px; }
  .lb-youbar-prog { min-width: 0; }
  .lb-youbar-prog .lb-yp-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 7px; }
  .lb-youbar-prog .lb-yp-label { font-size: 12.5px; color: rgba(244,242,236,.82); }
  .lb-youbar-prog .lb-yp-label b { color: #fff; font-weight: 700; }
  .lb-youbar-track { height: 7px; border-radius: 4px; background: rgba(6,10,20,.45); overflow: hidden; }
  .lb-youbar-track span { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, var(--accent-2), var(--lb-paper)); box-shadow: 0 0 12px color-mix(in oklab, var(--accent-2) 60%, transparent); }
  .lb-youbar-metric { text-align: right; }
  .lb-youbar-metric b { font-size: 19px; font-weight: 800; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
  .lb-youbar-cta { height: 40px; padding: 0 18px; border-radius: 12px; font-size: 13.5px; font-weight: 700; color: var(--lb-bg, #060A14);
    background: linear-gradient(135deg, var(--accent-2), var(--lb-paper)); box-shadow: 0 6px 18px color-mix(in oklab, var(--accent-2) 40%, transparent); transition: transform .14s; white-space: nowrap; }
  .lb-youbar-cta:hover { transform: translateY(-1px); }

  .lb-empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 60px 24px; }
  .lb-empty-ic { width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: var(--accent-2); background: color-mix(in oklab, var(--accent-2) 12%, transparent); margin-bottom: 6px; }
  .lb-empty h3 { margin: 0; font-size: 17px; font-weight: 700; }
  .lb-empty p { margin: 0; max-width: 320px; color: var(--lb-muted); font-size: 13.5px; line-height: 1.55; }

  .lb-skel { background: linear-gradient(90deg, var(--lb-surface-2) 0%, var(--lb-surface-3) 50%, var(--lb-surface-2) 100%); background-size: 200% 100%; animation: lbshimmer 1.4s ease-in-out infinite; border-radius: 6px; display: inline-block; }
  @keyframes lbshimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @media (max-width: 940px) {
    .lb-list-head .col-sec, .lb-row .col-sec { display: none; }
    .lb-list { --cols: minmax(56px,auto) minmax(0,2.4fr) 1.1fr auto; }
  }
  @media (max-width: 720px) {
    .lb-page { padding: 22px 14px 160px; }
    .lb-topbar { flex-wrap: wrap; }
    .lb-search { min-width: 0; width: 100%; order: 3; }
    .lb-podium { grid-template-columns: 1fr; gap: 12px; max-width: 360px; }
    .lb-pod-2, .lb-pod-1, .lb-pod-3 { order: 0; }
    .lb-pedestal { display: none; }
    .lb-pod { padding: 18px; border-radius: 16px; background: var(--lb-surface-2); border: 1px solid var(--lb-rule); }
    .lb-youbar { grid-template-columns: auto 1fr auto; }
    .lb-youbar-prog { display: none; }
  }
  @media (max-width: 520px) {
    .lb-list-head .col-follow, .lb-row .col-follow { display: none; }
    .lb-list { --cols: minmax(48px,auto) minmax(0,2.4fr) 1.1fr; }
  }
`
