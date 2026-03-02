"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Question = {
  id: string
  question: string
  options: string[]
  correct: string
}

export default function RatePage() {
  const [rating, setRating] = useState<number | null>(null)
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const animeTitle = "Attack on Titan"

  const questions: Question[] = [
    {
      id: "q1",
      question: "Who was the first Titan revealed in episode 1?",
      options: ["Armored Titan", "Colossal Titan", "Beast Titan", "Female Titan"],
      correct: "Colossal Titan",
    },
    {
      id: "q2",
      question: "What is Eren's main motivation in early seasons?",
      options: [
        "Become king",
        "Destroy all Titans",
        "Join the military police",
        "Find the basement"
      ],
      correct: "Destroy all Titans",
    },
  ]

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const credibilityScore =
    (Object.values(answers).filter(
      (ans, index) => ans === questions[index].correct
    ).length /
      questions.length) *
    100

  return (
    <main className="min-h-screen bg-black text-white pt-32 px-4">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-semibold bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
            Rate {animeTitle}
          </h1>
          <p className="text-white/50 mt-3">
            Your rating matters. We verify authenticity.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-10 shadow-2xl">

          <AnimatePresence mode="wait">

            {/* STEP 1 — Rating */}
            {step === 1 && (
              <motion.div
                key="rating"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <h2 className="text-xl font-semibold">Give your rating</h2>

                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {[...Array(10)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setRating(i + 1)}
                      className={`py-3 rounded-xl border transition ${
                        rating === i + 1
                          ? "bg-indigo-600 border-indigo-500"
                          : "border-white/10 hover:bg-white/5"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!rating}
                  className="mt-6 w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* STEP 2 — Proof Questions */}
            {step === 2 && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <h2 className="text-xl font-semibold">
                  Prove you've watched it
                </h2>

                {questions.map((q, index) => (
                  <div key={q.id} className="space-y-3">
                    <p className="text-white/80">{q.question}</p>

                    <div className="grid gap-2">
                      {q.options.map(option => (
                        <button
                          key={option}
                          onClick={() =>
                            setAnswers(prev => ({
                              ...prev,
                              [q.id]: option,
                            }))
                          }
                          className={`text-left px-4 py-3 rounded-xl border transition ${
                            answers[q.id] === option
                              ? "bg-indigo-600/20 border-indigo-500"
                              : "border-white/10 hover:bg-white/5"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== questions.length}
                  className="w-full py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition"
                >
                  Submit Rating
                </button>
              </motion.div>
            )}

            {/* STEP 3 — Result */}
            {submitted && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-6"
              >
                <h2 className="text-2xl font-semibold">
                  Rating Submitted 🎉
                </h2>

                <p className="text-white/60">
                  Your Rating: {rating}/10
                </p>

                <div className="space-y-2">
                  <p className="text-white/70">
                    Credibility Score:
                  </p>

                  <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${credibilityScore}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-indigo-600"
                    />
                  </div>

                  <p className="text-sm text-white/50">
                    {credibilityScore.toFixed(0)}% verified
                  </p>
                </div>

                <p className="text-sm text-white/40">
                  High credibility ratings influence leaderboard more.
                </p>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </main>
  )
}