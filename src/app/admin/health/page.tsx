"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { PageWrap } from "../page"

interface Health {
  uptime: number
  db: { status: string; latencyMs: number }
  totals: { users: number; posts: number; anime: number; clubs: number; reviews: number; blogs: number }
  deploy: { commit: string; env: string }
  ts: string
}

export default function AdminHealthPage() {
  const { data, isLoading, error } = useQuery<Health>({
    queryKey: ["admin", "health"],
    queryFn:  () => api<Health>("/admin/health"),
    refetchInterval: 10_000,
  })

  return (
    <PageWrap title="System health" subtitle="Live backend signals + AWS CloudWatch link">
      {isLoading && <div className="text-sm text-subtle">Querying backend…</div>}
      {error    && <div className="text-sm text-red-300">Backend unreachable: {(error as Error).message}</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Tile label="DB status"      value={data.db.status} good={data.db.status === "ok"} />
            <Tile label="DB latency"     value={`${data.db.latencyMs} ms`} good={data.db.latencyMs < 100} />
            <Tile label="App uptime"     value={formatUptime(data.uptime)} />
            <Tile label="Environment"    value={data.deploy.env} />
          </div>

          <section className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-accent-bright/60 mb-3">Totals</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Stat label="Users"   value={data.totals.users} />
              <Stat label="Posts"   value={data.totals.posts} />
              <Stat label="Anime"   value={data.totals.anime} />
              <Stat label="Clubs"   value={data.totals.clubs} />
              <Stat label="Reviews" value={data.totals.reviews} />
              <Stat label="Blogs"   value={data.totals.blogs} />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-accent-bright/60 mb-3">Deploy</h2>
            <div className="border border-foreground/10 rounded-md p-4 font-mono text-xs space-y-1">
              <div className="text-subtle">commit: <span className="text-foreground/80">{data.deploy.commit}</span></div>
              <div className="text-subtle">env:    <span className="text-foreground/80">{data.deploy.env}</span></div>
              <div className="text-subtle">last:   <span className="text-foreground/80">{new Date(data.ts).toLocaleString()}</span></div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-accent-bright/60 mb-3">Operator links</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a target="_blank" rel="noopener noreferrer" className="text-accent-bright hover:underline"
                   href="https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/kaiveron-golden-signals">
                  CloudWatch — golden signals dashboard →
                </a>
              </li>
              <li>
                <a target="_blank" rel="noopener noreferrer" className="text-accent-bright hover:underline"
                   href="https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:">
                  CloudWatch — alarms →
                </a>
              </li>
              <li>
                <a target="_blank" rel="noopener noreferrer" className="text-accent-bright hover:underline"
                   href="https://us-east-1.console.aws.amazon.com/apprunner/home?region=us-east-1#/services">
                  App Runner — backend service →
                </a>
              </li>
              <li>
                <a target="_blank" rel="noopener noreferrer" className="text-accent-bright hover:underline"
                   href="https://us-east-1.console.aws.amazon.com/rds/home?region=us-east-1#databases:">
                  RDS — database →
                </a>
              </li>
              <li>
                <a target="_blank" rel="noopener noreferrer" className="text-accent-bright hover:underline"
                   href="https://vercel.com/dashboard">
                  Vercel — frontend deploys →
                </a>
              </li>
            </ul>
          </section>
        </>
      )}
    </PageWrap>
  )
}

function Tile({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className={[
      "border rounded-md p-4",
      good === true  ? "border-green-500/40 bg-green-500/5" :
      good === false ? "border-red-500/40 bg-red-500/5"     :
                       "border-foreground/10",
    ].join(" ")}>
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-subtle/80">{label}</div>
      <div className="text-xl font-bold mt-2">{value}</div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-foreground/10 rounded-md p-4">
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-subtle/80">{label}</div>
      <div className="text-2xl font-black tabular-nums mt-2">{value.toLocaleString()}</div>
    </div>
  )
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}
