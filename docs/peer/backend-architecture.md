# (Mirror) Backend architecture

**Read-only mirror of `animeunwatchedbackend/docs/architecture.md`.**

Source of truth lives in the backend repo. Do not edit here.

Last synced: 2026-05-08

To re-sync:

```bash
# from frontend repo root
curl -fsSL https://raw.githubusercontent.com/darwhite08/animeunwatched-backendnew/main/docs/architecture.md \
  -o docs/peer/backend-architecture.md
# then update the "Last synced" line above to today's date and commit
```

---

(Contents follow on next sync. The backend repo's `docs/architecture.md` describes:
- Express + Socket.io topology, Postgres + CatalogProvider abstraction
- Module layout: `src/modules/<domain>/{routes,controller,service,schema}.ts`
- Auth with JWT access + rotating refresh tokens, family revocation
- Request lifecycle, error model, authorization (site role + club role)
- Data flows for anime detail (cold path) and post + notification
- Realtime via Socket.io with per-user rooms `user:<userId>`
- Background jobs in `src/jobs/` for catalog refresh, episode discussions, token cleanup)
