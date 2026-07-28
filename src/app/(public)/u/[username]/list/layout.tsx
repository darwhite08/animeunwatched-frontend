import type { Metadata } from "next"

const BASE = "https://kaiveron.com"

// Shared-list pages get their OWN card (summary_large_image + generated list
// image) instead of inheriting the small avatar "summary" card from the parent
// profile layout — this is the URL the "Share on Twitter" button posts.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const url = `${BASE}/u/${username}/list`
  const image = `${BASE}/og/list?u=${encodeURIComponent(username)}`
  const year = new Date().getFullYear()

  let total = 0
  try {
    const res = await fetch(
      `${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/lists/${encodeURIComponent(username)}?limit=1`,
      { next: { revalidate: 300 } },
    )
    if (res.ok) {
      const json = (await res.json()) as { meta?: { total?: number } }
      total = json.meta?.total ?? 0
    }
  } catch {
    // Backend unavailable — fall through to the generic copy.
  }

  const title = `${username}'s ${year} anime list — Kaiveron`
  const description = total
    ? `${total} anime tracked by @${username} on Kaiveron. Track, rate & share your own list.`
    : `@${username}'s anime list on Kaiveron. Track, rate & share your own list.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: { canonical: url },
  }
}

export default function UserListLayout({ children }: { children: React.ReactNode }) {
  return children
}
