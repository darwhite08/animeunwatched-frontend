import { ImageResponse } from "next/og"

// Self-hosted social-preview card for a user's anime list (1200×630), served at
// https://kaiveron.com/og/list?u=<username>. Mirrors the in-app "Share your list"
// card so an X/Discord/WhatsApp preview shows the actual list — covers, titles,
// scores — instead of the generic profile avatar card.

export const contentType = "image/png"

const BRAND = "#F5A623"
const API = process.env.API_BASE ?? "http://localhost:4000"

type Entry = {
  id: string
  score: number | null
  anime: { title: string; imageUrl: string | null } | null
}

const clamp = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

export async function GET(req: Request): Promise<ImageResponse> {
  const { searchParams } = new URL(req.url)
  const username = (searchParams.get("u") || "").trim().slice(0, 40)

  let entries: Entry[] = []
  let total = 0
  if (username) {
    try {
      const res = await fetch(
        `${API}/api/v1/lists/${encodeURIComponent(username)}?limit=5`,
        { next: { revalidate: 300 } },
      )
      if (res.ok) {
        const json = (await res.json()) as { data?: Entry[]; meta?: { total?: number } }
        entries = (json.data ?? []).filter((e) => e.anime)
        total = json.meta?.total ?? entries.length
      }
    } catch {
      // Backend unavailable — still render a valid branded card.
    }
  }

  const covers = entries.map((e) => e.anime?.imageUrl).filter(Boolean) as string[]
  const year = new Date().getFullYear()

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0b0a0e 0%, #15111e 55%, #1c1330 100%)",
          padding: "40px 56px",
          fontFamily: "sans-serif",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: BRAND, display: "flex" }} />
            <div style={{ color: BRAND, fontSize: 24, fontWeight: 800, letterSpacing: 8 }}>KAIVERON</div>
          </div>
          <div
            style={{
              display: "flex",
              color: "#c4b5fd",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 4,
              padding: "7px 18px",
              borderRadius: 999,
              background: "rgba(139,92,246,0.18)",
              border: "1px solid rgba(139,92,246,0.35)",
            }}
          >
            WATCHLIST
          </div>
        </div>

        {/* heading */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
          <div style={{ color: "#F4F2EC", fontSize: 56, fontWeight: 800, letterSpacing: -1, lineHeight: 1.05 }}>
            {`MY ${year} ANIME LIST`}
          </div>
          <div style={{ color: "#b7b2c6", fontSize: 25, marginTop: 10 }}>
            {`@${username || "kaiveron"} · ${total} anime tracked`}
          </div>
        </div>

        {/* covers + titles */}
        <div style={{ display: "flex", gap: 34, marginTop: 26, flex: 1 }}>
          <div style={{ display: "flex", gap: 14 }}>
            {covers.slice(0, 3).map((src, i) => (
              <img
                key={i}
                src={src}
                width={172}
                height={258}
                style={{
                  width: 172,
                  height: 258,
                  borderRadius: 14,
                  objectFit: "cover",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18, paddingTop: 8 }}>
            {entries.slice(0, 5).map((e, i) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex", color: BRAND, fontSize: 19, fontWeight: 800, width: 20 }}>{i + 1}</div>
                <div style={{ display: "flex", flex: 1, color: "#e8e5f0", fontSize: 24, fontWeight: 600 }}>
                  {clamp(e.anime?.title ?? "Unknown", 30)}
                </div>
                {/* score chip — no ★ glyph: satori would need a dynamic font download */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: e.score ? BRAND : "#6f6a7d",
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      transform: "rotate(45deg)",
                      background: e.score ? BRAND : "#4a4557",
                    }}
                  />
                  {String(e.score ?? 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: BRAND, display: "flex" }} />
            <div style={{ color: "#7a7488", fontSize: 22, letterSpacing: 2 }}>kaiveron.com</div>
          </div>
          <div style={{ color: "#7a7488", fontSize: 20, letterSpacing: 1 }}>Track. Share. Flex.</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "cache-control": "public, max-age=600, s-maxage=3600" },
    },
  )
}
