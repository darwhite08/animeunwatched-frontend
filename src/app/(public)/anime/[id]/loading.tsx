export default function AnimeDetailLoading() {
  return (
    <div className="min-h-screen bg-[#020202] animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-[500px] bg-white/[0.02] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 pt-28 flex gap-10">
          {/* Poster */}
          <div className="w-48 h-72 rounded-2xl bg-white/5 shrink-0" />
          {/* Info */}
          <div className="flex-1 space-y-4 pt-4">
            <div className="h-3 w-24 rounded-full bg-white/5" />
            <div className="h-10 w-3/4 rounded-xl bg-white/8" />
            <div className="h-5 w-1/2 rounded-xl bg-white/5" />
            <div className="flex gap-2 flex-wrap">
              {[80, 60, 70, 55].map((w, i) => (
                <div key={i} className={`h-6 w-${w/4} rounded-full bg-white/5`} style={{ width: w }} />
              ))}
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-3 w-full rounded-full bg-white/5" />
              <div className="h-3 w-5/6 rounded-full bg-white/5" />
              <div className="h-3 w-4/6 rounded-full bg-white/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-48 rounded-[2rem] bg-white/[0.02] border border-white/5" />
          <div className="h-64 rounded-[2rem] bg-white/[0.02] border border-white/5" />
        </div>
        <div className="space-y-6">
          <div className="h-40 rounded-[2rem] bg-white/[0.02] border border-white/5" />
          <div className="h-56 rounded-[2rem] bg-white/[0.02] border border-white/5" />
        </div>
      </div>
    </div>
  )
}
