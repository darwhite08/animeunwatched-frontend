export default function Loading() {
  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12 space-y-8">
      <div className="h-28 rounded-[2rem] bg-surface animate-pulse" />
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-28 rounded-full bg-surface animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-[2.5rem] h-96 bg-surface animate-pulse" />
        ))}
      </div>
    </div>
  )
}
