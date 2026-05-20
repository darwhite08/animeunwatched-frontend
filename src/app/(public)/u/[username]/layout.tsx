import type { Metadata } from "next"

const BASE = "https://kaiveron.app"

// Server-side metadata for user profile pages — enables SEO when shared
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params

  // Try to fetch real user data for rich OG tags
  try {
    const res = await fetch(`${process.env.API_BASE ?? "http://localhost:4000"}/api/v1/users/${username}`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const data = await res.json() as {
        user?: { displayName?: string; bio?: string; avatarUrl?: string; reputation?: number }
      }
      const u = data.user
      if (u) {
        const title = `${u.displayName ?? username} — Kaiveron Profile`
        const description = u.bio
          ? `${u.bio} | ${u.reputation ?? 0} Reputation on Kaiveron`
          : `${username}'s anime profile on Kaiveron. Track, rate, and discover anime.`
        return {
          title,
          description,
          openGraph: {
            title,
            description,
            url: `${BASE}/u/${username}`,
            type: "profile",
            ...(u.avatarUrl ? { images: [{ url: u.avatarUrl, width: 400, height: 400, alt: `${username}'s avatar` }] } : {}),
          },
          twitter: { card: "summary", title, description },
          alternates: { canonical: `${BASE}/u/${username}` },
        }
      }
    }
  } catch {
    // Graceful fallback on backend unavailable
  }

  const title = `${username} — Kaiveron Profile`
  const description = `View ${username}'s anime watchlist, reviews, and profile on Kaiveron.`
  return {
    title,
    description,
    openGraph: { title, description, url: `${BASE}/u/${username}`, type: "profile" },
    alternates: { canonical: `${BASE}/u/${username}` },
  }
}

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
