"use client"

export default function RecommendationCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">
          AI Recommendations
        </h2>
        <p className="text-white/50 mt-1">
          Based on your watch history
        </p>
      </div>

      <button className="bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-500 transition">
        Explore
      </button>
    </div>
  )
}