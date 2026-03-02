"use client"

export default function WatchStatsCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
      <h2 className="text-white/60 text-sm">Total Anime Watched</h2>
      <p className="text-4xl font-semibold">124</p>

      <div className="flex justify-between text-sm text-white/50">
        <span>On Watchlist</span>
        <span>38</span>
      </div>

      <div className="flex justify-between text-sm text-white/50">
        <span>Completed</span>
        <span>86</span>
      </div>
    </div>
  )
}