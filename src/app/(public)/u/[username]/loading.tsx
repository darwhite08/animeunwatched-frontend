export default function UserProfileLoading() {
  return (
    <div className="min-h-screen bg-[#020202] animate-pulse">
      {/* Hero */}
      <div className="h-64 bg-white/[0.02] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 pt-24 flex items-end gap-6">
          <div className="h-24 w-24 rounded-3xl bg-white/10 mb-[-48px]" />
          <div className="pb-4 space-y-2 flex-1">
            <div className="h-7 w-48 rounded-xl bg-white/10" />
            <div className="h-4 w-32 rounded-lg bg-white/5" />
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-40 rounded-[2rem] bg-white/[0.02] border border-white/5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-[2rem] bg-white/[0.02] border border-white/5" />
          <div className="h-32 rounded-[2rem] bg-white/[0.02] border border-white/5" />
        </div>
      </div>
    </div>
  )
}
