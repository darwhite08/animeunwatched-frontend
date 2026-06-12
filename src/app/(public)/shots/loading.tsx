export default function Loading() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] w-full items-center justify-center bg-black">
      {/* Vertical reel card skeleton */}
      <div className="relative aspect-[9/16] h-full max-h-full w-auto overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10 animate-pulse">
        <div className="absolute inset-x-0 bottom-0 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/10" />
            <div className="h-3 w-28 rounded bg-white/10" />
          </div>
          <div className="h-3 w-3/4 rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}
