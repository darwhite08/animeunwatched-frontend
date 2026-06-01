"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"

interface Overview {
  users:       { total: number; last7d: number; last30d: number; banned: number }
  content:     { postsTotal: number; postsLast7d: number; activitiesLast7d: number }
  engagement:  { activeUsersLast24h: number }
  moderation:  { openReports: number }
  signupChart: Array<{ day: string; count: number }>
  generatedAt: string
}

export default function AdminOverview() {
  const { data, isLoading, error } = useQuery<Overview>({
    queryKey:  ["admin", "metrics", "overview"],
    queryFn:   () => api<Overview>("/admin/metrics/overview"),
    refetchInterval: 60_000,
  })

  if (isLoading) return <PageWrap title="Overview"><Skeleton /></PageWrap>
  if (error || !data) return <PageWrap title="Overview"><ErrorMsg msg={(error as Error)?.message ?? "Load failed"} /></PageWrap>

  const chartMax = Math.max(1, ...data.signupChart.map(d => d.count))

  return (
    <PageWrap title="Overview" subtitle={`Last refreshed ${new Date(data.generatedAt).toLocaleTimeString()}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total users"   value={data.users.total} />
        <Stat label="New (7d)"      value={data.users.last7d} delta="users" />
        <Stat label="New (30d)"     value={data.users.last30d} delta="users" />
        <Stat label="Banned"        value={data.users.banned} highlight={data.users.banned > 0} />
        <Stat label="Posts total"   value={data.content.postsTotal} />
        <Stat label="Posts (7d)"    value={data.content.postsLast7d} />
        <Stat label="Activities (7d)" value={data.content.activitiesLast7d} />
        <Stat label="Active (24h)"  value={data.engagement.activeUsersLast24h} />
      </div>

      <section className="mt-8">
        <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-accent-bright/60 mb-3">
          Moderation
        </h2>
        <div className="border border-foreground/10 rounded-md p-5 flex items-center justify-between">
          <div>
            <div className="text-3xl font-black tabular-nums">{data.moderation.openReports}</div>
            <div className="text-xs text-subtle mt-1">open reports</div>
          </div>
          <a href="/admin/reports" className="text-xs font-mono uppercase tracking-[0.2em] text-accent-bright hover:underline">
            Triage →
          </a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-accent-bright/60 mb-3">
          Signups — last 14 days
        </h2>
        <div className="border border-foreground/10 rounded-md p-5">
          {data.signupChart.length === 0 ? (
            <div className="text-xs text-subtle text-center py-8">No signups in window</div>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {data.signupChart.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center group">
                  <div className="text-[9px] text-subtle/60 group-hover:text-foreground transition-colors mb-1">
                    {d.count}
                  </div>
                  <div
                    className="w-full bg-accent-bright/70 hover:bg-accent-bright transition-colors rounded-sm"
                    style={{ height: `${(d.count / chartMax) * 100}%`, minHeight: d.count > 0 ? "2px" : "0" }}
                    title={`${d.day}: ${d.count}`}
                  />
                  <div className="text-[9px] font-mono text-subtle/60 mt-1">
                    {d.day.slice(5)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageWrap>
  )
}

export function PageWrap({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="px-8 py-8 max-w-6xl">
      <header className="mb-8">
        <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-1">
          Admin
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          {title}<span style={{ color: "var(--app-accent)" }}>.</span>
        </h1>
        {subtitle && <div className="text-xs text-subtle mt-2">{subtitle}</div>}
      </header>
      {children}
    </div>
  )
}

function Stat({ label, value, delta, highlight }: { label: string; value: number; delta?: string; highlight?: boolean }) {
  return (
    <div className={[
      "border rounded-md p-4",
      highlight ? "border-red-500/40 bg-red-500/5" : "border-foreground/10",
    ].join(" ")}>
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-subtle/80">{label}</div>
      <div className="text-3xl font-black tabular-nums mt-2">{value.toLocaleString()}</div>
      {delta && <div className="text-[10px] text-subtle/60 mt-1">{delta}</div>}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 border border-foreground/10 rounded-md animate-pulse bg-foreground/5" />
      ))}
    </div>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="border border-red-500/40 bg-red-500/5 rounded-md p-4 text-sm text-red-300">
      {msg}
    </div>
  )
}
