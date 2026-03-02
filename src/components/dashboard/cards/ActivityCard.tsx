"use client"

export default function ActivityCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
      <h2 className="text-white/60 text-sm">Weekly Watch Time</h2>
      <p className="text-3xl font-semibold">13 Hours</p>

      <div className="h-24 bg-neutral-900 rounded-xl flex items-center justify-center text-white/40">
        Chart Placeholder
      </div>
    </div>
  )
}