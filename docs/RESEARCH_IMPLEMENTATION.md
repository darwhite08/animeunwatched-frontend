# Kaiveron — Research-Driven Implementation Plan
*Generated: 2026-05-21 | Deep research + continuous implementation session*
*Last updated: 2026-05-21 03:00 IST*

---

## Research Sources & Key Findings

### What Anime Platform Users Want

**Sources:** AniList forums, MAL Reddit communities, anime streaming market research 2025

**Top Pain Points on MAL/AniList:**
- MAL: outdated UI, no real-time features, no mood-based discovery
- AniList: smaller database, no private messaging, poor mobile experience
- Both: no spoiler protection, no watch party, only 5 list statuses
- No "what should I watch based on my mood" discovery
- No offline support, no PWA, no push notifications
- No data portability (import/export between platforms) — #1 switcher request

**Most Requested Features (ranked by demand):**
1. Import from MAL/AniList ← data portability (high switcher demand)
2. Mood-based discovery (not just genre filter)
3. Spoiler protection in community posts
4. Watch Party sync viewing
5. Push notifications for new episodes
6. Episode-level discussion threads
7. Friends activity ("what is X watching now")
8. Streak-based engagement (Duolingo model)
9. Custom list statuses beyond 5 defaults
10. Mobile-first PWA experience

---

### Post-Launch Startup Risks

**Sources:** startup-statistics-guide, saas-churn-rates, user-retention benchmarks 2025-2026

**Retention Benchmarks:**
- Day-1: 26% industry avg → top quartile: >40%
- Day-7: 7% avg → strong performers: >15%
- Day-30: 6-7% avg → social apps target: >20%
- **KEY**: Duolingo-style streak = 7 days active → 90% Day-30 retention
- Users who hit "aha moment" in <5 min = 3× more likely to retain

**Top 5 Post-Launch Failure Modes:**
1. Churn cliff at Day 30 (too low retention)
2. Support cliff (scale without support = 50% higher churn in 12mo)
3. Security gaps (stolen credentials = 24% of breaches)
4. Cold start problem (no content/community for new users)
5. No monetisation path

**Security (OWASP Top 10 2025):**
- A01: Broken Access Control ← always #1
- A07: Authentication Failures ← brute force, credential stuffing
- A10: Mishandling Exceptional Conditions (NEW 2025) ← stack trace leakage
- Rate limiting prevents: credential stuffing, DDoS, scraping

**Monetisation (what anime fans pay for, Crunchyroll data):**
- Ad-free ($7-16/mo range)
- Offline download
- Custom themes/profile cosmetics
- Early feature access
- Higher API limits
- Exclusive badges/collectibles

**Dark Patterns to AVOID (EU regulates these):**
- Roach motel (easy to join, hard to leave) → we have easy account delete
- Hidden costs → all features disclosed upfront
- Confirmshaming → never shame users for declining
- Forced continuity → no auto-renew without consent

---

## Implementation Log (Complete)

### Security Guards ✅
| Feature | Status | Files |
|---------|--------|-------|
| Account lockout (5 failures → 15min) | ✅ Done | auth.service.ts |
| Stack trace guard (OWASP A10) | ✅ Done | error.middleware.ts |
| npm audit in CI (supply chain) | ✅ Done | ci-cd.yml |
| Retry-After header on 429 | ✅ Done | rateLimit.middleware.ts |
| User-friendly rate limit messages | ✅ Done | api/client.ts |

### Retention Features ✅
| Feature | Status | Files |
|---------|--------|-------|
| Mood Picker (/mood) | ✅ Done | src/app/(public)/mood/page.tsx |
| Spoiler tags in community posts | ✅ Done | community/page.tsx |
| MAL/AniList XML Import | ✅ Done | me/import/page.tsx |
| Cookie Consent Banner (GDPR) | ✅ Done | CookieConsent.tsx + layout.tsx |
| Friends Activity Card (dashboard) | ✅ Done | FriendsActivityCard.tsx |
| Push Notifications UI + hook | ✅ Done | usePushNotifications.ts |
| Notification permission in settings | ✅ Done | notifications/page.tsx |

### Backend APIs ✅
| Endpoint | Status | Files |
|---------|--------|-------|
| GET /users/:username/following-activity | ✅ Done | users.service.ts + routes |
| Brute-force lockout in login | ✅ Done | auth.service.ts |
| isLikedByMe on posts | ✅ Done | posts.service.ts |

### Platform Features ✅
| Feature | Status |
|---------|--------|
| Mood Picker added to Navbar | ✅ Done |
| Import List in Settings sidebar | ✅ Done |
| Sentry error monitoring (frontend + backend) | ✅ Done |
| PWA Service Worker + offline page | ✅ Done |
| Auth loop fix (sessionReady flag) | ✅ Done |
| Phase 8 complete (Sentry, PWA, Lighthouse) | ✅ Done |
| GDPR Cookie Consent | ✅ Done |

---

## Remaining Queue

### CRITICAL (blocking users)
- [ ] Production login auth loop (session persistence in prod)
- [ ] Google OAuth fully working end-to-end in production

### HIGH PRIORITY
- [ ] Custom list statuses (beyond WATCHING/COMPLETED/etc.)
- [ ] Episode-level discussion threads
- [ ] Club "watch challenge" system
- [ ] Email digest re-engagement (weekly "what your friends watched")
- [ ] Real streak tracking (database-backed, not rep-estimate)

### MEDIUM
- [ ] Pricing page + premium tier UI
- [ ] Feature flags for premium gating
- [ ] Watch Party (/watch-party) — Q3 2026 placeholder
- [ ] Manga chapter tracking (real API)
- [ ] Danmu/live comments on episode pages

### LOW (nice to have)
- [ ] VAPID key generation + actual push sending
- [ ] Custom list categories UI
- [ ] Bundle size analysis + code splitting

---

## Metrics to Track Post-Launch

| Metric | Target | How to measure |
|--------|--------|----------------|
| Day-1 retention | >40% | Users who return next day |
| Day-7 retention | >15% | 7-day actives / signups |
| Day-30 retention | >20% | 30-day actives / signups |
| Onboarding completion | >70% | % who complete watcher type + 5 anime |
| Anime added Day-1 | >5 | Avg entries created on signup day |
| Streak 7+ days | >30% of actives | Users with streak ≥ 7 |
| Import conversion | >20% of signups | Users who import from MAL/AniList |
