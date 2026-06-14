export default function BlogCard({ status }: { status: string }) {
  return (
    <div className="bg-surface-2 border border-border rounded-2xl overflow-hidden hover:border-white transition cursor-pointer">

      <div className="h-40 bg-gradient-to-br from-indigo-600/30 to-purple-600/20" />

      <div className="p-5 space-y-3">
        <span className="text-xs bg-accent/20 text-accent-bright px-3 py-1 rounded-full">
          {status}
        </span>

        <h3 className="font-semibold">
          Why Attack on Titan Changed Anime Forever
        </h3>

        <p className="text-sm text-muted">
          5 min read • 1.2k views
        </p>
      </div>
    </div>
  )
}