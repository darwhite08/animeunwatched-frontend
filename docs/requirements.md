# Frontend requirements

Frontend slice of the full product requirements. The complete cross-cutting requirements doc lives at the repo root or in the issue tracker; this file is the version of record for what the frontend must deliver.

## Scope

The frontend is the **only** producer of:

- All UI surfaces (web + PWA)
- Client-side routing (Next.js App Router)
- Server-side rendering for SEO-critical pages (anime detail, profile, blog post)
- API client with refresh-token interceptor
- Socket.io client and notification surfacing
- Form validation (mirrors backend Zod rules; backend is still authoritative)
- Optimistic UI for list edits, likes, follows
- i18n scaffold (English at v1)
- Accessibility (WCAG 2.1 AA on primary flows)

The frontend is **not** responsible for any business rule, persistence, or upstream API integration (Jikan, mail, etc.).

## Functional requirements (frontend slice)

### F-1 Identity

- F-1.1 `/register`, `/login`, `/logout` flows.
- F-1.5 Access token kept in memory only (no localStorage). Refresh cookie is httpOnly and managed by the backend.
- F-1.6 Auto-refresh: API client interceptor catches 401, calls `POST /auth/refresh`, retries once. If refresh fails, redirect to `/login` preserving `?next=`.

### F-2 Profile

- F-2.1 `/u/:username` SSR page with header, stats, recent posts/reviews tabs.
- F-2.2 `/settings` page for editing display name, bio, avatar URL.

### F-3 Catalog

- F-3.2 `/anime/:id` SSR page with hero, synopsis, score, genres, list-status widget, threads, reviews, posts mentioning.
- F-3.3 `/anime/season/:year/:season` browse page with filters.
- F-3.4 Search box in header debounced 250ms; autocomplete dropdown of anime titles + users.

### F-4 Tracking

- F-4.1 Inline status select on anime page; modal with score/episodes/dates/notes for advanced edit.
- F-4.3 `/u/:username/list` filterable, sortable list view.
- F-4.5 Optimistic updates with rollback on error.

### F-5 Posts

- F-5.1 Composer at `/` (home) and on profile (own only). Char counter; anime attach picker.
- F-5.4 Home feed shows posts from followed users; cursor-paginated infinite scroll.
- F-5.5 Discover feed at `/discover`.
- F-5.6 v1.1: image attach UI.

### F-6 Clubs

- F-6.1 `/clubs` index, `/clubs/:slug` detail, `/clubs/new` create.
- F-6.4 Join/leave button.

### F-7 Threads

- F-7.1 Thread editor with markdown support.
- F-7.2 Reply tree UI with collapse/expand.
- F-7.4 Spoiler tag inline rendering.

### F-8 Reviews

- F-8.2 `/anime/:id` "Write review" modal with rating + body + spoiler flag.

### F-9 Blogs

- `/blog` index, `/blog/:slug` reader, `/blog/new` editor (markdown).

### F-10 Follow

- F-10.1 Follow/unfollow button on profile and post cards.

### F-11 Notifications

- F-11.1 Bell in header with unread count (live via socket).
- F-11.2 `/notifications` page with paginated list.

### F-12 Search

- F-12.1 `/search?q=` page with tabs (anime, posts, threads, users, blogs).

### F-13 Moderation

- F-13.1 "Report" action on every content card.
- `/admin/moderation` queue page (visible only to MOD/ADMIN).

## Non-functional

| ID  | Requirement                                                                |
| --- | -------------------------------------------------------------------------- |
| N-2 | TTI on anime detail page < 2.5 s on 4G mobile                              |
| N-7 | WCAG 2.1 AA on primary flows                                               |
| N-8 | All user-facing strings translatable                                       |
| N-9 | Last 2 versions of Chrome, Edge, Firefox, Safari                           |
| N-10| PWA installable; offline shell; viewport-correct on 360 px width           |

## Out of scope (frontend)

- Direct upstream API calls (Jikan, MAL, AniList)
- Any business logic that mutates DB state outside an API call
- Any auth state persisted in localStorage / sessionStorage
- Native mobile (PWA only at v1)
