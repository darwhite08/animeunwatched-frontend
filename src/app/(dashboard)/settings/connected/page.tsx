"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  Link2, Link2Off, Upload, Download, FileJson, FileText, Clock, CheckCircle2,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"

/* ── Types ── */
type ConnectionStatus = "disconnected" | "connecting" | "connected"

type Integration = {
  id: string
  name: string
  description: string
  logo: string
  color: string
  comingSoon?: boolean
}

/* ── Data ── */
const INTEGRATIONS: Integration[] = [
  {
    id: "mal",
    name: "MyAnimeList",
    description: "Connect to sync your existing list, ratings, and watch history from MAL.",
    logo: "MAL",
    color: "from-blue-600 to-blue-700",
  },
  {
    id: "anilist",
    name: "AniList",
    description: "Connect to sync your existing list, scores, and activity feed from AniList.",
    logo: "AL",
    color: "from-indigo-500 to-blue-600",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Show your currently watching status and share activity with Discord friends.",
    logo: "DC",
    color: "from-violet-600 to-indigo-700",
    comingSoon: true,
  },
  {
    id: "kitsu",
    name: "Kitsu",
    description: "Import your Kitsu library and follow your Kitsu friends here.",
    logo: "KI",
    color: "from-orange-500 to-amber-600",
    comingSoon: true,
  },
]

/* ── Integration card ── */
function IntegrationCard({ integration }: { integration: Integration }) {
  const { push }  = useToast()
  const [status, setStatus] = useState<ConnectionStatus>("disconnected")

  const handleConnect = async () => {
    if (integration.comingSoon) return
    if (status === "connected") {
      setStatus("disconnected")
      push(`Disconnected from ${integration.name}`, "info")
      return
    }
    setStatus("connecting")
    await new Promise((r) => setTimeout(r, 1400))
    setStatus("connected")
    push(`Connected to ${integration.name}!`, "success")
  }

  const isConnected   = status === "connected"
  const isConnecting  = status === "connecting"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/12 transition-colors"
    >
      {/* Logo */}
      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg`}>
        {integration.logo}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-black text-white">{integration.name}</p>
          {integration.comingSoon && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Clock size={8} /> Coming Soon
            </span>
          )}
          {isConnected && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[9px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={8} /> Connected
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/40 mt-0.5 leading-relaxed">{integration.description}</p>
      </div>

      {/* Action */}
      <button
        onClick={handleConnect}
        disabled={isConnecting || integration.comingSoon}
        className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
          integration.comingSoon
            ? "border border-white/8 text-white/20 cursor-not-allowed"
            : isConnected
            ? "border border-red-500/20 text-red-400 hover:bg-red-500/8 bg-transparent"
            : isConnecting
            ? "bg-indigo-600/50 text-white/60 cursor-wait"
            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.25)]"
        }`}
      >
        {isConnecting ? (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Connecting…
          </span>
        ) : isConnected ? (
          <><Link2Off size={11} /> Disconnect</>
        ) : (
          <><Link2 size={11} /> Connect</>
        )}
      </button>
    </motion.div>
  )
}

/* ── File drop zone ── */
function ImportZone() {
  const { push }      = useToast()
  const inputRef      = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    push(`Importing "${file.name}" — this may take a moment.`, "info")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    push(`Importing "${file.name}" — this may take a moment.`, "info")
    e.target.value = ""
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed px-8 py-10 text-center transition-all duration-200 ${
        dragging
          ? "border-indigo-500/60 bg-indigo-500/5"
          : "border-white/10 bg-white/[0.01] hover:border-indigo-500/30 hover:bg-white/[0.03]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xml,.json,.csv"
        className="sr-only"
        onChange={handleFileChange}
      />
      <Upload size={28} className={`mx-auto mb-3 transition-colors ${dragging ? "text-indigo-400" : "text-white/20"}`} />
      <p className="text-sm font-black uppercase italic tracking-tight text-white/60">
        Drop your export file here
      </p>
      <p className="text-[10px] text-white/25 mt-1.5">
        Supports MAL XML, AniList JSON, Kitsu CSV · Click to browse
      </p>
      {dragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl bg-indigo-500/5 flex items-center justify-center"
        >
          <p className="text-sm font-black uppercase italic tracking-widest text-indigo-400">
            Drop to Import
          </p>
        </motion.div>
      )}
    </div>
  )
}

/* ── Page ── */
export default function ConnectedAccountsPage() {
  const { push } = useToast()

  const exportAs = (fmt: "csv" | "json") => {
    push(
      fmt === "csv"
        ? "CSV export started — your file will download shortly."
        : "JSON export started — your file will download shortly.",
      "success",
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-10">

      {/* Header */}
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-2">Settings</p>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
          Connected Accounts
        </h1>
        <p className="text-sm text-white/35 mt-2">
          Link external anime services to sync your data and activity.
        </p>
      </div>

      {/* Integrations */}
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          Services
        </p>
        <div className="space-y-3">
          {INTEGRATIONS.map((integration, i) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <IntegrationCard integration={integration} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Import */}
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Import</p>
          <p className="text-xs text-white/30 mt-1">
            Upload an export file from MAL, AniList, or Kitsu to bring your list here.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ImportZone />
        </motion.div>
      </div>

      {/* Export */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Export</p>
          <p className="text-xs text-white/30 mt-1">
            Download a copy of your AnimeUnwatched library and data.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* CSV */}
          <button
            onClick={() => exportAs("csv")}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-emerald-500/25 hover:bg-emerald-500/5 transition-all text-left"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                Export CSV
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">Spreadsheet-ready</p>
            </div>
            <Download size={13} className="ml-auto text-white/20 group-hover:text-emerald-400 transition-colors" />
          </button>

          {/* JSON */}
          <button
            onClick={() => exportAs("json")}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-indigo-500/25 hover:bg-indigo-500/5 transition-all text-left"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <FileJson size={16} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors">
                Export JSON
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">Developer-friendly</p>
            </div>
            <Download size={13} className="ml-auto text-white/20 group-hover:text-indigo-400 transition-colors" />
          </button>
        </div>
        <p className="text-[10px] text-white/20">
          Exports include your watchlist, ratings, reviews, and post history.
        </p>
      </motion.div>
    </div>
  )
}
