import { PostCardSkeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#020202] pt-40 pb-32 max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
      </div>
      <div className="space-y-4">
        <div className="h-40 rounded-2xl bg-white/5 animate-pulse" />
        <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    </div>
  )
}
