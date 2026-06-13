"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Code2, Shield, Terminal, Copy, Check, ChevronRight,
  Zap, BookOpen, ExternalLink,
} from "lucide-react"

/* ─── Endpoint table ─── */
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

interface Endpoint {
  method: HttpMethod
  path: string
  description: string
  auth?: boolean
}

const ENDPOINTS: Endpoint[] = [
  { method: "GET",  path: "/api/v1/health",             description: "Health check — confirms the API is alive"         },
  { method: "GET",  path: "/api/v1/anime",              description: "Browse the anime catalog with filters & pagination" },
  { method: "GET",  path: "/api/v1/anime/:malId",       description: "Full anime detail by MAL ID"                       },
  { method: "GET",  path: "/api/v1/anime/search?q=",    description: "Full-text search across titles, studios, genres"   },
  { method: "POST", path: "/api/v1/auth/login",         description: "Authenticate and receive a JWT access token"       },
  { method: "GET",  path: "/api/v1/users/:username",    description: "Public profile — watchlist stats, bio, social"      , auth: false },
  { method: "GET",  path: "/api/v1/posts/discover",     description: "Trending community posts feed"                     },
  { method: "GET",  path: "/api/v1/search?q=",          description: "Cross-entity search: anime, users, clubs, blogs"   },
  { method: "GET",  path: "/api/v1/analytics/stats",    description: "Aggregated platform statistics"                    },
]

const METHOD_STYLE: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  GET:    { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  POST:   { bg: "bg-accent/10",  text: "text-accent-bright",  border: "border-accent/20"  },
  PATCH:  { bg: "bg-accent/10",   text: "text-accent-bright",   border: "border-accent/20"   },
  DELETE: { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20"    },
}

/* ─── Code blocks ─── */
const AUTH_EXAMPLE = `// Every protected request needs a Bearer token
const response = await fetch("https://api.kaiveron.com/api/v1/users/me", {
  headers: {
    Authorization: \`Bearer \${accessToken}\`,
    "Content-Type": "application/json",
  },
  credentials: "include", // sends httpOnly refresh cookie
})

const { user } = await response.json()`

const CURL_EXAMPLE = `curl -X GET "https://api.kaiveron.com/api/v1/analytics/top-anime" \\
  -H "Accept: application/json"

# Response:
# {
#   "data": [
#     { "malId": 1, "title": "Fullmetal Alchemist: Brotherhood", "score": 9.1, "type": "TV" },
#     { "malId": 2, "title": "Steins;Gate", "score": 9.0, "type": "TV" },
#     ...
#   ]
# }`

const OPENAPI_URL = "/api/v1/openapi.json"

/* ─── Copy button ─── */
function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-muted hover:text-muted transition-all active:scale-95"
    >
      {copied ? (
        <><Check size={11} className="text-emerald-400" /> Copied</>
      ) : (
        <><Copy size={11} /> {label}</>
      )}
    </button>
  )
}

/* ─── Code block ─── */
function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="relative rounded-2xl bg-surface border border-border overflow-hidden">
      {label && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <span className="text-[10px] font-black uppercase tracking-widest text-subtle">{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className="p-5 overflow-x-auto text-xs text-muted leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  )
}

/* ─── Page ─── */
export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">

      {/* ── Header ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/7 blur-[130px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <Code2 size={18} className="text-accent-bright" />
            </div>
            <span className="px-3 py-1 rounded-full bg-accent/15 border border-accent/25 text-xs font-black font-mono text-accent-bright">
              v1.0.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.95] text-foreground mb-5"
          >
            Developer<span className="text-accent-bright"> API</span><span className="text-foreground">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted text-base max-w-2xl leading-relaxed"
          >
            Build anime apps on the Kaiveron infrastructure. Access the full catalog,
            community data, and analytics via a clean REST API with JWT authentication.
          </motion.p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-14 pt-14">

        {/* ── Authentication ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Shield size={16} className="text-violet-400" />
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic text-foreground">
              Authentication
            </h2>
          </div>

          <p className="text-sm text-muted leading-relaxed mb-5">
            Protected endpoints require a <span className="font-mono text-accent-bright text-xs">Bearer</span> token
            in the <span className="font-mono text-accent-bright text-xs">Authorization</span> header.
            Obtain a token via <span className="font-mono text-accent-bright text-xs">POST /api/v1/auth/login</span>.
            Tokens expire in 15 minutes — your client should use the httpOnly refresh cookie
            (<span className="font-mono text-accent-bright text-xs">credentials: &quot;include&quot;</span>) to rotate automatically.
          </p>

          <CodeBlock code={AUTH_EXAMPLE} label="Bearer auth example — JavaScript" />
        </motion.section>

        {/* ── Endpoint Reference ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <BookOpen size={16} className="text-accent-bright" />
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic text-foreground">
              Endpoint Reference
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            {/* Table header — hidden on mobile (rows stack instead) */}
            <div className="hidden sm:grid grid-cols-[80px_1fr_1fr] gap-4 px-5 py-3 border-b border-border bg-white/[0.015]">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Method</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Endpoint</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Description</span>
            </div>

            {/* Rows — stacked on mobile, 3-col grid on sm+ */}
            {ENDPOINTS.map((ep, i) => {
              const m = METHOD_STYLE[ep.method]
              return (
                <div
                  key={ep.path}
                  className={`flex flex-col gap-2 sm:grid sm:grid-cols-[80px_1fr_1fr] sm:gap-4 sm:items-start px-4 sm:px-5 py-4 transition-colors hover:bg-surface ${
                    i < ENDPOINTS.length - 1 ? "border-b border-white/4" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 sm:contents">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg border text-[9px] font-black font-mono tracking-widest w-fit shrink-0 ${m.bg} ${m.text} ${m.border}`}>
                      {ep.method}
                    </span>
                    <code className="text-xs font-mono text-muted break-all leading-relaxed">
                      {ep.path}
                    </code>
                  </div>
                  <span className="text-xs text-muted leading-relaxed">{ep.description}</span>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* ── Curl example ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Terminal size={16} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic text-foreground">
              Quick Example
            </h2>
          </div>

          <CodeBlock code={CURL_EXAMPLE} label="cURL — Fetch top anime" />
        </motion.section>

        {/* ── OpenAPI badge ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="rounded-2xl border border-accent/20 bg-accent/5 p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        >
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-accent/15 border border-accent/25">
              <ExternalLink size={16} className="text-accent-bright" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Full OpenAPI Specification</p>
              <p className="text-xs text-subtle mt-0.5 font-mono">{OPENAPI_URL}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CopyButton text={OPENAPI_URL} label="Copy URL" />
            <a
              href={OPENAPI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center min-h-11 gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-bright text-xs font-black uppercase tracking-widest text-foreground transition-all active:scale-95"
            >
              Open Spec <ChevronRight size={12} />
            </a>
          </div>
        </motion.section>

        {/* ── SDKs ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <Zap size={16} className="text-accent-bright" />
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic text-foreground">
              SDKs
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-7 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-black uppercase tracking-widest text-accent-bright">
                Coming Soon
              </span>
              <p className="text-sm font-black text-muted">TypeScript SDK</p>
            </div>
            <p className="text-sm text-subtle leading-relaxed max-w-xl">
              An official TypeScript / JavaScript SDK is in development. It will provide type-safe
              wrappers for every endpoint, built-in token refresh, and React hooks for common queries.
              Star the repo to get notified on launch.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-subtle font-mono mt-2">
              <Code2 size={10} className="text-accent/50" />
              npm install @kaiveron/sdk <span className="text-subtle">— arriving Q3 2026</span>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  )
}
