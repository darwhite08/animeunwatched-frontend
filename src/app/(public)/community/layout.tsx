import { CommunityGuard } from "./CommunityGuard"

export const metadata = {
  title: "Community — The Dojo | Kaiveron",
  description: "Join 12,402 Shinobi in the anime community. Post theories, vote in polls, join dens, and discover what everyone's watching.",
}

// Members-only: the CommunityGuard (client) redirects logged-out visitors to
// /login. Keeping this layout a Server Component preserves the metadata export.
export default function Layout({ children }: { children: React.ReactNode }) {
  return <CommunityGuard>{children}</CommunityGuard>
}
