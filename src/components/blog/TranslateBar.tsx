"use client"

import { useRef, useState } from "react"
import { Languages, Loader2, RotateCcw } from "lucide-react"
import { api } from "@/lib/api/client"
import { RichArticle, looksLikeHtml } from "@/lib/utils/markdown"
import { useToast } from "@/stores/toast.store"

const LANGS = [
  { c: "es", n: "Español" }, { c: "fr", n: "Français" }, { c: "de", n: "Deutsch" },
  { c: "pt", n: "Português" }, { c: "it", n: "Italiano" }, { c: "ja", n: "日本語" },
  { c: "ko", n: "한국어" }, { c: "zh", n: "中文" }, { c: "hi", n: "हिन्दी" },
  { c: "ar", n: "العربية" }, { c: "ru", n: "Русский" }, { c: "id", n: "Bahasa Indonesia" },
  { c: "tr", n: "Türkçe" }, { c: "vi", n: "Tiếng Việt" }, { c: "th", n: "ไทย" },
  { c: "fil", n: "Filipino" }, { c: "bn", n: "বাংলা" },
]

/** A language switcher that auto-translates the article body via /ai/translate. */
export function TranslateBar({ content }: { content: string }) {
  const { push } = useToast()
  const [lang, setLang] = useState("")
  const [translated, setTranslated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const cache = useRef<Record<string, string>>({})

  async function pick(code: string) {
    setLang(code)
    if (!code) { setTranslated(null); return }
    if (cache.current[code]) { setTranslated(cache.current[code]); return }
    setLoading(true)
    try {
      const res = await api<{ text: string; source: string }>("/ai/translate", {
        method: "POST",
        body: JSON.stringify({ text: content, targetLang: code, html: looksLikeHtml(content) }),
      })
      if (res.source === "stub") {
        push("Translation isn't enabled on this server yet.", "info")
        setLang(""); setTranslated(null)
      } else {
        cache.current[code] = res.text
        setTranslated(res.text)
      }
    } catch {
      push("Couldn't translate right now — try again.", "error")
      setLang("")
    } finally { setLoading(false) }
  }

  const shown = translated ?? content

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-white/[0.02] px-4 py-2.5">
        <Languages size={16} className="text-accent-bright" />
        <span className="text-xs font-bold text-muted">Read in</span>
        <select
          value={lang}
          onChange={(e) => pick(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none [color-scheme:dark]"
        >
          <option value="">Original</option>
          {LANGS.map((l) => <option key={l.c} value={l.c}>{l.n}</option>)}
        </select>
        {loading && <Loader2 size={14} className="animate-spin text-muted" />}
        {translated && !loading && (
          <button onClick={() => pick("")} className="ml-auto flex items-center gap-1 text-[11px] font-bold text-muted hover:text-foreground">
            <RotateCcw size={12} /> Original
          </button>
        )}
        {translated && <span className="ml-auto text-[10px] uppercase tracking-widest text-muted">Auto-translated</span>}
      </div>

      {looksLikeHtml(shown) ? (
        <RichArticle html={shown} />
      ) : (
        <div className="space-y-6 text-muted text-base leading-relaxed">
          {shown.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
        </div>
      )}
    </div>
  )
}
