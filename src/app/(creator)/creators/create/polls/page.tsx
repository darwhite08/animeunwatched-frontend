"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Vote, Plus, Trash2, Clock, Send } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api/client"
import { useToast } from "@/stores/toast.store"
import { useRouter } from "next/navigation"

const DURATIONS = ["1 day", "3 days", "7 days", "14 days"]

const DURATION_HOURS: Record<string, number> = { "1 day": 24, "3 days": 72, "7 days": 168, "14 days": 336 }

export default function CreatePollPage() {
  const router = useRouter()
  const { push } = useToast()
  const qc = useQueryClient()
  const createPoll = useMutation({
    mutationFn: (body: { question: string; options: string[]; expiresIn: number }) =>
      api("/polls", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["polls"] }) },
  })

  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [duration, setDuration] = useState("7 days")
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = question.trim() && options.filter(o => o.trim()).length >= 2

  const updateOption = (i: number, val: string) => {
    setOptions(prev => prev.map((o, idx) => idx === i ? val : o))
  }

  const addOption = () => {
    if (options.length < 6) setOptions(prev => [...prev, ""])
  }

  const removeOption = (i: number) => {
    if (options.length <= 2) return
    setOptions(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    const validOptions = options.filter(o => o.trim())
    createPoll.mutate(
      { question: question.trim(), options: validOptions, expiresIn: DURATION_HOURS[duration] ?? 168 },
      {
        onSuccess: () => {
          setSubmitted(true)
          push("Poll published!", "success")
          setTimeout(() => { setSubmitted(false); setQuestion(""); setOptions(["", ""]); setDuration("7 days"); router.push("/poll") }, 2000)
        },
        onError: () => push("Failed to create poll", "error"),
      }
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
          <Vote size={18} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Create Poll</h1>
          <p className="text-sm text-white/40">Ask the community — up to 6 options</p>
        </div>
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400"
        >
          Poll created and going live!
        </motion.div>
      )}

      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 space-y-6">
        {/* Question */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase tracking-wider">Question</label>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. Who is the strongest anime character?"
            className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:ring-1 focus:ring-amber-500/50"
          />
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase tracking-wider">
            Options ({options.length}/6)
          </label>

          <AnimatePresence>
            {options.map((opt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-white/40 shrink-0">
                  {i + 1}
                </span>
                <input
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}…`}
                  className="flex-1 bg-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:ring-1 focus:ring-amber-500/50"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(i)}
                    className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {options.length < 6 && (
            <button
              onClick={addOption}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition"
            >
              <Plus size={14} />
              Add option
            </button>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={11} /> Duration
          </label>
          <div className="flex gap-2 flex-wrap">
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-4 py-2 rounded-xl text-sm transition ${
                  duration === d
                    ? "bg-amber-600/20 border border-amber-500/40 text-amber-400"
                    : "bg-zinc-800 text-white/50 hover:bg-zinc-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 border-t border-white/5 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            <Send size={14} />
            Launch Poll
          </button>
        </div>
      </div>

      {/* Preview */}
      {question.trim() && (
        <div className="space-y-3">
          <p className="text-xs text-white/30 uppercase tracking-wider">Preview</p>
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 space-y-4">
            <p className="font-semibold">{question}</p>
            <div className="space-y-2">
              {options.filter(o => o.trim()).map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 bg-zinc-800 rounded-lg px-4 py-2 text-sm text-white/70">
                    {opt}
                  </div>
                  <span className="text-xs text-white/30 w-8 text-right">0%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/30">Closes in {duration} · 0 votes</p>
          </div>
        </div>
      )}
    </div>
  )
}
