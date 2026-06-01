"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, Download } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { api } from "@/lib/api/client"

type ImportStatus = "idle" | "parsing" | "importing" | "done" | "error"

interface ParsedEntry {
  malId: number
  title: string
  status: string
  score: number
  episodesSeen: number
}

function parseMalXml(xml: string): ParsedEntry[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, "text/xml")
  const animes = doc.querySelectorAll("anime")
  const entries: ParsedEntry[] = []

  animes.forEach(anime => {
    const malId = parseInt(anime.querySelector("series_animedb_id")?.textContent ?? "0")
    const title = anime.querySelector("series_title")?.textContent ?? ""
    const status = anime.querySelector("my_status")?.textContent ?? ""
    const score = parseInt(anime.querySelector("my_score")?.textContent ?? "0")
    const episodesSeen = parseInt(anime.querySelector("my_watched_episodes")?.textContent ?? "0")

    if (malId) {
      // Map MAL statuses to our format
      const statusMap: Record<string, string> = {
        "Watching": "WATCHING",
        "Completed": "COMPLETED",
        "On-Hold": "ON_HOLD",
        "Dropped": "DROPPED",
        "Plan to Watch": "PLAN_TO_WATCH",
      }
      entries.push({ malId, title, status: statusMap[status] ?? "PLAN_TO_WATCH", score, episodesSeen })
    }
  })

  return entries
}

export default function ImportPage() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const [status, setStatus] = useState<ImportStatus>("idle")
  const [entries, setEntries] = useState<ParsedEntry[]>([])
  const [imported, setImported] = useState(0)
  const [errors, setErrors] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".xml")) {
      push("Please upload a MAL XML export file", "error")
      return
    }

    setStatus("parsing")
    try {
      const text = await file.text()
      const parsed = parseMalXml(text)
      setEntries(parsed)

      if (parsed.length === 0) {
        push("No anime found in the file", "error")
        setStatus("error")
        return
      }

      setStatus("importing")
      let ok = 0, fail = 0

      // Import in batches of 10 to avoid rate limits
      for (let i = 0; i < parsed.length; i += 10) {
        const batch = parsed.slice(i, i + 10)
        await Promise.all(
          batch.map(async entry => {
            try {
              await api(`/lists/me/${entry.malId}`, {
                method: "PUT",
                body: JSON.stringify({
                  status: entry.status,
                  score: entry.score > 0 ? entry.score : undefined,
                  episodesSeen: entry.episodesSeen,
                }),
              })
              ok++
            } catch {
              fail++
            }
          })
        )
        setImported(ok)
        setErrors(fail)
        // Small delay between batches
        if (i + 10 < parsed.length) await new Promise(r => setTimeout(r, 300))
      }

      setStatus("done")
      push(`Imported ${ok} anime successfully!`, "success")
    } catch {
      setStatus("error")
      push("Failed to parse the file. Make sure it's a valid MAL XML export.", "error")
    }
  }, [push])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] mb-1"
          style={{ color: "rgba(245,158,11,0.5)" }}>Import</p>
        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">
          Import from MAL / AniList
        </h2>
        <p className="text-sm text-muted mt-2">
          Bring your existing anime list from MyAnimeList or AniList into Kaiveron.
          Your progress, scores, and statuses are all preserved.
        </p>
      </div>

      {/* How to export guide */}
      <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">How to export your list</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-black text-accent-bright">MyAnimeList (MAL)</p>
            <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
              <li>Go to myanimelist.net → Profile</li>
              <li>Click "Export" in the side panel</li>
              <li>Choose "Anime List" → Export</li>
              <li>Upload the downloaded .xml file below</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-accent-bright">AniList</p>
            <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
              <li>Go to anilist.co → Profile Settings</li>
              <li>Scroll to "Import / Export"</li>
              <li>Click "Export Anime List" (downloads XML)</li>
              <li>Upload the downloaded file below</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          dragOver ? "border-accent/60 bg-accent/5" : "border-border bg-surface hover:border-white/25"
        }`}
      >
        {status === "idle" && (
          <label className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Upload size={28} className="text-accent-bright" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Drop your XML file here</p>
              <p className="text-xs text-muted mt-1">or click to browse</p>
            </div>
            <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-black"
              style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
              Choose File
            </span>
            <input type="file" accept=".xml" onChange={handleFile} className="hidden" />
          </label>
        )}

        {status === "parsing" && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-accent-bright" />
            <p className="text-sm font-black text-foreground">Parsing your list…</p>
          </div>
        )}

        {status === "importing" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={32} className="animate-spin text-accent-bright" />
            <div>
              <p className="text-sm font-black text-foreground">Importing {entries.length} anime…</p>
              <p className="text-xs text-muted mt-1">
                {imported} done · {errors} skipped
              </p>
            </div>
            <div className="w-full max-w-xs bg-surface rounded-full h-2">
              <div className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(imported + errors) / entries.length * 100}%`,
                  background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                }} />
            </div>
          </div>
        )}

        {status === "done" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={40} className="text-emerald-400" />
            <div>
              <p className="text-lg font-black text-foreground">Import complete!</p>
              <p className="text-sm text-muted mt-1">
                {imported} anime imported · {errors} skipped (not in our database yet)
              </p>
            </div>
            <button
              onClick={() => { setStatus("idle"); setEntries([]); setImported(0); setErrors(0) }}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-border text-muted hover:bg-surface transition-all"
            >
              Import Another File
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle size={40} className="text-red-400" />
            <div>
              <p className="text-sm font-black text-foreground">Import failed</p>
              <p className="text-xs text-muted mt-1">Make sure it's a valid MAL/AniList XML export</p>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-black transition-all"
              style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-surface border border-border">
        <FileText size={14} className="text-subtle shrink-0 mt-0.5" />
        <p className="text-xs text-subtle leading-relaxed">
          Import preserves your watch status, scores, and episode progress.
          Anime not yet in our database will be skipped and can be added manually.
          Your existing entries will be updated, not duplicated.
        </p>
      </div>
    </div>
  )
}
