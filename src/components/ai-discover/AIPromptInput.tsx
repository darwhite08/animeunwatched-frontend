"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Loader2, Command, Terminal, Cpu } from "lucide-react"

const SUGGESTIONS = [
  "Overpowered MC who hides strength",
  "Dark psychological thriller under 24 eps",
  "Romance with devastating ending",
  "Underrated hidden gems from the 2000s",
  "Anime like Demon Slayer but darker",
]

interface AIPromptInputProps {
  onSearch?: (prompt: string) => void
}

export default function AIPromptInput({ onSearch }: AIPromptInputProps) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    // Extract keyword from natural language prompt
    const KEYWORD_MAP: [string, string][] = [
      ["overpowered", "action"], ["psychological", "psychological"], ["thriller", "thriller"],
      ["romance", "romance"], ["dark fantasy", "fantasy"], ["demon slayer", "demon slayer"],
      ["hidden gem", "underrated"], ["underrated", "drama"], ["isekai", "isekai"],
      ["mecha", "mecha"], ["slice of life", "slice of life"], ["comedy", "comedy"],
      ["horror", "horror"], ["sports", "sports"], ["mystery", "mystery"],
      ["supernatural", "supernatural"], ["school", "school"], ["sci-fi", "sci-fi"],
      ["historical", "historical"], ["adventure", "adventure"],
    ]
    const lower = prompt.toLowerCase()
    let searchQuery = prompt.trim()
    for (const [key, val] of KEYWORD_MAP) {
      if (lower.includes(key)) { searchQuery = val; break }
    }
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    onSearch?.(searchQuery)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.shiftKey) && e.key === "Enter") handleSubmit()
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto group">
      <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-[2rem] blur-xl transition-opacity duration-500 ${isFocused ? "opacity-100" : "opacity-0"}`} />

      <div className="relative rounded-[1.8rem] p-2 backdrop-blur-3xl"
        style={{
          background: "linear-gradient(160deg, #0c0c18 0%, #080810 100%)",
          border: "1px solid rgba(245,158,11,0.18)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(245,158,11,0.08) inset",
        }}>
        {/* Terminal header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-2 text-indigo-400">
              <Terminal size={13} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural_Query_Interface</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-white/20 text-[9px] font-mono">
            <Command size={9} /> SHIFT+ENTER
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <textarea
              value={prompt}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Query the archives… (e.g. 'Seinen with philosophical depth and no filler')"
              rows={3}
              className="w-full bg-transparent border-none rounded-xl p-4 text-lg text-white placeholder:text-white/20 focus:outline-none resize-none font-medium leading-relaxed"
            />
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ top: 0, opacity: 0 }}
                  animate={{ top: "100%", opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 mt-4 px-2">
            {SUGGESTIONS.map((text, i) => (
              <motion.button
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setPrompt(text)}
                className="group/btn relative px-3 py-1.5 text-[10px] font-bold rounded-lg border border-white/5 text-white/40 hover:text-indigo-400 hover:border-indigo-500/20 transition-all duration-300"
              >
                <span className="relative z-10 uppercase tracking-wider">{text}</span>
              </motion.button>
            ))}
          </div>

          {/* Action row */}
          <div className="mt-5 flex items-center justify-end gap-4 px-2">
            <div className="flex-1 hidden md:flex items-center gap-3 text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">
              <Cpu size={11} />
              <span>Hardware Acceleration: ON</span>
              <div className="h-1 w-10 bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ x: [-40, 40] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-full w-4 bg-indigo-500/40" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading || !prompt.trim()}
              className="relative group/submit overflow-hidden px-8 py-3 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all font-black text-black text-xs uppercase tracking-widest"
              style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 4px 20px rgba(245,158,11,0.35)" }}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover/submit:animate-[shimmer_1.5s_infinite]" />
              <div className="relative z-10 flex items-center gap-2.5">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-black" /><span className="text-xs font-black text-black uppercase tracking-widest italic">Analyzing…</span></>
                ) : (
                  <><Sparkles className="w-4 h-4 text-black" /><span className="text-xs font-black text-black uppercase tracking-widest italic">Execute Search</span></>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
