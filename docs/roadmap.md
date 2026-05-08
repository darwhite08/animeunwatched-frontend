# Roadmap

Tied to `progress.md`. Mirrors the backend's phasing — frontend can lead by a phase or two using mocked endpoints (msw) where the backend isn't ready.

| Phase | Theme           | Headline deliverable                                 | Est. weeks |
| ----- | --------------- | ---------------------------------------------------- | ---------- |
| 0     | Bootstrap       | Layout shell, design system, CI green                | 1          |
| 1     | Identity        | Register/login pages, refresh interceptor, settings  | 2          |
| 2     | Catalog         | Anime detail SSR, season browse, search autocomplete | 3          |
| 3     | Tracking        | List status widget + list page                       | 1          |
| 4     | Social v1       | Composer, feed, discover, notifications + socket     | 3          |
| 5     | Community       | Clubs index/detail, threads, replies                 | 3          |
| 6     | Long-form       | Reviews, blog editor, search results page            | 2          |
| 7     | Moderation      | Report flow, admin queue                             | 1          |
| 8     | Polish + launch | PWA, perf, a11y, Sentry, empty states                | 2          |

Total: ~18 weeks for solo or small team. Apply 50% buffer.

## Working ahead of the backend

When the backend is on Phase N, the frontend can be on Phase N+1 by mocking the not-yet-shipped endpoints:

```ts
// tests/msw/handlers.ts (not in production)
http.post('/api/v1/reviews/:id/like', () => HttpResponse.json({ ok: true }, { status: 204 }));
```

Run dev with mocks: `MSW=true npm run dev`. Once the backend ships the endpoint, drop the mock and the same hooks keep working.

## v1.1 candidates (post-launch)

- Image upload UI (signed URL flow)
- 2FA setup and verification page
- Email verification flow
- Email digest preferences
- Private clubs UI
- Comments on blogs
- Theme customization (light variants beyond baseline)
- Push notifications via PWA

## v2 candidates

- Native mobile (React Native) sharing `lib/api/endpoints.ts` strategy
- Recommendation feed page
- Streaming-link aggregation surface
- Social graph visualization
- Power-user keyboard shortcuts
