export default function BlogCard({ status }: { status: string }) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500 transition cursor-pointer">

      <div className="h-40 bg-gradient-to-br from-indigo-600/30 to-purple-600/20" />

      <div className="p-5 space-y-3">
        <span className="text-xs bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full">
          {status}
        </span>

        <h3 className="font-semibold">
          Why Attack on Titan Changed Anime Forever
        </h3>

        <p className="text-sm text-white/50">
          5 min read • 1.2k views
        </p>
      </div>
    </div>
  )
}