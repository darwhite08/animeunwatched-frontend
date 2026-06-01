export default function CalendarLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-6xl mx-auto px-6 pt-28 pb-32">
        <div className="mb-10 space-y-3">
          <div className="h-3 w-24 rounded-full bg-surface" />
          <div className="h-12 w-56 rounded-xl bg-surface" />
          <div className="h-4 w-72 rounded-lg bg-surface" />
        </div>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 rounded-xl bg-surface" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-20 rounded-xl bg-surface" />
            ))}
          </div>
          <div className="h-10 w-10 rounded-xl bg-surface" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-surface border border-border" />
          ))}
        </div>
      </div>
    </div>
  )
}
