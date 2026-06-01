"use client"

import { motion } from "framer-motion"
import { Link2, CheckCircle2, Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth.store"

interface ConnectedProvider {
  id: string
  provider: "google" | "apple"
  createdAt: string
}

const PROVIDER_META: Record<string, { label: string; icon: string; color: string }> = {
  google: { label: "Google",      icon: "G", color: "from-red-500 to-orange-500"  },
  apple:  { label: "Apple",       icon: "",  color: "from-gray-600 to-gray-800"   },
}

export default function ConnectedAccountsPage() {
  const isAuth = useAuthStore(s => s.isAuthenticated)

  const { data, isLoading } = useQuery({
    queryKey: ["connected-accounts"],
    queryFn:  () => api<{ providers: ConnectedProvider[] }>("/users/me/connected-accounts"),
    enabled:  isAuth,
    staleTime: 60_000,
  })

  const providers = data?.providers ?? []

  const ALL_PROVIDERS = ["google", "apple"] as const

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-accent-bright/60 mb-2">Settings · Connected</p>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">Connected Accounts</h1>
        <p className="text-xs text-subtle mt-2 flex items-center gap-2">
          <Link2 size={11} className="text-accent-bright" /> Manage OAuth providers linked to your Kaiveron account.
        </p>
      </motion.div>

      <div className="space-y-3">
        {ALL_PROVIDERS.map((providerKey, i) => {
          const meta      = PROVIDER_META[providerKey]
          const connected = providers.find(p => p.provider === providerKey)

          return (
            <motion.div key={providerKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-center gap-5 p-5 rounded-2xl border border-border bg-surface">
              {/* Provider icon */}
              <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-foreground font-black text-lg shrink-0`}>
                {meta.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground">{meta.label}</p>
                {connected ? (
                  <p className="text-[10px] text-emerald-400/70 mt-0.5">
                    Connected since {new Date(connected.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </p>
                ) : (
                  <p className="text-[10px] text-subtle mt-0.5">Not connected</p>
                )}
              </div>

              {connected ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400 shrink-0">
                  <CheckCircle2 size={10} /> Connected
                </span>
              ) : (
                <a
                  href={providerKey === "google" ? "/api/v1/auth/google/redirect" : "#"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-[9px] font-black uppercase tracking-widest text-muted hover:text-foreground hover:border-border transition-all shrink-0"
                >
                  <Plus size={10} /> Connect
                </a>
              )}
            </motion.div>
          )
        })}
      </div>

      {isLoading && (
        <p className="text-xs text-subtle text-center">Loading connected accounts…</p>
      )}

      <div className="p-5 rounded-2xl border border-border bg-surface space-y-2">
        <p className="text-xs font-black text-muted">About connected accounts</p>
        <p className="text-[10px] text-subtle leading-relaxed">
          Connected accounts let you sign in to Kaiveron using a provider without a password.
          Adding Google lets you use "Sign in with Google" on the login page.
          Your email and profile data are only read on first connection.
        </p>
      </div>
    </div>
  )
}
