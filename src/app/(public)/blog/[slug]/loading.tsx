export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-40 pb-32 max-w-3xl mx-auto px-6">
      {/* Title */}
      <div className="h-12 w-full rounded-xl bg-surface animate-pulse mb-3" />
      <div className="h-12 w-2/3 rounded-xl bg-surface animate-pulse mb-8" />
      {/* Author + meta */}
      <div className="flex items-center gap-3 mb-10">
        <div className="h-11 w-11 rounded-full bg-surface animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-surface animate-pulse" />
          <div className="h-3 w-24 rounded bg-surface/70 animate-pulse" />
        </div>
      </div>
      {/* Body paragraphs */}
      <div className="space-y-4">
        {[100, 95, 88, 70, 100, 92, 60].map((w, i) => (
          <div key={i} className="h-4 rounded bg-surface/70 animate-pulse" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}
