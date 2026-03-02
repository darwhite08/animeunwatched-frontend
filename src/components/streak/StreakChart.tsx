"use client"

export default function StreakChart() {
  const data = [60, 20, 88, 50, 15, 70, 40]

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-lg font-semibold">
          Weekly Activity
        </h2>
        <span className="text-white/50 text-sm">
          This Week
        </span>
      </div>

      <div className="flex items-end gap-6 h-48">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              style={{ height: `${value}%` }}
              className="w-full bg-indigo-600 rounded-t-xl transition-all duration-300 hover:bg-indigo-500"
            />
            <span className="text-white/40 text-xs mt-2">
              {value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}