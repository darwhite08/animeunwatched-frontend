"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { PageWrap } from "../page"

interface AdminUser {
  id: string
  username: string
  displayName: string
  email: string
  role: "USER" | "MOD" | "ADMIN"
  reputation: number
  isBanned: boolean
  avatarUrl: string | null
  createdAt: string
  _count: { posts: number; followers: number; following: number }
}
interface UserPage {
  data: AdminUser[]
  meta: { total: number; page: number; limit: number; pages: number }
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [role, setRole]     = useState<string>("")
  const [banned, setBanned] = useState<string>("")
  const [page, setPage]     = useState(1)

  const qc = useQueryClient()

  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (role)   params.set("role", role)
  if (banned) params.set("banned", banned)
  params.set("page",  String(page))
  params.set("limit", "25")

  const { data, isLoading, error } = useQuery<UserPage>({
    queryKey: ["admin", "users", { search, role, banned, page }],
    queryFn:  () => api<UserPage>(`/admin/users?${params.toString()}`),
  })

  const banMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      api(`/admin/users/${userId}/ban`, { method: "POST", body: JSON.stringify({ reason }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  })

  const unbanMutation = useMutation({
    mutationFn: (userId: string) =>
      api(`/admin/users/${userId}/unban`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  })

  return (
    <PageWrap title="Users" subtitle={`${data?.meta.total ?? 0} total`}>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search username / email / display name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 min-w-[240px] px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-md focus:outline-none focus:border-accent-bright/60"
        />
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-md"
        >
          <option value="">Any role</option>
          <option value="USER">User</option>
          <option value="MOD">Mod</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={banned}
          onChange={(e) => { setBanned(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-md"
        >
          <option value="">Any status</option>
          <option value="false">Active</option>
          <option value="true">Banned</option>
        </select>
      </div>

      {isLoading && <div className="text-sm text-subtle">Loading users…</div>}
      {error && <div className="text-sm text-red-300">Failed to load: {(error as Error).message}</div>}

      {data && (
        <>
          <div className="border border-foreground/10 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-foreground/5 text-[10px] font-mono uppercase tracking-[0.2em] text-subtle">
                <tr>
                  <th className="text-left px-4 py-2.5">Account</th>
                  <th className="text-left px-4 py-2.5">Role</th>
                  <th className="text-right px-4 py-2.5">Rep</th>
                  <th className="text-right px-4 py-2.5">Posts</th>
                  <th className="text-right px-4 py-2.5">Followers</th>
                  <th className="text-left px-4 py-2.5">Joined</th>
                  <th className="text-right px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((u) => (
                  <tr key={u.id} className="border-t border-foreground/5 hover:bg-foreground/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-mono uppercase text-foreground/60 overflow-hidden">
                          {u.avatarUrl
                            ? /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : u.username.slice(0, 2)
                          }
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground truncate">
                            {u.displayName}
                            {u.isBanned && (
                              <span className="ml-2 text-[9px] font-mono uppercase tracking-[0.2em] text-red-300 border border-red-500/40 px-1.5 py-0.5 rounded">
                                Banned
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-subtle truncate">@{u.username} · {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={[
                        "px-2 py-1 rounded text-[10px] font-mono uppercase tracking-[0.2em]",
                        u.role === "ADMIN" ? "bg-accent-bright/10 text-accent-bright" :
                        u.role === "MOD"   ? "bg-blue-400/10 text-blue-300" :
                                             "bg-foreground/5 text-subtle",
                      ].join(" ")}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground/80">{u.reputation}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-subtle">{u._count.posts}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-subtle">{u._count.followers}</td>
                    <td className="px-4 py-3 text-[11px] text-subtle">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== "ADMIN" && (
                        u.isBanned ? (
                          <button
                            onClick={() => unbanMutation.mutate(u.id)}
                            disabled={unbanMutation.isPending}
                            className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent-bright/80 hover:text-accent-bright disabled:opacity-50"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = window.prompt(`Ban @${u.username}? Reason (optional):`)
                              if (reason !== null) banMutation.mutate({ userId: u.id, reason })
                            }}
                            disabled={banMutation.isPending}
                            className="text-[11px] font-mono uppercase tracking-[0.2em] text-red-300/80 hover:text-red-300 disabled:opacity-50"
                          >
                            Ban
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {data.data.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-subtle">No users match.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-subtle">
            <div>Page {data.meta.page} of {data.meta.pages}</div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 border border-foreground/10 rounded-md hover:bg-foreground/5 disabled:opacity-30"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.meta.pages, p + 1))}
                disabled={page >= data.meta.pages}
                className="px-3 py-1.5 border border-foreground/10 rounded-md hover:bg-foreground/5 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </PageWrap>
  )
}
