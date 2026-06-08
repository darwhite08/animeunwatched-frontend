"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield, CheckCircle2, XCircle, Clock, FileText, Star, BookOpen, User,
  Search, RotateCcw, Inbox, ListChecks, RefreshCw,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"

type ContentType = "post" | "review" | "blog" | "user"
type ReportStatus = "open" | "resolved" | "dismissed"

interface Report {
  id: string
  contentType: ContentType
  reporter: string
  targetPreview: string
  reason: string
  date: string
  status: ReportStatus
}

const MOCK_REPORTS: Report[] = [
  {
    id: "r1",
    contentType: "post",
    reporter: "sakura_otaku",
    targetPreview: "This anime is absolute garbage and anyone who likes it is…",
    reason: "Hate speech / harassment",
    date: "2026-05-08",
    status: "open",
  },
  {
    id: "r2",
    contentType: "review",
    reporter: "yuki_sama",
    targetPreview: "10/10 — best anime ever [contains major spoilers without tags]",
    reason: "Unmarked spoilers",
    date: "2026-05-07",
    status: "open",
  },
  {
    id: "r3",
    contentType: "blog",
    reporter: "hinata_fan99",
    targetPreview: "Top 10 Anime of 2025 — click this link to download free episodes…",
    reason: "Spam / external links",
    date: "2026-05-07",
    status: "resolved",
  },
  {
    id: "r4",
    contentType: "user",
    reporter: "narutouzumaki",
    targetPreview: "@fakemod2025 — impersonating a moderator",
    reason: "Impersonation",
    date: "2026-05-06",
    status: "open",
  },
  {
    id: "r5",
    contentType: "post",
    reporter: "lelouch_vi",
    targetPreview: "Anyone who hasn't watched Code Geass has no taste and should…",
    reason: "Toxic behaviour",
    date: "2026-05-06",
    status: "dismissed",
  },
  {
    id: "r6",
    contentType: "review",
    reporter: "mikasa_fan",
    targetPreview: "1/10 — I didn't watch it but I hate the fandom so…",
    reason: "Misleading / bad faith review",
    date: "2026-05-05",
    status: "open",
  },
  {
    id: "r7",
    contentType: "blog",
    reporter: "gojo_sensei",
    targetPreview: "How to pirate every anime for free in 2026 — full guide…",
    reason: "Promoting piracy",
    date: "2026-05-05",
    status: "resolved",
  },
  {
    id: "r8",
    contentType: "user",
    reporter: "itachi_uchiha",
    targetPreview: "@sp4mbot — bot account spamming club threads",
    reason: "Bot / automated spam",
    date: "2026-05-04",
    status: "dismissed",
  },
]

type FilterTab = "all" | ReportStatus

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all",       label: "All"       },
  { id: "open",      label: "Open"      },
  { id: "resolved",  label: "Resolved"  },
  { id: "dismissed", label: "Dismissed" },
]

const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; color: string; tile: string; icon: typeof FileText }> = {
  post:   { label: "Post",   color: "bg-sky-500/15 text-sky-300 border-sky-500/25",        tile: "bg-sky-500/10 text-sky-300",        icon: FileText },
  review: { label: "Review", color: "bg-amber-500/15 text-amber-300 border-amber-500/25",  tile: "bg-amber-500/10 text-amber-300",    icon: Star     },
  blog:   { label: "Blog",   color: "bg-violet-500/15 text-violet-300 border-violet-500/25", tile: "bg-violet-500/10 text-violet-300", icon: BookOpen },
  user:   { label: "User",   color: "bg-rose-500/15 text-rose-300 border-rose-500/25",      tile: "bg-rose-500/10 text-rose-300",      icon: User     },
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  open:      { label: "Open",      color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25" },
  resolved:  { label: "Resolved",  color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  dismissed: { label: "Dismissed", color: "bg-surface-2 text-muted border-border" },
}

function relativeDate(dateStr: string): string {
  const then = new Date(dateStr)
  if (Number.isNaN(then.getTime())) return dateStr
  const days = Math.round((Date.now() - then.getTime()) / 86_400_000)
  if (days <= 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function ModerationPage() {
  // Try real admin reports
  const { data: adminData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => api<{ data: Array<{ id: string; targetType: string; reason: string; status: string; createdAt: string; reporter: { username: string }; targetId: string }> }>("/admin/reports").catch(() => ({ data: [] })),
    retry: false,
  })
  const apiReports: Report[] = useMemo(() =>
    (adminData?.data ?? []).map(r => ({
      id: r.id,
      contentType: (r.targetType as ContentType) || "post",
      reporter: r.reporter?.username ?? "anonymous",
      targetPreview: `Content ID: ${r.targetId.slice(0, 20)}`,
      reason: r.reason,
      date: new Date(r.createdAt).toISOString().split("T")[0],
      status: (r.status?.toLowerCase() as ReportStatus) || "open",
    }))
  , [adminData])
  const { push } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")
  const [query, setQuery] = useState("")
  void MOCK_REPORTS

  // Sync real API data when it arrives
  useEffect(() => {
    setReports(apiReports)
  }, [apiReports])

  const total     = reports.length
  const open      = reports.filter(r => r.status === "open").length
  const resolved  = reports.filter(r => r.status === "resolved").length
  const dismissed = reports.filter(r => r.status === "dismissed").length
  const handled   = resolved + dismissed
  const clearRate = total === 0 ? 0 : Math.round((handled / total) * 100)

  const tabCounts: Record<FilterTab, number> = {
    all: total, open, resolved, dismissed,
  }

  const filtered = useMemo(() => {
    const byStatus = activeFilter === "all" ? reports : reports.filter(r => r.status === activeFilter)
    const q = query.trim().toLowerCase()
    if (!q) return byStatus
    return byStatus.filter(r =>
      r.reporter.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.targetPreview.toLowerCase().includes(q),
    )
  }, [reports, activeFilter, query])

  const resolve = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" as ReportStatus } : r))
    push("Report resolved.", "success")
  }

  const dismiss = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "dismissed" as ReportStatus } : r))
    push("Report dismissed.", "info")
  }

  const reopen = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "open" as ReportStatus } : r))
    push("Report reopened.", "info")
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 pb-32">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-accent-bright/60 mb-2">
            Admin Panel
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
            Moderation Queue
          </h1>
          <p className="text-sm text-muted font-medium mt-2 max-w-md">
            Review reported content and keep the community safe. Resolve to action, dismiss to clear.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border text-muted text-[10px] font-black uppercase tracking-widest hover:text-foreground hover:border-border-hover transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} /> Sync
          </button>
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-black uppercase tracking-widest">
            <Shield size={13} /> MOD
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total"     count={total}     icon={ListChecks}  color="text-foreground" bg="bg-surface border-border"                  share={total} of={total} />
        <StatCard label="Open"      count={open}      icon={Clock}       color="text-yellow-400" bg="bg-yellow-500/[0.07] border-yellow-500/15"  share={open} of={total} />
        <StatCard label="Resolved"  count={resolved}  icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/[0.07] border-emerald-500/15" share={resolved} of={total} />
        <StatCard label="Dismissed" count={dismissed} icon={XCircle}     color="text-muted"      bg="bg-surface-2 border-border"                share={dismissed} of={total} />
      </div>

      {/* Resolution bar */}
      <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-surface border border-border">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-subtle">Resolution rate</span>
            <span className="text-xs font-black text-foreground tabular-nums">{clearRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${clearRate}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-subtle whitespace-nowrap">
          {handled}/{total || 0} handled
        </p>
      </div>

      {/* Toolbar: filter tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface border border-border">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeFilter === tab.id
                  ? "bg-accent text-background shadow-lg shadow-accent/20"
                  : "text-muted hover:text-foreground hover:bg-surface-2"
              }`}
            >
              {tab.label}
              <span className={`min-w-5 px-1.5 py-0.5 rounded-md text-[9px] tabular-nums leading-none flex items-center justify-center ${
                activeFilter === tab.id ? "bg-background/25 text-background" : "bg-surface-2 text-subtle"
              }`}>
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search reporter, reason…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-subtle font-medium focus:outline-none focus:border-border-hover transition-all"
          />
        </div>
      </div>

      {/* Report list */}
      <div className="space-y-3">
        {isLoading ? (
          <SkeletonList />
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="p-4 rounded-2xl bg-surface border border-border mb-4">
                  <Inbox size={28} className="text-subtle" />
                </div>
                <p className="text-foreground text-sm font-black">
                  {query ? "No reports match your search." : "Nothing to moderate here."}
                </p>
                <p className="text-subtle text-xs font-bold mt-1">
                  {query ? "Try a different keyword." : "The queue is clear — nice work."}
                </p>
              </motion.div>
            )}

            {filtered.map(report => {
              const ct       = CONTENT_TYPE_CONFIG[report.contentType]
              const st       = STATUS_CONFIG[report.status]
              const TypeIcon = ct.icon

              return (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-surface border border-border hover:border-border-hover hover:bg-white/[0.025] transition-all"
                >
                  {/* Content type tile */}
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${ct.tile}`}>
                    <TypeIcon size={18} />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wider ${ct.color}`}>
                        {ct.label}
                      </span>
                      <span className="text-sm font-black text-foreground">@{report.reporter}</span>
                      <span className="text-xs text-subtle font-medium">reported this</span>
                    </div>
                    <p className="text-sm text-muted italic leading-snug line-clamp-2">
                      &ldquo;{report.targetPreview}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-subtle font-bold uppercase tracking-wider">
                      <span className="text-rose-300/80">{report.reason}</span>
                      <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
                      <span>{relativeDate(report.date)}</span>
                    </div>
                  </div>

                  {/* Actions + status */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    {report.status === "open" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => resolve(report.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
                        >
                          <CheckCircle2 size={12} /> Resolve
                        </button>
                        <button
                          onClick={() => dismiss(report.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-muted text-[10px] font-black uppercase tracking-wider hover:text-foreground hover:border-border-hover transition-all"
                        >
                          <XCircle size={12} /> Dismiss
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${st.color}`}>
                          {st.label}
                        </span>
                        <button
                          onClick={() => reopen(report.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-subtle hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                        >
                          <RotateCcw size={10} /> Reopen
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label, count, icon: Icon, color, bg, share, of,
}: {
  label: string
  count: number
  icon: typeof Clock
  color: string
  bg: string
  share: number
  of: number
}) {
  const pct = of === 0 ? 0 : Math.round((share / of) * 100)
  return (
    <div className={`p-5 rounded-2xl border ${bg} transition-all hover:border-border-hover`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-black/30 ${color}`}>
          <Icon size={18} />
        </div>
        {of > 0 && (
          <span className="text-[10px] font-black tabular-nums text-subtle">{pct}%</span>
        )}
      </div>
      <p className="text-3xl font-black text-foreground tracking-tighter leading-none">{count}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-subtle mt-1.5">{label}</p>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-5 rounded-2xl bg-surface border border-border animate-pulse"
        >
          <div className="w-11 h-11 rounded-xl bg-surface-2 flex-shrink-0" />
          <div className="flex-1 space-y-2.5 pt-1">
            <div className="h-3 w-40 rounded bg-surface-2" />
            <div className="h-3 w-3/4 rounded bg-surface-2" />
            <div className="h-2.5 w-32 rounded bg-surface-2" />
          </div>
          <div className="h-8 w-24 rounded-xl bg-surface-2 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}
