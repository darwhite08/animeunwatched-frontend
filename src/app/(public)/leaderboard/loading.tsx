export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-40 pb-32 max-w-4xl mx-auto px-6">
      <div className="h-10 w-52 rounded-xl bg-surface animate-pulse mb-8" />
      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[24, 32, 20].map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-surface animate-pulse" />
            <div className={`w-full rounded-2xl bg-surface animate-pulse`} style={{ height: `${h * 4}px` }} />
          </div>
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl bg-surface/60 p-3 animate-pulse">
            <div className="h-6 w-6 rounded bg-surface" />
            <div className="h-10 w-10 rounded-full bg-surface" />
            <div className="h-4 flex-1 max-w-[200px] rounded bg-surface" />
            <div className="h-4 w-12 rounded bg-surface ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
