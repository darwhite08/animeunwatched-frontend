"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

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
    if (!prompt) return
    setLoading(true)

    // TODO: connect to API
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-4 text-indigo-400">
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-medium">AI Powered Discovery</span>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the anime you want to watch..."
        rows={3}
        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition"
      />

      <div className="flex flex-wrap gap-2 mt-4">
        {suggestions.map((text) => (
          <button
            key={text}
            onClick={() => setPrompt(text)}
            className="px-3 py-1 text-xs rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition"
          >
            {text}
          </button>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition rounded-xl py-3 font-medium flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="animate-pulse">Thinking...</span>
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