"use client"

import StreakStats from "@/components/streak/StreakStats"
import StreakCalendar from "@/components/streak/StreakCalendar"
import StreakChart from "@/components/streak/StreakChart"

export default function StreakPage() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            Watching Streaks
          </h1>
          <p className="text-white/50 mt-2">
            Track your daily anime watching consistency.
          </p>
        </div>

        <button className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition">
          + Log Episode
        </button>
      </div>

     <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
  <div className="xl:col-span-1">
    <StreakStats />
  </div>

  <div className="xl:col-span-2">
    <StreakCalendar />
  </div>
</div>

      <StreakChart />
    </div>
  )
}