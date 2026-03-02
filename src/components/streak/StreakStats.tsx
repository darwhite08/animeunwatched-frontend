"use client"

export default function StreakStats() {
  const completed = 72
  const missed = 28

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col items-center justify-center">
      <div className="relative w-40 h-40">

        <svg
          viewBox="0 0 36 36"
          className="w-full h-full rotate-[-90deg]"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#27272a"
            strokeWidth="3"
          />

          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeDasharray={`${completed}, 100`}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-semibold">
            {completed}%
          </p>
          <p className="text-white/50 text-sm">
            Completed
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-white/50 text-sm">
          Missed: {missed}%
        </p>
      </div>
    </div>
  )
}