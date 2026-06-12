import { AnimeCardSkeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-40 pb-32 max-w-7xl mx-auto px-6">
      <div className="h-10 w-60 rounded-xl bg-surface animate-pulse mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => <AnimeCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
