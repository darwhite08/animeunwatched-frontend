#!/usr/bin/env tsx
/**
 * Ping IndexNow with the latest sitemap URLs. Notifies Bing (+ Yandex,
 * Naver, Seznam) of fresh / updated pages without needing API auth.
 *
 * Run after every prod deploy:
 *   npx tsx scripts/ping-indexnow.ts
 *
 * Or wire as a Vercel deploy hook if you want full automation.
 */
import fs from "node:fs"
import path from "node:path"

const HOST = "kaiveron.com"
const KEY  = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "indexnow-key.txt"), "utf8").trim()

// Pull the live sitemap and extract every <loc>. Capped at 10 000 URLs per
// IndexNow's documented limit per submission.
async function fetchSitemap(): Promise<string[]> {
  const res = await fetch(`https://${HOST}/sitemap.xml`)
  if (!res.ok) throw new Error(`Sitemap fetch ${res.status}`)
  const xml = await res.text()
  const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g)
  return Array.from(matches, m => m[1]).slice(0, 10_000)
}

async function main(): Promise<void> {
  const urls = await fetchSitemap()
  console.log(`Pinging IndexNow with ${urls.length} URLs from sitemap`)

  const body = { host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }
  const r = await fetch("https://api.indexnow.org/IndexNow", {
    method:  "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body:    JSON.stringify(body),
  })
  console.log(`IndexNow → HTTP ${r.status} ${r.statusText}`)
  if (!r.ok) {
    console.error(await r.text())
    process.exit(1)
  }
  console.log("✓ Submitted. Bing typically reflects within minutes; Yandex/Naver within hours.")
}

main().catch(err => { console.error(err); process.exit(1) })
