export default function ClubsLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-32">
        <div className="mb-10 space-y-3">
          <div className="h-3 w-24 rounded-full bg-surface" />
          <div className="h-12 w-48 rounded-xl bg-surface" />
        </div>
        <div className="flex gap-4 mb-10">
          <div className="flex-1 h-12 rounded-xl bg-surface" />
          <div className="flex gap-2">
            {[80, 90, 70, 80, 65, 60].map((w, i) => (
              <div key={i} className="h-10 rounded-xl bg-surface" style={{ width: w }} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border bg-surface overflow-hidden">
              <div className="h-24 bg-surface" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 rounded-lg bg-surface" />
                <div className="h-3 w-full rounded-full bg-surface" />
                <div className="h-3 w-2/3 rounded-full bg-surface" />
                <div className="flex gap-2 pt-2">
                  <div className="flex-1 h-8 rounded-xl bg-surface" />
                  <div className="h-8 w-16 rounded-xl bg-surface" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
