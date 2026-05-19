// Server component — can export metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // Slug-based title generation
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
  return {
    title: `${title} | The Chronicle — Kaiveron`,
    description: `Read "${title}" on The Chronicle — anime long-form journalism by the Kaiveron community.`,
    openGraph: { title, type: "article" },
  }
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
