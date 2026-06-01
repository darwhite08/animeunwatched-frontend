"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { PageWrap } from "../page"

interface AuditRow {
  id:        string
  type:      string
  userId:    string | null
  ipAddress: string | null
  userAgent: string | null
  metadata:  Record<string, unknown> | null
  createdAt: string
  user: null | { id: string; username: string; displayName: string; avatarUrl: string | null }
}
interface AuditPage {
  data: AuditRow[]
  meta: { total: number; page: number; limit: number; pages: number }
}

const TYPE_GROUPS = [
  { label: "All",          value: "" },
  { label: "Auth",         value: "login_success" },
  { label: "Failed login", value: "login_failed" },
  { label: "Account del",  value: "account_deleted" },
  { label: "Moderation",   value: "mod_action_applied" },
  { label: "Role changes", value: "role_changed" },
]

export default function AdminAuditPage() {
  const [type, setType] = useState("")
  const [page, setPage] = useState(1)

  const params = new URLSearchParams()
  if (type) params.set("type", type)
  params.set("page",  String(page))
  params.set("limit", "50")

  const { data, isLoading } = useQuery<AuditPage>({
    queryKey: ["admin", "audit", { type, page }],
    queryFn:  () => api<AuditPage>(`/admin/audit?${params.toString()}`),
  })

  return (
    <PageWrap title="Audit log" subtitle="All security-relevant events. Append-only.">
      <div className="flex flex-wrap gap-2 mb-6">
        {TYPE_GROUPS.map((g) => (
          <button
            key={g.value || "all"}
            onClick={() => { setType(g.value); setPage(1) }}
            className={[
              "px-3 py-1.5 text-xs font-mono uppercase tracking-[0.2em] rounded-md border transition-colors",
              type === g.value
                ? "border-accent-bright/60 bg-accent-bright/10 text-accent-bright"
                : "border-foreground/10 text-subtle hover:border-foreground/30",
            ].join(" ")}
          >
            {g.label}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-sm text-subtle">Loading audit log…</div>}

      <div className="border border-foreground/10 rounded-md overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-foreground/5 text-[10px] font-mono uppercase tracking-[0.2em] text-subtle">
            <tr>
              <th className="text-left px-3 py-2.5 w-44">When</th>
              <th className="text-left px-3 py-2.5 w-44">Event</th>
              <th className="text-left px-3 py-2.5">Actor</th>
              <th className="text-left px-3 py-2.5">IP</th>
              <th className="text-left px-3 py-2.5">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((e) => (
              <tr key={e.id} className="border-t border-foreground/5">
                <td className="px-3 py-2.5 text-subtle font-mono whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2.5">
                  <code className="text-accent-bright/80">{e.type}</code>
                </td>
                <td className="px-3 py-2.5 text-foreground/80">
                  {e.user
                    ? <>@{e.user.username}</>
                    : <span className="text-subtle/60">{e.userId ?? "—"}</span>
                  }
                </td>
                <td className="px-3 py-2.5 text-subtle font-mono">{e.ipAddress ?? "—"}</td>
                <td className="px-3 py-2.5 text-subtle">
                  {e.metadata
                    ? <code className="text-[10px]">{JSON.stringify(e.metadata)}</code>
                    : "—"
                  }
                </td>
              </tr>
            ))}
            {data?.data.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-12 text-center text-sm text-subtle">No events match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="flex items-center justify-between mt-4 text-xs text-subtle">
          <div>{data.meta.total.toLocaleString()} total · page {data.meta.page} of {data.meta.pages}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 border border-foreground/10 rounded-md hover:bg-foreground/5 disabled:opacity-30">Prev</button>
            <button onClick={() => setPage(p => Math.min(data.meta.pages, p + 1))} disabled={page >= data.meta.pages}
              className="px-3 py-1.5 border border-foreground/10 rounded-md hover:bg-foreground/5 disabled:opacity-30">Next</button>
          </div>
        </div>
      )}
    </PageWrap>
  )
}
