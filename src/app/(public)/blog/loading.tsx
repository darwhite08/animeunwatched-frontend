export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-40 pb-32 max-w-6xl mx-auto px-6">
      {/* Hero */}
      <div className="h-12 w-72 rounded-xl bg-surface animate-pulse mb-3" />
      <div className="h-4 w-96 max-w-full rounded bg-surface/70 animate-pulse mb-10" />
      {/* Blog card grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border overflow-hidden">
            <div className="aspect-[16/10] bg-surface animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-20 rounded bg-surface animate-pulse" />
              <div className="h-5 w-5/6 rounded bg-surface animate-pulse" />
              <div className="h-3 w-full rounded bg-surface/70 animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-surface/70 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
