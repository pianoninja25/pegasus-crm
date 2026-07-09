# Pegasus AC Service

A demo-grade Service Management workspace for an AC servicing business,
built with the same opinionated UX as [Pegasus
Orchestrator](../pegasus). Same theming engine, same component library,
same keyboard-first navigation — repurposed for HVAC field teams
(customers, engineers, quotations, service contracts, work orders,
scheduling, invoicing).

> 100% mock data. **No backend is required.** Every page is wired to a
> deterministic in-memory seed (`mulberry32` PRNG) so the demo behaves
> the same on every reload and you can show your team without standing
> up infrastructure.

---

## Quick start

```bash
npm install
npm run dev          # next dev — http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

Open `http://localhost:3000` for the marketing landing, or jump straight
into `/dashboard` — the mock auth gate is signed in by default as
**Leo Santoso**.

---

## Backend stack (in-progress)

The frontend is complete; the real backend is being built into this same
Next.js app (Route Handlers + Server Actions). See
[BACKEND_PLAN.md](./BACKEND_PLAN.md) for the full architecture doc.

### Local dev with backing services

`docker-compose.yml` runs the backing services (Postgres, Redis, MinIO)
on your machine; you keep running `next dev` on the host for hot reload.

```bash
cp .env.example .env.local
docker compose up -d          # start postgres + redis + minio
npm run dev                   # http://localhost:3000
```

Handy URLs while services are up:

| Service          | URL                                |
|------------------|------------------------------------|
| App              | http://localhost:3000              |
| Postgres         | `postgres://pegasus:pegasus_dev@localhost:5432/pegasus` |
| Redis            | `redis://localhost:6379`           |
| MinIO S3 API     | http://localhost:9000              |
| MinIO console    | http://localhost:9001 (login with `MINIO_ROOT_*` from `.env.local`) |

Teardown:

```bash
docker compose down            # stop, keep data volumes
docker compose down -v         # stop and wipe all data
```

### Database (Drizzle + Postgres)

The schema lives at `src/db/schema.ts` and mirrors `features/service/types.ts`
and `features/platform/types.ts` one-to-one. Migrations are SQL files under
`src/db/migrations/`.

```bash
npm run db:generate        # diff schema → generate new migration SQL
npm run db:migrate         # apply pending migrations to DATABASE_URL
npm run db:push            # push schema directly (fast dev iteration, no migration file)
npm run db:seed            # load the mock seed into Postgres (destructive — TRUNCATEs first)
npm run db:studio          # open Drizzle Studio in your browser
```

First-time setup on a fresh DB:

```bash
docker compose up -d
npm run db:migrate
npm run db:seed
```

**Two Postgres roles by design:**

| Role | Used by | Superuser? | Bypasses RLS? |
|---|---|---|---|
| `pegasus` | migrations, seed, drizzle-kit | yes | yes |
| `pegasus_app` | app runtime (Route Handlers) | no | no |

The split is essential for Row-Level Security to actually enforce tenant
isolation — Postgres superusers bypass all RLS policies unconditionally.
The non-superuser app role is created on first Postgres boot by
`docker/postgres-init/01-app-user.sh` and granted table privileges by
migration `0003_grant_app_user.sql`.

Route handlers must use one of the scoped-DB helpers:

```ts
import { withTenantContext, withSuperadminContext } from "@/db/tenant-scope";

// Tenant-scoped query — RLS filters by tenant_id automatically.
const rows = await withTenantContext(session.tenantId, (tx) =>
  tx.select().from(customers)
);

// Platform admin query — bypasses tenant filtering.
const allTenants = await withSuperadminContext((tx) =>
  tx.select().from(tenants)
);
```

Never call plain `db.select()` from a route handler — no scope means no
rows visible, or (in dev with the wrong URL) tenant isolation silently
disabled.

### Production stack (self-hosted VM)

`docker-compose.prod.yml` runs the full stack on a single VM: the Next.js
app, Postgres, Redis, MinIO, and Caddy for automatic HTTPS.

```bash
# on the VM
git clone <repo> && cd pegasus-crm
cp .env.example .env.prod         # fill in real values, including APP_DOMAIN
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Point your DNS `A`/`AAAA` record for `${APP_DOMAIN}` at the VM before first
startup — Caddy will fetch a Let's Encrypt cert automatically.

---

## Modules

### Marketing surface
- **`/`** — landing page with feature grid + CTA
- **`/login`** — mock sign-in (any credential lands you in the demo
  workspace)

### Workspace
- **`/dashboard`** — overview with KPI cards, upcoming work orders, MTD
  revenue, contract renewals, top customers, team performance
- **`/dashboard/scheduling`** — single-screen dispatcher view: KPI
  command strip, month calendar with engineer-segmented load bars,
  selected-day timeline, and an engineer workload rail
- **`/dashboard/my-tasks`** — engineer-facing today/upcoming list with
  one-tap status changes

### Operations
- **`/dashboard/customers`** — list with a built-in map view; insight
  strip (active / VIP / prospect / churn-risk), URL-persisted filters
  and search, inline create dialog
- **`/dashboard/engineers`** — roster with skill / rating / utilisation
  filters; detail view with assigned work orders
- **`/dashboard/quotations`** — pipeline with win-rate KPI, branded
  PDF download, WhatsApp share flow
- **`/dashboard/contracts`** — recurring maintenance agreements with
  auto-generated work-order schedules
- **`/dashboard/work-orders`** — every field job; checklist + signature
  + photo capture on the detail page

### Finance
- **`/dashboard/finance/invoices`** — KPI strip (issued / paid /
  outstanding / overdue), URL-persisted filters, drill-down to detail
- **`/dashboard/finance/expenses`** — categorised expense ledger with
  same enterprise pattern as invoices
- **`/dashboard/reports`** — service mix, revenue by month, top
  customers, engineer KPIs, P&L summary

### Account
- **`/dashboard/notifications`** — system, mention, contract and
  work-order alerts
- **`/dashboard/settings`** — language + currency, company brand
  (logo/stamp/signature/bank for branded PDFs), appearance presets,
  members

---

## Ambient affordances
- **Sidebar** — collapses to icon-only (72px), persists across reloads;
  mobile sheet on small screens. Live badges for notifications and
  overdue work orders.
- **Command palette** — ⌘K / Ctrl+K from anywhere; navigates between
  routes, fires "create" actions, switches themes.
- **Notifications bell** — popover from the topbar; mark-read on click,
  mark-all-read.
- **User menu** — workspace switcher, profile / theme deep-links,
  sign-out.
- **Theme presets** — five vibes (Midnight Glass, Solar Atlas, Cosmic
  Pulse, Neon Tides, Revenue Emerald). Live previews in
  `/dashboard/settings#appearance` and the command palette.
- **i18n** — English ↔ Bahasa Indonesia toggle with a flat,
  type-safe dictionary; locale persists per browser.
- **Currency** — IDR / USD toggle, used everywhere (KPIs, tables, PDFs).

---

## Tech stack

| Layer              | Choice                                                                                |
| ------------------ | ------------------------------------------------------------------------------------- |
| Framework          | **Next.js 15** (app router, React 19)                                                |
| Styling            | **Tailwind CSS** with custom CSS variables for live theming                          |
| UI primitives      | **shadcn/ui** (Radix-based) — buttons, dialogs, sheets, popovers, tabs, select, etc. |
| State (client)     | **Zustand** with `persist` for theme, sidebar, mock auth, locale, currency, company  |
| State (server)     | **TanStack Query** wrapping mock async functions over the seed                       |
| Maps               | **MapLibre GL JS** + `react-map-gl`                                                  |
| PDF                | **@react-pdf/renderer** (client-side quotation PDFs)                                 |
| Motion             | **Framer Motion** for the navbar pill, hero entrance, contract progress              |
| Icons              | **Lucide React**                                                                     |
| Mock data          | Deterministic PRNG (mulberry32) in `src/features/service/seed.ts`                    |
| **Backend (WIP)**  | Next.js Route Handlers + Server Actions, **Drizzle ORM**, **PostgreSQL 16**, **Better Auth**, **BullMQ + Redis** for jobs, **MinIO/R2** for object storage, **Caddy** for HTTPS |
| **Infra (WIP)**    | Docker Compose (`docker-compose.yml` dev services, `docker-compose.prod.yml` full VM stack) |

---

## Repo layout

```
src/
├─ app/
│  ├─ (app)/dashboard/             # Auth-gated dashboard pages
│  │  ├─ layout.tsx                # DashboardShell (sidebar + topbar)
│  │  ├─ page.tsx                  # Overview
│  │  ├─ scheduling/               # Compact dispatcher (calendar + day panel + workload)
│  │  ├─ my-tasks/                 # Engineer-facing task list
│  │  ├─ customers/[id]/           # List + detail (+ inline new dialog, embedded map)
│  │  ├─ engineers/[id]/
│  │  ├─ quotations/[id]/          # + PDF + WhatsApp share
│  │  ├─ contracts/[id]/           # + recurring work-order generator
│  │  ├─ work-orders/[id]/         # + checklist + signature
│  │  ├─ finance/invoices/         # KPIs, filters, drill-down
│  │  ├─ finance/expenses/         # Categorised expense ledger
│  │  ├─ reports/                  # P&L, service mix, leaderboards
│  │  ├─ notifications/
│  │  └─ settings/
│  ├─ login/                       # Mock sign-in
│  ├─ page.tsx                     # Marketing landing
│  ├─ globals.css                  # Theme tokens + utility classes
│  └─ layout.tsx                   # Root layout + AppProviders
├─ components/
│  ├─ ui/                          # shadcn primitives
│  ├─ common/                      # InsightCard, StatusBadge, Pagination,
│  │                                 DataTableColumnHeader, useTableUrlState, ...
│  ├─ contracts/                   # NewContractDialog
│  ├─ customers/                   # NewCustomerDialog, CustomersMap
│  ├─ engineers/                   # NewEngineerDialog
│  ├─ quotations/                  # NewQuotationDialog, QuotationPDF,
│  │                                 SendViaWhatsappDialog, useQuotationPdf
│  ├─ settings/                    # CompanyBrandPanel
│  ├─ shared/                      # Logo, Navbar, Footer, CommandPalette, ...
│  └─ dashboard/                   # Shell, Sidebar, Topbar, UserMenu, NotificationsMenu
├─ features/
│  ├─ theme/                       # Preset definitions, store, provider
│  ├─ auth/                        # Mock auth store + AuthGate
│  ├─ locale/                      # Dictionary (EN + ID), useT, currency
│  ├─ company/                     # CompanyProfile store (branding for PDFs)
│  ├─ common/                      # mock helpers (delay, clone, PRNG)
│  └─ service/                     # types.ts + seed.ts + hooks.ts (core data)
├─ providers/                      # AppProviders (theme + query + tooltip)
├─ hooks/                          # useMounted, usePrefersReducedMotion
├─ lib/                            # cn, format helpers, whatsapp utils
└─ config/                         # site, dashboard nav
```

---

## Roadmap

This repo deliberately ships frontend-only. Natural next steps:

- Promote the mock feature hooks to a real backend (drop-in: same
  signatures, swap `delay()` for `fetch()`).
- Engineer-facing PWA / mobile-first variant of `/my-tasks` with
  offline checklist sync.
- WhatsApp Business API integration for true 1-step quotation send
  (current flow opens `wa.me` and prompts the user to attach the PDF).
- Per-customer SLA tracking + auto-escalation on overdue work orders.
- Live MQTT / webhook receiver for IoT-connected AC units.

---

## Acknowledgements

Forked in spirit from [Pegasus](../pegasus) — same theme system, same
component library, same opinionated keyboard-first UX, just pointed at a
different problem.
