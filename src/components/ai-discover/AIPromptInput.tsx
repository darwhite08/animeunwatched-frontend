"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Loader2 } from "lucide-react"

const suggestions = [
  "Overpowered MC who hides strength",
  "Dark psychological thriller under 24 episodes",
  "Romance with happy ending",
  "Underrated hidden gems",
  "Anime like Demon Slayer but darker"
]

export default function AIPromptInput() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)

    // TODO: connect to API
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 overflow-hidden">
      
      {/* subtle top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 text-indigo-400">
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-medium tracking-wide">
          AI Powered Discovery
        </span>
      </div>

      {/* Textarea */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the anime you want to watch..."
        rows={3}
        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm md:text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 resize-none transition-all duration-200"
      />

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mt-5">
        {suggestions.map((text) => (
          <button
            key={text}
            onClick={() => setPrompt(text)}
            className="px-3 py-1.5 text-xs rounded-full border border-white/10 text-white/60 hover:text-white hover:border-indigo-400/40 hover:bg-indigo-600/10 transition-all duration-200 active:scale-95"
          >
            {text}
          </button>
        ))}
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all rounded-xl py-3 font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Find Anime
          </>
        )}
      </motion.button>
    </div>
  )
}