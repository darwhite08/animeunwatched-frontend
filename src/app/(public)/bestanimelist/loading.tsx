import { AnimeCardSkeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-32 max-w-7xl mx-auto px-6">
      <div className="h-48 bg-surface rounded-[3rem] animate-pulse mb-10" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {Array.from({ length: 18 }).map((_, i) => <AnimeCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
