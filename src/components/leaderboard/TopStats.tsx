"use client"

export default function TopStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
        <p className="text-white/50 text-sm">Total Users</p>
        <p className="text-3xl font-semibold mt-2">12,432+</p>
      </div>

      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl">
        <p className="text-white/50 text-sm">Anime Tracked</p>
        <p className="text-3xl font-semibold mt-2">87,219+</p>
      </div>

      <div className="rounded-3xl bg-indigo-600/10 border border-indigo-600/30 p-6 backdrop-blur-xl">
        <p className="text-white/50 text-sm">
          Season Ends In
        </p>
        <p className="text-3xl font-semibold mt-2">
          12d : 06h : 42m
        </p>
      </div>

    </div>
  )
}