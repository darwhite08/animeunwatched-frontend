"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Rss, ImagePlus, Hash, AtSign, Send, X, ChevronDown } from "lucide-react"
import { useCreatePost } from "@/hooks/usePosts"
import { useToast } from "@/stores/toast.store"

const ANIME_TAGS = [
  "Attack on Titan", "Jujutsu Kaisen", "Demon Slayer", "One Piece",
  "Naruto", "Bleach", "Dragon Ball", "Fullmetal Alchemist",
]

export default function CreateFeedPage() {
  const router = useRouter()
  const { push } = useToast()
  const createPost = useCreatePost()

  const [content, setContent] = useState("")
  const [selectedAnime, setSelectedAnime] = useState<string | null>(null)
  const [animeOpen, setAnimeOpen] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const charLimit = 500
  const remaining = charLimit - content.length
  const overLimit = remaining < 0

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags(prev => [...prev, t])
      setTagInput("")
    }
  }

  const handleSubmit = () => {
    if (!content.trim() || overLimit) return
    createPost.mutate(
      { content: content.trim() },
      {
        onSuccess: () => {
          push("Post published to your feed!", "success")
          router.push("/creators/feed")
        },
        onError: () => {
          push("Failed to publish post. Try again.", "error")
        },
      },
    )
  }

  const submitted = createPost.isSuccess

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Rss size={18} className="text-accent-bright" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">New Feed Post</h1>
          <p className="text-sm text-muted">Share a thought, theory, or hot take</p>
        </div>
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400"
        >
          Post published to your feed!
        </motion.div>
      )}

      {/* Composer */}
      <div className="bg-surface-2 border border-border rounded-2xl p-6 space-y-5">
        {/* Text area */}
        <div className="relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind? Share a theory, hot take, or anime reaction…"
            rows={6}
            className="w-full bg-surface-2 rounded-xl px-4 py-3 text-sm resize-none outline-none placeholder:text-subtle focus:ring-1 focus:ring-indigo-500/50"
          />
          <span
            className={`absolute bottom-3 right-4 text-xs ${
              overLimit ? "text-red-400" : remaining < 50 ? "text-accent-bright" : "text-subtle"
            }`}
          >
            {remaining}
          </span>
        </div>

        {/* Anime attach */}
        <div>
          <p className="text-xs text-muted mb-2">Attach anime (optional)</p>
          <div className="relative">
            <button
              onClick={() => setAnimeOpen(o => !o)}
              className="flex items-center justify-between w-full bg-surface-2 rounded-xl px-4 py-3 text-sm text-left"
            >
              <span className={selectedAnime ? "text-foreground" : "text-subtle"}>
                {selectedAnime ?? "Select anime…"}
              </span>
              <ChevronDown size={14} className={`transition ${animeOpen ? "rotate-180" : ""}`} />
            </button>

            {animeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-1 left-0 right-0 bg-surface-2 border border-border rounded-xl overflow-hidden z-10"
              >
                {ANIME_TAGS.map(anime => (
                  <button
                    key={anime}
                    onClick={() => { setSelectedAnime(anime); setAnimeOpen(false) }}
                    className="block w-full text-left px-4 py-2.5 text-sm hover:bg-surface transition"
                  >
                    {anime}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {selectedAnime && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-accent/20 text-accent-bright px-3 py-1 rounded-full">
                {selectedAnime}
              </span>
              <button onClick={() => setSelectedAnime(null)}>
                <X size={12} className="text-muted hover:text-foreground transition" />
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs text-muted mb-2">Tags (max 5)</p>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTag()}
              placeholder="Add tag…"
              className="flex-1 bg-surface-2 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-subtle focus:ring-1 focus:ring-indigo-500/50"
            />
            <button
              onClick={addTag}
              className="px-4 py-2.5 bg-surface-2 hover:bg-surface-2 rounded-xl text-sm transition"
            >
              <Hash size={14} />
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 text-xs bg-surface border border-border px-3 py-1 rounded-full"
                >
                  #{tag}
                  <button onClick={() => setTags(prev => prev.filter(t => t !== tag))}>
                    <X size={10} className="text-muted hover:text-foreground transition" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex gap-3">
            <button
              type="button"
              title="Image uploads coming soon"
              onClick={() => push("Image uploads coming in the next release", "info")}
              className="p-2 rounded-lg text-subtle cursor-not-allowed transition"
            >
              <ImagePlus size={16} />
            </button>
            <button
              type="button"
              title="Mention a user (@)"
              onClick={() => setContent(c => c + (c.endsWith(" ") || c.length === 0 ? "@" : " @"))}
              className="p-2 rounded-lg text-muted hover:text-accent-bright hover:bg-surface transition"
            >
              <AtSign size={16} />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || overLimit || createPost.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-bright disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            <Send size={14} />
            {createPost.isPending ? "Posting…" : "Post"}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
        <p className="text-xs font-medium text-muted">Tips for better reach</p>
        <ul className="space-y-1 text-xs text-subtle">
          <li>• Attach an anime to surface your post in catalog pages</li>
          <li>• Use @mentions to notify other creators</li>
          <li>• Add up to 5 tags to reach broader communities</li>
        </ul>
      </div>
    </div>
  )
}
