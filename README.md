# Pegasus CRM

A demo-grade Customer Relationship Management workspace, built with the same
opinionated UX as [Pegasus Orchestrator](../pegasus). Same theming engine,
same component library, same keyboard-first navigation — repurposed for
sales teams (contacts, companies, deals, pipeline, leads, inbox, reports).

> 100% mock data. **No backend is required.** Every page is wired to a
> deterministic in-memory seed so the demo behaves the same on every reload
> and you can show your team without standing up infrastructure.

---

## Quick start

```bash
# from the repo root
npm install
npm run dev          # next dev — http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

Open `http://localhost:3000` for the marketing landing, or jump straight
into `/dashboard` — the mock auth gate is signed in by default as
**Leo Santoso**.

---

## What's in the box

### Marketing surface
- **`/`** — landing page with a stylised dashboard preview, feature grid,
  proof strip and CTA.
- **`/login`** — mock sign-in (any credential lands you in the demo
  workspace).

### Dashboard
- **`/dashboard`** — overview with stats, pipeline-by-stage summary, inbox
  highlights, top open deals, upcoming tasks and team performance.
- **`/dashboard/pipeline`** — Kanban board across the 5 active deal
  stages, with drag-and-drop reordering wired to a TanStack mutation
  (optimistic move, mock latency).
- **`/dashboard/contacts`** (and `/contacts/[id]`) — list with search,
  tag filter, starred filter; detail view with full record + linked
  deals + activity timeline.
- **`/dashboard/companies`** (and `/companies/[id]`) — grid view with
  per-account stats; detail view with people, deals, location, hero
  card.
- **`/dashboard/deals`** (and `/deals/[id]`) — list with sort + stage
  filter; detail view with stage tracker, forecasted value, stage
  history + activity timeline, related people.
- **`/dashboard/activities`** — unified task list with tabs (Today /
  Upcoming / Overdue / Done / All), per-kind filter, complete toggle.
- **`/dashboard/leads`** — scored grid with status filters, predictive
  score badges and convert action.
- **`/dashboard/inbox`** — split-pane inbox with filters (all / unread /
  starred / needs reply), thread detail with quick-reply composer.
- **`/dashboard/reports`** — pipeline-by-stage chart, revenue-by-owner
  stacked bars, top deal sources, activity mix.
- **`/dashboard/calendar`** — month grid + upcoming list, fed by the
  same activities seed.
- **`/dashboard/notifications`** — full inbox of system, mention, deal
  and activity alerts.
- **`/dashboard/settings`** — profile, appearance (theme picker),
  members, notifications, billing, security, changelog.

### Ambient affordances
- **Sidebar** — collapses to icon-only (72px), persists across reloads;
  mobile sheet on small screens. Live badges for inbox / notifications /
  open activities.
- **Command palette** — ⌘K / Ctrl+K from anywhere; navigates between
  routes, fires "create" actions, switches themes.
- **Notifications bell** — popover from the topbar; mark-read on click,
  mark-all-read.
- **User menu** — workspace switcher, profile / theme deep-links,
  sign-out.
- **Theme presets** — five vibes (Midnight Glass, Solar Atlas, Cosmic
  Pulse, Neon Tides, Revenue Emerald). Live previews in
  `/dashboard/settings#appearance` and the command palette.

---

## Tech stack

| Layer              | Choice                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| Framework          | **Next.js 15** (app router, React 19)                                                              |
| Styling            | **Tailwind CSS** with custom CSS variables for live theming                                        |
| UI primitives      | **shadcn/ui** (Radix-based) — buttons, dialogs, sheets, popovers, tabs, select, etc.               |
| State (client)     | **Zustand** with `persist` for theme, sidebar, mock auth                                           |
| State (server)     | **TanStack Query** wrapping mock async functions over the seed                                     |
| Motion             | **Framer Motion** for the navbar pill, hero entrance, kanban cards                                 |
| Icons              | **Lucide React**                                                                                   |
| Mock data          | Deterministic PRNG (mulberry32) in `src/features/common/seed.ts`                                   |

---

## Repo layout

```
src/
├─ app/
│  ├─ (app)/dashboard/            # Auth-gated dashboard pages
│  │  ├─ layout.tsx               # DashboardShell (sidebar + topbar)
│  │  ├─ page.tsx                 # Overview
│  │  ├─ pipeline/                # Kanban
│  │  ├─ contacts/[id]/...        # List + detail
│  │  ├─ companies/[id]/...
│  │  ├─ deals/[id]/...
│  │  ├─ activities/
│  │  ├─ leads/
│  │  ├─ inbox/
│  │  ├─ reports/
│  │  ├─ calendar/
│  │  ├─ notifications/
│  │  └─ settings/
│  ├─ login/                       # Mock sign-in
│  ├─ page.tsx                     # Marketing landing
│  ├─ globals.css                  # Theme tokens + utility classes
│  └─ layout.tsx                   # Root layout + AppProviders
├─ components/
│  ├─ ui/                          # shadcn primitives
│  ├─ common/                      # PersonChip, StatusPill, TimeStamp
│  ├─ shared/                      # Logo, Navbar, Footer, CommandPalette, ...
│  └─ dashboard/                   # Shell, Sidebar, Topbar, UserMenu, NotificationsMenu
├─ features/
│  ├─ theme/                       # Preset definitions, store, provider, utils
│  ├─ auth/                        # Mock auth store + AuthGate
│  ├─ common/                      # Shared types (DealStage, Priority, …) + seed.ts
│  ├─ contacts/                    # api hooks (TanStack Query)
│  ├─ companies/
│  ├─ deals/
│  ├─ activities/
│  ├─ leads/
│  ├─ inbox/
│  └─ notifications/
├─ providers/                      # AppProviders (theme + query + tooltip)
├─ hooks/                          # useMounted, usePrefersReducedMotion
├─ lib/                            # cn, format helpers
└─ config/                         # site, dashboard nav
```

---

## Roadmap

This repo deliberately ships frontend-only. The natural next steps:

- Promote the mock feature hooks to a real backend (drop-in: same
  signatures, swap `delay()` for `fetch()`).
- CSV import for contacts and leads.
- Email / calendar sync for the inbox + activities.
- Per-workspace persistence for theme + sidebar collapse.
- Custom fields per entity (currently the seed defines the shape).

---

## Acknowledgements

Forked in spirit from [Pegasus](../pegasus) — same theme system, same
component library, same opinionated keyboard-first UX, just pointed at a
different problem.
