"use client"

import { motion } from "framer-motion"
import { Link2, Lock, Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { useAuthStore } from "@/stores/auth.store"

interface ConnectedProvider {
  id: string
  provider: "google" | "apple"
  createdAt: string
}

const PROVIDER_META: Record<string, { label: string; box: string }> = {
  google: { label: "Google", box: "bg-white" },
  apple:  { label: "Apple",  box: "bg-black border border-white/15" },
}

/* Official provider marks (used on Sign-in-with buttons). */
function GoogleLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  )
}
function AppleLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  )
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
              <div className={`h-12 w-12 rounded-2xl ${meta.box} flex items-center justify-center shrink-0`}>
                {providerKey === "google" ? <GoogleLogo /> : <AppleLogo />}
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
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 shrink-0">
                  <Lock size={11} /> Connected
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
