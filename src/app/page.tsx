"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Inbox,
  KanbanSquare,
  PieChart,
  Sparkles,
  Target,
  Users,
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
    title: "Contacts you actually trust",
    body: "Single record per person, merged by signal — emails replied, calls answered, deals influenced.",
  },
  {
    icon: Building2,
    title: "Accounts with shape",
    body: "Companies show the people who matter, the open deals, and the last time anyone touched them.",
  },
  {
    icon: KanbanSquare,
    title: "A pipeline that doesn't lie",
    body: "Drag deals across stages. Velocity, win-rate and expected revenue update the moment you do.",
  },
  {
    icon: Inbox,
    title: "Inbox that thinks like a rep",
    body: "Replies stitched to the right deal. Stars, snoozes and quick replies — without leaving the CRM.",
  },
  {
    icon: Target,
    title: "Leads, scored honestly",
    body: "Predictive score on every new lead based on source, fit and engagement velocity.",
  },
  {
    icon: PieChart,
    title: "Reports that pre-fill",
    body: "Pipeline by stage, win-rate by owner, ageing deals — all rendered in seconds, none of it manual.",
  },
];

const proof = [
  "Multi-currency revenue",
  "Real-time pipeline",
  "Custom fields, no migration tax",
  "Ambient AI assistant",
  "Workspace-native theming",
  "Keyboard-first navigation",
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
                Same opinionated UX as Pegasus Orchestrator
              </Badge>
              <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                The{" "}
                <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                  Relationship Engine
                </span>{" "}
                for modern sales teams.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {siteConfig.description.split(".")[0]}. Glassy. Themeable. Built
                so your team treats the CRM like a Linear board, not a punishment.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2 px-6">
                  <Link href="/dashboard">
                    Open the demo CRM
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 px-6">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Fully seeded with a believable book of business. No backend, no
                signup, no friction.
              </p>
            </motion.div>

            <HeroPreview />
          </div>
        </section>

        {/* Features */}
        <section className="relative py-24">
          <div className="container">
            <SectionHeader
              eyebrow="Everything you need, nothing you don't"
              title="A CRM that disappears into your workflow."
              description="Built around the deal — the contacts, companies, activities and conversations that move it forward."
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
                    Open the dashboard and click around — every page is wired to
                    realistic mock data so you can show your team exactly how it
                    feels.
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
                  <Briefcase className="h-3 w-3 text-primary" />
                  No backend required
                </Badge>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  Skip the demo call. Take it for a spin.
                </h2>
                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                  The dashboard is fully interactive. Drag deals across stages,
                  star contacts, switch themes — all driven by deterministic mock
                  data so the demo behaves the same on every reload.
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
/* Hero preview — a stylised mock of the dashboard, animated on entrance      */
/* -------------------------------------------------------------------------- */

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
      className="relative mx-auto mt-14 max-w-5xl"
    >
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-glow backdrop-blur">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: "var(--gradient-aurora)" }}
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-[200px_1fr]">
          {/* sidebar mock */}
          <div className="hidden border-r border-border/60 bg-background/40 p-4 lg:block">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[image:var(--gradient-primary)] text-[10px] font-bold text-primary-foreground shadow-glow-sm">
                P
              </span>
              <span className="text-xs font-semibold tracking-tight">Pegasus</span>
            </div>
            <div className="space-y-1.5">
              {["Dashboard", "Pipeline", "Inbox", "Contacts", "Companies", "Deals", "Activities"].map((label, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                    i === 1
                      ? "bg-primary/15 text-foreground ring-1 ring-inset ring-primary/25"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                  {label}
                </div>
              ))}
            </div>
          </div>
          {/* kanban mock */}
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <KanbanSquare className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">Pipeline · Q3</span>
              <span className="ml-auto rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                $2.4M open
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { name: "Qualified", count: 12, deals: [{ label: "Atlas Labs", amount: "42k" }, { label: "Stride Group", amount: "28k" }] },
                { name: "Proposal", count: 8, deals: [{ label: "Helio Capital", amount: "75k" }] },
                { name: "Negotiation", count: 5, deals: [{ label: "Lattice Bio", amount: "120k" }] },
                { name: "Won", count: 14, deals: [{ label: "Cinder Health", amount: "180k" }], accent: true },
              ].map((col) => (
                <div
                  key={col.name}
                  className="rounded-xl border border-border/60 bg-background/40 p-2"
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {col.name}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                        col.accent ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {col.count}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {col.deals.map((deal) => (
                      <div
                        key={deal.label}
                        className="rounded-lg border border-border/60 bg-card/60 p-2"
                      >
                        <p className="truncate text-[11px] font-medium">{deal.label}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          ${deal.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
