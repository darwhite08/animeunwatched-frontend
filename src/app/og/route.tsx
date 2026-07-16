import { ImageResponse } from "next/og"

// Self-hosted, generated social-preview card (1200×630) served at
// https://kaiveron.com/og. Parameterized so one route covers the site default
// AND every blog: /og?title=…&subtitle=… . Self-hosting means X/Twitter,
// Facebook, LinkedIn, Discord etc. always get a valid, reachable image — no
// dependency on whether a post happens to contain an inline <img>, and no
// reliance on third-party image hosts that a crawler might not fetch.

export const contentType = "image/png"

const BRAND = "#F5A623"
const clamp = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

export async function GET(req: Request): Promise<ImageResponse> {
  const { searchParams } = new URL(req.url)
  const title = clamp((searchParams.get("title") || "Track, rate & discover anime.").trim(), 120)
  const subtitle = clamp(
    (searchParams.get("subtitle") || "AI mood discovery · ratings · streaks · a real anime community.").trim(),
    110,
  )

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b0a0e 0%, #15111e 55%, #1c1330 100%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: BRAND, display: "flex" }} />
          <div style={{ color: BRAND, fontSize: 30, fontWeight: 800, letterSpacing: 9 }}>KAIVERON</div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#F4F2EC", fontSize: 66, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1 }}>
            {title}
          </div>
          <div style={{ marginTop: 26, color: "#b7b2c6", fontSize: 29, lineHeight: 1.4 }}>{subtitle}</div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 4, borderRadius: 2, background: BRAND, display: "flex" }} />
          <div style={{ color: "#7a7488", fontSize: 24, letterSpacing: 2 }}>kaiveron.com</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "cache-control": "public, max-age=86400, s-maxage=604800, immutable" },
    },
  )
}
