"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { PageWrap } from "../page"

interface ReportRow {
  id:         string
  reporterId: string
  targetType: string
  targetId:   string
  reason:     string
  status:     "OPEN" | "RESOLVED" | "DISMISSED"
  createdAt:  string
  reporter:   { id: string; username: string; displayName: string; avatarUrl: string | null }
}

interface ReportsPage {
  data: ReportRow[]
  meta: { total: number; page: number; limit: number; pages: number }
}

export default function AdminReportsPage() {
  const [status, setStatus] = useState("OPEN")
  const [page, setPage]     = useState(1)
  const qc = useQueryClient()

  const params = new URLSearchParams()
  if (status) params.set("status", status)
  params.set("page",  String(page))
  params.set("limit", "25")

  const { data, isLoading } = useQuery<ReportsPage>({
    queryKey: ["admin", "reports", { status, page }],
    queryFn:  () => api<ReportsPage>(`/admin/reports?${params.toString()}`),
  })

  const resolve = useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: "RESOLVED" | "DISMISSED" }) =>
      api(`/admin/reports/${reportId}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reports"] }),
  })

  return (
    <PageWrap title="Moderation" subtitle="Triage user-submitted reports">
      <div className="flex gap-2 mb-6">
        {(["OPEN", "RESOLVED", "DISMISSED", ""] as const).map((s) => (
          <button
            key={s || "ALL"}
            onClick={() => { setStatus(s); setPage(1) }}
            className={[
              "px-3 py-1.5 text-xs font-mono uppercase tracking-[0.2em] rounded-md border transition-colors",
              status === s
                ? "border-accent-bright/60 bg-accent-bright/10 text-accent-bright"
                : "border-foreground/10 text-subtle hover:border-foreground/30",
            ].join(" ")}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-sm text-subtle">Loading…</div>}
      {data?.data.length === 0 && (
        <div className="text-sm text-subtle py-12 text-center border border-foreground/10 rounded-md">
          No reports in this state.
        </div>
      )}

      <div className="space-y-3">
        {data?.data.map((r) => (
          <div key={r.id} className="border border-foreground/10 rounded-md p-4 hover:border-foreground/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent-bright/80">
                    {r.targetType}
                  </span>
                  <span className="text-[10px] font-mono text-subtle">·</span>
                  <span className="text-[10px] font-mono text-subtle">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                  <span className={[
                    "ml-auto text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded",
                    r.status === "OPEN"      ? "bg-yellow-500/10 text-yellow-300" :
                    r.status === "RESOLVED"  ? "bg-green-500/10 text-green-300" :
                                               "bg-foreground/5 text-subtle",
                  ].join(" ")}>
                    {r.status}
                  </span>
                </div>

                <div className="text-sm font-medium text-foreground mb-1">
                  Reason: {r.reason}
                </div>
                <div className="text-[11px] text-subtle">
                  Target ID: <code className="text-foreground/60">{r.targetId}</code>
                </div>
                <div className="text-[11px] text-subtle mt-2">
                  Reported by{" "}
                  <span className="text-foreground/80">@{r.reporter.username}</span>
                </div>
              </div>

              {r.status === "OPEN" && (
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => resolve.mutate({ reportId: r.id, status: "RESOLVED" })}
                    disabled={resolve.isPending}
                    className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] bg-accent-bright/20 text-accent-bright rounded-md hover:bg-accent-bright/30 disabled:opacity-50"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => resolve.mutate({ reportId: r.id, status: "DISMISSED" })}
                    disabled={resolve.isPending}
                    className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] bg-foreground/5 text-subtle rounded-md hover:bg-foreground/10 disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageWrap>
  )
}
