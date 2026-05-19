/**
 * Streak and gamification utility tests.
 */
import { describe, it, expect } from "vitest"

// ── Streak calculation ────────────────────────────────────────────────────────

function calcStreakBonus(days: number): number {
  if (days >= 365) return 1000
  if (days >= 90)  return 250
  if (days >= 30)  return 100
  if (days >= 7)   return 25
  if (days >= 3)   return 10
  return 0
}

describe("calcStreakBonus", () => {
  it("returns 0 for streaks under 3 days", () => {
    expect(calcStreakBonus(0)).toBe(0)
    expect(calcStreakBonus(1)).toBe(0)
    expect(calcStreakBonus(2)).toBe(0)
  })

  it("returns 10 for 3-6 day streak", () => {
    expect(calcStreakBonus(3)).toBe(10)
    expect(calcStreakBonus(6)).toBe(10)
  })

  it("returns 25 for 7-29 day streak", () => {
    expect(calcStreakBonus(7)).toBe(25)
    expect(calcStreakBonus(29)).toBe(25)
  })

  it("returns 100 for 30-89 day streak", () => {
    expect(calcStreakBonus(30)).toBe(100)
    expect(calcStreakBonus(89)).toBe(100)
  })

  it("returns 250 for 90-364 day streak", () => {
    expect(calcStreakBonus(90)).toBe(250)
    expect(calcStreakBonus(364)).toBe(250)
  })

  it("returns 1000 for 365+ day streak", () => {
    expect(calcStreakBonus(365)).toBe(1000)
    expect(calcStreakBonus(1000)).toBe(1000)
  })
})

// ── Achievement unlocking ─────────────────────────────────────────────────────

type Achievement = { id: string; title: string; condition: (count: number) => boolean }

const achievements: Achievement[] = [
  { id: "first-watch", title: "First Watch", condition: n => n >= 1 },
  { id: "10-anime", title: "Getting Started", condition: n => n >= 10 },
  { id: "50-anime", title: "Anime Fan", condition: n => n >= 50 },
  { id: "100-anime", title: "Centurion Watcher", condition: n => n >= 100 },
  { id: "500-anime", title: "Legendary Otaku", condition: n => n >= 500 },
]

function getUnlockedAchievements(watchCount: number): Achievement[] {
  return achievements.filter(a => a.condition(watchCount))
}

describe("achievement unlocking", () => {
  it("unlocks 'First Watch' at 1 anime", () => {
    const unlocked = getUnlockedAchievements(1)
    expect(unlocked.some(a => a.id === "first-watch")).toBe(true)
  })

  it("unlocks no achievements at 0", () => {
    expect(getUnlockedAchievements(0)).toHaveLength(0)
  })

  it("unlocks all achievements at 500+", () => {
    const unlocked = getUnlockedAchievements(500)
    expect(unlocked).toHaveLength(achievements.length)
  })

  it("unlocks progressively more achievements", () => {
    expect(getUnlockedAchievements(1).length).toBeLessThanOrEqual(getUnlockedAchievements(10).length)
    expect(getUnlockedAchievements(10).length).toBeLessThanOrEqual(getUnlockedAchievements(50).length)
    expect(getUnlockedAchievements(50).length).toBeLessThanOrEqual(getUnlockedAchievements(100).length)
  })
})

// ── XP level display ─────────────────────────────────────────────────────────

function getLevelTitle(level: number): string {
  const titles = [
    "Neophyte", "Initiate", "Apprentice", "Shinobi", "Jonin",
    "Anbu", "Elite Jonin", "Kage", "Legendary", "Arch-Mage", "Shadow Watcher", "Neural Oracle"
  ]
  return titles[Math.min(level - 1, titles.length - 1)] ?? "Neural Oracle"
}

describe("getLevelTitle", () => {
  it("returns Neophyte for level 1", () => {
    expect(getLevelTitle(1)).toBe("Neophyte")
  })

  it("returns Neural Oracle for very high levels", () => {
    expect(getLevelTitle(100)).toBe("Neural Oracle")
    expect(getLevelTitle(999)).toBe("Neural Oracle")
  })

  it("returns different titles for each level 1-12", () => {
    const titles = Array.from({ length: 12 }, (_, i) => getLevelTitle(i + 1))
    const unique = new Set(titles)
    expect(unique.size).toBe(12)
  })
})
