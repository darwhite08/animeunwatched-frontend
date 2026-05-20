"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, CheckCircle2, XCircle, Clock, FileText, Star, BookOpen, User } from "lucide-react"
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

const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; color: string; icon: typeof FileText }> = {
  post:   { label: "Post",   color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",   icon: FileText },
  review: { label: "Review", color: "bg-amber-500/15 text-amber-300 border-amber-500/25",      icon: Star     },
  blog:   { label: "Blog",   color: "bg-violet-500/15 text-violet-300 border-violet-500/25",   icon: BookOpen },
  user:   { label: "User",   color: "bg-rose-500/15 text-rose-300 border-rose-500/25",         icon: User     },
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  open:      { label: "Open",      color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25" },
  resolved:  { label: "Resolved",  color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  dismissed: { label: "Dismissed", color: "bg-slate-500/15 text-slate-400 border-slate-500/25" },
}

export default function ModerationPage() {
  // Try real admin reports
  const { data: adminData } = useQuery({
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
  const [reports, setReports] = useState<Report[]>(() => apiReports.length > 0 ? apiReports : MOCK_REPORTS)
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")

  const open      = reports.filter(r => r.status === "open").length
  const resolved  = reports.filter(r => r.status === "resolved").length
  const dismissed = reports.filter(r => r.status === "dismissed").length

  const filtered =
    activeFilter === "all" ? reports : reports.filter(r => r.status === activeFilter)

  const resolve = (id: string) => {
    setReports(prev =>
      prev.map(r => r.id === id ? { ...r, status: "resolved" as ReportStatus } : r),
    )
    push("Report resolved.", "success")
  }

  const dismiss = (id: string) => {
    setReports(prev =>
      prev.map(r => r.id === id ? { ...r, status: "dismissed" as ReportStatus } : r),
    )
    push("Report dismissed.", "info")
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10 pb-32">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-amber-400/60 mb-2">
            Admin Panel
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Moderation Queue
          </h1>
        </div>
        <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-black uppercase tracking-widest">
          <Shield size={13} /> MOD
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Open"
          count={open}
          icon={Clock}
          color="text-yellow-400"
          bg="bg-yellow-500/8 border-yellow-500/15"
        />
        <StatCard
          label="Resolved"
          count={resolved}
          icon={CheckCircle2}
          color="text-emerald-400"
          bg="bg-emerald-500/8 border-emerald-500/15"
        />
        <StatCard
          label="Dismissed"
          count={dismissed}
          icon={XCircle}
          color="text-slate-400"
          bg="bg-slate-500/8 border-slate-500/15"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/8 w-fit">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeFilter === tab.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center text-white/20 text-sm font-bold"
            >
              No reports in this category.
            </motion.div>
          )}

          {filtered.map(report => {
            const ct     = CONTENT_TYPE_CONFIG[report.contentType]
            const st     = STATUS_CONFIG[report.status]
            const TypeIcon = ct.icon

            return (
              <motion.div
                key={report.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="group flex items-start gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 hover:bg-white/[0.035] transition-all"
              >
                {/* Content type badge */}
                <div className="flex-shrink-0 pt-0.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${ct.color}`}>
                    <TypeIcon size={11} /> {ct.label}
                  </span>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm text-white/80 font-medium leading-snug">
                    <span className="font-black text-white">@{report.reporter}</span>
                    <span className="text-white/40"> reported · </span>
                    <span className="italic text-white/60 truncate">&ldquo;{report.targetPreview}&rdquo;</span>
                  </p>
                  <div className="flex items-center gap-4 text-[10px] text-white/30 font-bold uppercase tracking-wider">
                    <span>{report.reason}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
                    <span>{report.date}</span>
                  </div>
                </div>

                {/* Actions + status */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {report.status !== "open" && (
                    <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${st.color}`}>
                      {st.label}
                    </span>
                  )}

                  {report.status === "open" && (
                    <>
                      <button
                        onClick={() => resolve(report.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
                      >
                        <CheckCircle2 size={12} /> Resolve
                      </button>
                      <button
                        onClick={() => dismiss(report.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[10px] font-black uppercase tracking-wider hover:bg-slate-500/20 hover:border-slate-500/40 transition-all"
                      >
                        <XCircle size={12} /> Dismiss
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StatCard({
  label, count, icon: Icon, color, bg,
}: {
  label: string
  count: number
  icon: typeof Clock
  color: string
  bg: string
}) {
  return (
    <div className={`p-6 rounded-2xl border ${bg} flex items-center gap-4`}>
      <div className={`p-3 rounded-xl bg-black/30 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-3xl font-black text-white tracking-tighter leading-none">{count}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mt-1">{label}</p>
      </div>
    </div>
  )
}
