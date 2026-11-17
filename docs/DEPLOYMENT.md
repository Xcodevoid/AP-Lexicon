# Deployment

AP Lexicon is a standard Next.js 15 Node app with a PostgreSQL database.

## Environment

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string (use SSL in production, e.g. `?sslmode=require`) |
| `SESSION_SECRET` | ✓ | ≥ 32 random chars (`openssl rand -hex 32`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | at seed time | creates/updates the admin; password ≥ 10 chars |
| `DEMO_MODE` | | `true` to offer demo accounts; set `false` for school deployments if not wanted |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | | optional AI wording explanations; server-side only |

## Steps (any Node host: Render, Railway, Fly.io, a VM, or Vercel + managed Postgres)

```bash
npm ci
```

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

```bash
npm run build
```

```bash
npm start            # PORT env var respected by next start (-p)
```

Notes:

- Run behind HTTPS; session cookies are `Secure` when `NODE_ENV=production`.
- The rate limiter is in-memory: for more than one instance, replace `src/lib/rate-limit.ts` with a Redis/Upstash implementation.
- Schedule `npm run demo:purge 24` daily if demo mode is on.
- Re-running `npm run db:seed` after editing `.lex` files is safe: content is upserted by ID and student data is untouched. Edits made in the admin UI to seeded terms will be overwritten by the next seed for the same IDs — once you manage content in the admin UI, stop re-seeding or keep the `.lex` files in sync.
- Back up the database regularly; `ReviewLog` is the source of truth for analytics and future scheduler tuning.
