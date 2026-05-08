# (Mirror) Backend API contract

**Read-only mirror of `animeunwatchedbackend/docs/api-contract.md`.**

Source of truth lives in the backend repo. Do not edit here. This is the file the frontend's `lib/api/endpoints.ts` and `lib/api/types.ts` are derived from.

Last synced: 2026-05-08

To re-sync:

```bash
# from frontend repo root
curl -fsSL https://raw.githubusercontent.com/darwhite08/animeunwatched-backendnew/main/docs/api-contract.md \
  -o docs/peer/backend-api-contract.md
# then update the "Last synced" line above to today's date and commit
```

After re-syncing, audit `lib/api/endpoints.ts` against the new contract — add any new endpoints, adjust shapes if anything changed. The PR that updates this mirror should also update `lib/api/endpoints.ts` and `docs/api-client.md`'s endpoint inventory if the surface changed.

---

(Contents follow on next sync. The backend repo's `docs/api-contract.md` documents the full REST surface at `/api/v1` and the WebSocket at `/socket/v1`:
- Conventions: error shape, pagination, cursor pagination, ID format, time format
- Error codes: VALIDATION, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, RATE_LIMITED, INTERNAL
- Endpoints by domain: auth, users, anime, lists, posts, clubs, threads, reviews, blogs, notifications, search, moderation
- WebSocket events: notification.new, post.liked (v1.1), thread.replied (v1.1)
- OpenAPI spec at `/api/v1/openapi.json`)
