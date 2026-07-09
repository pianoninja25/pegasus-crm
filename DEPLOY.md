# Deploying Pegasus CRM to your VM

> Runbook for the **first deploy** of the current codebase to a fresh
> Linux VM. Follow top to bottom. Every step is idempotent unless noted.

---

## What you're deploying today

**Be aware:** the frontend is still on mock in-memory data — nothing in
`features/service/hooks.ts` has been swapped to hit the real API yet, and
Better Auth is not wired. This first deploy is a **staging validation**:

- ✅ Docker Compose stack (Next.js app + Postgres + Redis + MinIO + Caddy)
- ✅ Automatic HTTPS via Caddy + Let's Encrypt
- ✅ Postgres schema created + Drizzle migrations applied by the migrator
- ✅ RLS enforced (`pegasus_app` non-superuser role)
- ✅ Optional demo seed dataset available on-demand
- ⚠️ App itself renders the same mock-data UX as `npm run dev`
- ⚠️ Auth still uses `localStorage` — anyone with the URL can "sign in"
- ⚠️ Data doesn't persist between reloads yet (still Zustand + in-memory)

Treat the URL as internal until we wire up Better Auth + real API routes
in the next milestones.

---

## 1. VM prerequisites (do these once)

- [ ] Ubuntu 22.04 / 24.04 or Debian 12 (any modern distro works)
- [ ] At least **2 vCPU, 2 GB RAM, 20 GB disk** — comfortably fits everything
- [ ] SSH access with a non-root sudo user
- [ ] Docker Engine + Compose plugin installed:

  ```bash
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker $USER
  # log out + log back in so the group takes effect
  docker --version && docker compose version
  ```

- [ ] Firewall (`ufw` or provider firewall) — expose only:

  | Port | Purpose |
  |---|---|
  | `22` | SSH |
  | `80` | Caddy — needed for Let's Encrypt HTTP-01 challenge |
  | `443` | Caddy — HTTPS |

  Everything else (Postgres 5432, Redis 6379, MinIO 9000/9001, app 3000) is
  reachable **only inside the compose network**. Do **not** publish them.

  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

## 2. DNS

- [ ] Point an `A` (and optionally `AAAA`) record for your chosen domain at
      the VM's public IP.

  Example: `app.pegasus.example.com → 203.0.113.42`

- [ ] Wait for DNS to propagate before continuing (30 s – 5 min usually):

  ```bash
  dig +short app.pegasus.example.com
  ```

  **Caddy will fail to fetch a cert if DNS isn't resolving to this VM.**

## 3. Get the code onto the VM

- [ ] Clone the repo:

  ```bash
  git clone <your-repo-url> pegasus-crm
  cd pegasus-crm
  ```

  Or, if the repo is private and you don't want to give the VM Git access,
  build locally + push to a container registry — see §7 "CI/CD later".

## 4. Configure secrets

- [ ] Copy the example env file:

  ```bash
  cp .env.example .env.prod
  ```

- [ ] Generate strong secrets and fill in `.env.prod`:

  ```bash
  # Postgres — the superuser password. Generate:
  openssl rand -hex 24

  # App-role password. Generate a separate one:
  openssl rand -hex 24

  # MinIO admin password. Same:
  openssl rand -hex 24

  # Better Auth secret (used later — set it now so we don't reboot for it):
  openssl rand -hex 32
  ```

- [ ] Fill in the following **must-set** values in `.env.prod`:

  ```
  APP_DOMAIN=app.pegasus.example.com

  POSTGRES_USER=pegasus
  POSTGRES_PASSWORD=<24-hex-from-above>
  POSTGRES_DB=pegasus

  PEGASUS_APP_USER=pegasus_app
  PEGASUS_APP_PASSWORD=<different-24-hex>

  DATABASE_URL=postgres://pegasus_app:<PEGASUS_APP_PASSWORD>@postgres:5432/pegasus
  MIGRATION_DATABASE_URL=postgres://pegasus:<POSTGRES_PASSWORD>@postgres:5432/pegasus

  REDIS_URL=redis://redis:6379

  MINIO_ROOT_USER=minio_admin
  MINIO_ROOT_PASSWORD=<24-hex>

  S3_ENDPOINT=http://minio:9000
  S3_REGION=us-east-1
  S3_BUCKET=pegasus
  S3_ACCESS_KEY_ID=minio_admin
  S3_SECRET_ACCESS_KEY=<same-as-MINIO_ROOT_PASSWORD>
  S3_FORCE_PATH_STYLE=true

  BETTER_AUTH_URL=https://app.pegasus.example.com
  BETTER_AUTH_SECRET=<32-hex-from-above>

  RESEND_API_KEY=            # leave blank until you sign up at resend.com
  RESEND_FROM="Pegasus CRM <noreply@pegasus.example.com>"
  ```

  **Important:** hostnames inside `DATABASE_URL` / `REDIS_URL` / `S3_ENDPOINT`
  are the compose **service names** (`postgres`, `redis`, `minio`) — **not**
  `localhost`. Localhost inside the app container means the app container
  itself, not the VM.

- [ ] Sanity-check the file:

  ```bash
  grep -E "^(APP_DOMAIN|DATABASE_URL|MIGRATION_DATABASE_URL|BETTER_AUTH_URL)=" .env.prod
  ```

## 5. First boot

- [ ] Bring the whole stack up. `--build` compiles the app image locally:

  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
  ```

  What happens:

  1. Postgres starts. First-boot init script creates the `pegasus_app` role.
  2. The `migrator` container runs `tsx src/db/migrate.ts`, applies all
     four migrations, and exits with code 0.
  3. Redis + MinIO + minio-init come up.
  4. `app` starts (waits for `migrator` to complete successfully).
  5. `caddy` starts, fetches a Let's Encrypt cert for `${APP_DOMAIN}`,
     starts proxying `443 → app:3000`.

- [ ] Watch the logs and wait for "server started" and Caddy's cert:

  ```bash
  docker compose -f docker-compose.prod.yml logs -f app caddy
  ```

- [ ] Confirm the app is healthy:

  ```bash
  # From the VM itself
  curl -sf http://localhost:3000/api/health | jq
  #  → { "status": "ok", "db": "ok", ... }

  # From your laptop
  curl -sf https://app.pegasus.example.com/api/health | jq
  ```

## 6. Load the demo dataset (optional)

The app currently expects the demo data to be present. If you want the
real Postgres tables filled with the 72 customers / 253 visits / etc. so
`/admin` looks populated:

- [ ] Run the seed profile:

  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.prod \
    --profile seed run --rm seeder
  ```

  Safe to re-run — the seed TRUNCATEs every table first.

  If you want an **empty** production DB instead, just skip this step.

## 7. Post-deploy checks

- [ ] Site loads: `https://app.pegasus.example.com` → landing page
- [ ] Health endpoint returns 200: `curl https://app.pegasus.example.com/api/health`
- [ ] SSL cert is valid (no warnings)
- [ ] All containers healthy:

  ```bash
  docker compose -f docker-compose.prod.yml ps
  ```

- [ ] Migrations are recorded:

  ```bash
  docker compose -f docker-compose.prod.yml exec postgres \
    psql -U pegasus -d pegasus -c "SELECT * FROM drizzle.__drizzle_migrations;"
  ```

- [ ] RLS enforces isolation:

  ```bash
  docker compose -f docker-compose.prod.yml exec postgres \
    psql -U pegasus_app -d pegasus -c "SELECT COUNT(*) FROM customers;"
  # → 0  (no context set, RLS blocks)
  ```

## 8. Day-2 operations

### Deploying a new build

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

The `migrator` container automatically runs any new migrations before `app`
starts, and health-checked rolling restart ensures Caddy doesn't route to a
broken container.

### Nightly backups (recommended — set up before you have real users)

Simple cron entry on the VM:

```bash
# /etc/cron.d/pegasus-backup — replace <REMOTE> with an off-VM target
0 3 * * * root docker exec pegasus-crm-prod-postgres-1 \
  pg_dump -U pegasus -d pegasus | gzip > /backups/pegasus-$(date +\%F).sql.gz
```

Rotate/prune older than 30 days:

```bash
find /backups -name 'pegasus-*.sql.gz' -mtime +30 -delete
```

For durability, `rclone` or `restic` those files to R2 / B2 / S3.

### Restoring from a backup

```bash
gunzip < /backups/pegasus-2026-07-09.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres \
    psql -U pegasus -d pegasus
```

### Log inspection

```bash
docker compose -f docker-compose.prod.yml logs --tail=200 -f app
docker compose -f docker-compose.prod.yml logs --tail=200 -f caddy
```

### Rolling back a bad deploy

```bash
git checkout <last-good-sha>
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Migrations are one-way — if you rolled back over a migration you don't
want, you'll need a manual `DOWN` SQL against the DB. Prefer forward-only
fixes.

---

## 9. What still needs to be built before this is a real production app

In rough priority order:

1. **Better Auth** — replace the mock localStorage login with real sessions
2. **Session → tenant scope middleware** — wire `withTenantContext` into
   every route handler using the current session's tenant
3. **First vertical slice** — swap `useCustomers` / `useCreateCustomer`
   from mock to real API routes
4. **Storage quota metering** — count real bytes uploaded to MinIO/R2
5. **Background jobs** — BullMQ worker for reminders + storage recount
6. **Server-side PDF generation** — move `@react-pdf/renderer` to a route
   handler so quotations are persisted + shareable
7. **Real email** — Resend + React Email templates

See [BACKEND_PLAN.md](./BACKEND_PLAN.md) for the full plan and open decisions.

## 10. Troubleshooting

**Caddy: cert fetch fails**
Check `docker compose logs caddy` — usually DNS not propagated, or port 80
is blocked upstream (some cloud providers block :80 until you request it
opened). Verify from an external host:

```bash
curl -v http://app.pegasus.example.com/  # should reach Caddy
```

**App: `ECONNREFUSED postgres:5432`**
Postgres isn't healthy yet or the compose network is wrong. Confirm:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs postgres
```

**App: `password authentication failed for user "pegasus_app"`**
The Postgres data volume was created with a different password than what's
in `.env.prod` now. Either roll `.env.prod` back to the original password,
or wipe the volume and re-migrate:

```bash
docker compose -f docker-compose.prod.yml down
docker volume rm pegasus-crm-prod_postgres_data   # DESTRUCTIVE — data loss
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

**Migrator exits with a non-zero code**
The `app` service won't start until the migrator succeeds. Read its logs:

```bash
docker compose -f docker-compose.prod.yml logs migrator
```

Usually a bad connection string or a hand-edited migration file that
doesn't parse.

**Everything came up but `/api/health` returns 503**
DB round-trip is failing. Check the app logs for a Postgres error, and
confirm the `DATABASE_URL` in `.env.prod` uses hostname `postgres` (the
compose service name), not `localhost`.
