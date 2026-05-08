# Glossary

- **App Router** — Next.js 15 routing system based on the `app/` directory.
- **RSC** — React Server Component. Renders on the server, ships zero JS.
- **Client component** — File with `'use client'`; hydrates in the browser.
- **TanStack Query** — Server-state cache; keys, invalidation, optimistic updates.
- **Zustand** — Lightweight client store. Used for auth access token (in memory) and ephemeral UI state.
- **Hydration** — Server-rendered markup becoming interactive in the browser.
- **Optimistic update** — Mutating local cache before the server confirms; rolling back on error.
- **AccessToken** — Short-lived JWT kept in memory only (no localStorage). Attached to every API call.
- **Refresh cookie** — `aw_refresh`, httpOnly, set by the backend, never read by the frontend.
- **Single-flight refresh** — When multiple 401s race, only one `/auth/refresh` is sent; others wait.
- **Peer doc** — Read-only mirror of the other repo's doc, in `docs/peer/`.
- **Spoiler tag** — Markdown extension `>!hidden!<` rendered as click-to-reveal.
- **Mention** — `@username` token in a post or thread, parsed server-side, generates a notification.
- **shadcn/ui** — Component recipes built on Radix primitives, copied into `components/ui/`.
- **PWA** — Progressive Web App. Installable, offline shell.
- **MSW** — Mock Service Worker. Intercepts network calls in dev/test.
- **axe-core** — Accessibility rule engine, runs in CI.
