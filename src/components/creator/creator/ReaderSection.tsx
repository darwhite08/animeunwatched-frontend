import BlogCard from "./BlogCard"

export default function ReaderSection() {
  return (
    <div className="space-y-10">

      <div>
        <h1 className="text-3xl font-semibold">
          Discover Anime Blogs
        </h1>
        <p className="text-white/50 mt-2">
          Deep dives, theories, and reviews from creators.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <BlogCard status="Trending" />
        <BlogCard status="Editor's Pick" />
        <BlogCard status="New" />
        <BlogCard status="Trending" />
        <BlogCard status="New" />
        <BlogCard status="Editor's Pick" />
      </div>
    </div>
  )
}