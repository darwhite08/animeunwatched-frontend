"use client"

import { motion } from "framer-motion"

interface SkeletonProps {
  className?: string
  shimmer?: boolean
}

export function Skeleton({ className, shimmer = true }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-surface ${className ?? ""}`}>
      {shimmer && (
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
        />
      )}
    </div>
  )
}

export function AnimeCardSkeleton() {
  return (
    <div className="aspect-[2/3] rounded-[1.8rem] overflow-hidden">
      <Skeleton className="w-full h-full rounded-none" />
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-border space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-2.5 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-3 w-4/5 rounded-full" />
      <Skeleton className="h-3 w-2/3 rounded-full" />
      <div className="flex gap-4 pt-1">
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="p-8 rounded-[2.5rem] border border-border bg-surface space-y-4">
      <Skeleton className="h-10 w-10 rounded-2xl" />
      <Skeleton className="h-8 w-20 rounded-xl" />
      <Skeleton className="h-3 w-24 rounded-full" />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-64 rounded-[2rem] bg-surface relative overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
