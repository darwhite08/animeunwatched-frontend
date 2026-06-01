import { Skeleton } from "@/components/ui/Skeleton"

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-64">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-2 w-4/5 rounded-full" />
        <Skeleton className="h-2 w-3/5 rounded-full" />
      </div>
    </div>
  )
}
