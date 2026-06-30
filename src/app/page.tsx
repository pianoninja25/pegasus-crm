"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HardHat,
  Map,
  Receipt,
  ScrollText,
  Snowflake,
  Sparkles,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { CursorGlow } from "@/components/shared/CursorGlow";
import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const features = [
  {
    icon: Users,
    title: "Customers with every detail",
    body: "Profile, every AC unit, contracts, quotations, outstanding invoices and a full interaction timeline — all in one place.",
  },
  {
    icon: ScrollText,
    title: "Service contracts that schedule themselves",
    body: "Pick a frequency, assign an engineer. Pegasus generates every recurring visit — monthly, quarterly, annual or custom.",
  },
  {
    icon: CalendarClock,
    title: "Scheduling that nobody misses",
    body: "Calendar, route, reminders and overdue alerts. The team sees today's jobs the moment they log in.",
  },
  {
    icon: ClipboardCheck,
    title: "Mandatory checklists",
    body: "Every visit closes with a 10-point checklist, before/after photos and customer signature. No exceptions.",
  },
  {
    icon: FileText,
    title: "Quotations to work orders",
    body: "Draft, send, approve. Convert approved quotations directly into service contracts, work orders or invoices.",
  },
  {
    icon: Wallet,
    title: "Finance, live",
    body: "Income, expenses, paid + outstanding invoices, daily / weekly / monthly / yearly summaries — and a clean P&L.",
  },
  {
    icon: HardHat,
    title: "Engineer performance",
    body: "Jobs completed, service hours, revenue generated, customer ratings — leaderboard plus per-engineer activity timeline.",
  },
  {
    icon: Map,
    title: "Maps + nearby search",
    body: "Every customer on an interactive map. Route plan today's stops, surface nearby candidates and never drive empty.",
  },
  {
    icon: Receipt,
    title: "Reports for management",
    body: "Sales by period, engineer leaderboards, top customers, most-replaced spare parts, contract health, P&L.",
  },
];

const proof = [
  "Multi-role access (Admin · Manager · Staff · Engineer)",
  "Recurring maintenance never missed",
  "Quotation → work-order → invoice in one click",
  "Engineer mobile-ready job view",
  "Customer interaction timeline",
  "Real-time KPIs + drill-down reports",
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <CursorGlow />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative pt-36 pb-24 lg:pt-44 lg:pb-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto max-w-4xl text-center"
            >
              <Badge variant="outline" className="mx-auto gap-1.5 border-border/70 bg-card/60 px-3 py-1 text-[11px] backdrop-blur">
                <Sparkles className="h-3 w-3 text-primary" />
                Built for HVAC operators · same opinionated UX as Pegasus
              </Badge>
              <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                The{" "}
                <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                  AC Service OS
                </span>{" "}
                that runs your whole field business.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Customers, AC units, service contracts, quotations, recurring
                schedules, engineer activity, finance and reports — all in one
                glassy dashboard. Demo runs on deterministic mock data.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 px-6">
                  <Link href="/dashboard">
                    Open the dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 px-6">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Fully seeded business: 72 customers, 38 contracts, hundreds of
                recurring visits, live finance. Zero backend, zero signup.
              </p>
            </motion.div>

            <HeroPreview />
          </div>
        </section>

        {/* Features */}
        <section className="relative py-24">
          <div className="container">
            <SectionHeader
              eyebrow="Every module, wired together"
              title="One system. Eight modules. Zero leaks."
              description="Customers, quotations, contracts, scheduling, engineers, checklists, finance and maps — each linking back to the same source of truth."
              align="center"
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.45, delay: i * 0.05 }}
                  >
                    <Card className="group h-full overflow-hidden border-border/60 bg-card/60 backdrop-blur transition hover:border-primary/40 hover:shadow-glow-sm">
                      <CardContent className="space-y-3 p-5">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/25">
                          <Icon className="h-4 w-4" />
                        </span>
                        <h3 className="font-display text-base font-semibold tracking-tight">
                          {f.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{f.body}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Proof strip */}
        <section className="relative py-16">
          <div className="container">
            <div className="rounded-3xl border border-border/60 bg-card/50 px-6 py-10 backdrop-blur lg:px-12">
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Built-in, day one
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    Everything below ships in the demo workspace.
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Open the dashboard and click through every module — they&rsquo;re
                    wired to realistic mock data so you can show the team how it
                    feels before you commit to a real rollout.
                  </p>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {proof.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 px-6 py-16 text-center backdrop-blur lg:px-16">
              <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{ background: "var(--gradient-aurora)" }}
              />
              <div className="relative mx-auto max-w-2xl">
                <Badge variant="outline" className="mx-auto gap-1.5 border-border/70 bg-card/60 px-3 py-1 text-[11px]">
                  <Wrench className="h-3 w-3 text-primary" />
                  No backend required
                </Badge>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  Skip the demo call. Take it for a spin.
                </h2>
                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                  The dashboard is fully interactive. Tick checklists, approve
                  quotations, switch roles, change themes — all driven by
                  deterministic mock data so the demo behaves the same on every
                  reload.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg" className="gap-2 px-6">
                    <Link href="/dashboard">
                      Open the dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero preview                                                               */
/* -------------------------------------------------------------------------- */

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
      className="relative mx-auto mt-16 max-w-5xl"
    >
      <div className="rounded-3xl border border-border/60 bg-card/70 p-3 shadow-glow backdrop-blur">
        <div className="rounded-2xl border border-border/60 bg-background/60 px-6 py-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Snowflake className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-semibold">{siteConfig.name}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-glow" />
              All systems operational
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              {
                label: "Today's sales",
                value: "$2,840",
                tone: "text-emerald-300",
              },
              {
                label: "Active contracts",
                value: "27",
                tone: "text-primary",
              },
              {
                label: "Visits this week",
                value: "31",
                tone: "text-accent-foreground",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/60 bg-card/40 p-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className={`mt-1 font-display text-xl font-semibold ${s.tone}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { title: "Cendana Plaza", subtitle: "Quarterly cleaning · 09:30", color: "#34d399" },
              { title: "Atlas Hotel", subtitle: "VRF service · 11:00", color: "#fbbf24" },
              { title: "Mahkota Office", subtitle: "Compressor swap · 14:00", color: "#38bdf8" },
            ].map((v) => (
              <div
                key={v.title}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 p-2.5"
              >
                <span
                  className="inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: v.color, boxShadow: `0 0 6px ${v.color}` }}
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{v.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {v.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
