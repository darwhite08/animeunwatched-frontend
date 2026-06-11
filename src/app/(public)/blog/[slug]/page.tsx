// Server component — fetches the published blog on the server so the article
// body is rendered into the initial HTML (crawlable by search engines, visible
// to link-preview bots, and instantly readable with no client-fetch flash).
// The interactive reader (like/share/comments/TOC) hydrates over it as a client
// island, seeded with this same data via React Query's initialData.
import { BlogReaderClient } from "./BlogReaderClient"
import type { Blog } from "@/hooks/useBlogs"

const API_BASE = process.env.API_BASE ?? "http://localhost:4000"

/** Public, unauthenticated fetch. Identical to the layout's getBlog so Next
 *  memoises both into a single request per render. */
async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/blogs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { blog?: Blog }
    return json.blog ?? null
  } catch {
    return null
  }
}

export default async function BlogReaderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const blog = await getBlog(slug)
  return <BlogReaderClient slug={slug} initialBlog={blog ?? undefined} />
}
