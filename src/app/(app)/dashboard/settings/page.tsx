"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Mail,
  Palette,
  Shield,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { themePresets } from "@/features/theme/themes";
import { useThemeStore } from "@/features/theme/themeStore";
import { teamMembers, workspace } from "@/features/common/seed";
import { useAuthStore } from "@/features/auth/authStore";

const SECTIONS = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "members", label: "Members", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "changelog", label: "What's new", icon: Sparkles },
];

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Settings
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Workspace settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personal, team and workspace-wide preferences.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
        <nav className="lg:sticky lg:top-4 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-5">
          <ProfileSection />
          <AppearanceSection />
          <MembersSection />
          <NotificationsSection />
          <BillingSection />
          <SecuritySection />
          <ChangelogSection />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ProfileSection() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return (
    <Card id="profile">
      <CardHeader>
        <CardTitle className="text-sm">Profile</CardTitle>
        <CardDescription>How you appear to teammates and customers.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-20 w-20 ring-2 ring-primary/20">
            <AvatarFallback className="bg-[image:var(--gradient-primary)] text-lg font-semibold text-primary-foreground">
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" className="h-7 text-[11px]">
            Change avatar
          </Button>
        </div>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" defaultValue={user.name} />
            <Field label="Email" defaultValue={user.email} type="email" />
            <Field label="Title" defaultValue={user.title} />
            <Field label="Time zone" defaultValue="GMT+07:00 — Jakarta" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save changes</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceSection() {
  const presetId = useThemeStore((s) => s.presetId);
  const setPreset = useThemeStore((s) => s.setPreset);
  const reset = useThemeStore((s) => s.resetCustomizations);

  return (
    <Card id="appearance">
      <CardHeader>
        <CardTitle className="text-sm">Appearance</CardTitle>
        <CardDescription>
          Pick the vibe. Themes are workspace-scoped and persist across reloads.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {themePresets.map((p) => {
            const active = p.id === presetId;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card/40 p-3 text-left transition",
                  active
                    ? "border-primary/60 ring-2 ring-primary/30 shadow-glow-sm"
                    : "border-border/60 hover:border-primary/40",
                )}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: `hsl(${p.palette.primary})` }}
                />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.vibe}</p>
                  </div>
                  <span className="font-display text-base text-muted-foreground">
                    {p.symbol}
                  </span>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground line-clamp-2">
                  {p.tagline}
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <Swatch hsl={p.palette.primary} />
                  <Swatch hsl={p.palette.accent} />
                  <Swatch hsl={p.palette.background} />
                  <Swatch hsl={p.palette.card} />
                  {active && (
                    <Badge variant="default" className="ml-auto h-4 text-[9px]">
                      <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" /> Active
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>
            Customisations (palette overrides, etc.) are reset whenever you pick
            a new preset.
          </p>
          <Button variant="outline" size="sm" onClick={() => reset()}>
            Reset overrides
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MembersSection() {
  return (
    <Card id="members">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm">
            Members ({teamMembers.length})
          </CardTitle>
          <CardDescription>People with access to {workspace.name}.</CardDescription>
        </div>
        <Button size="sm" className="gap-1.5">
          <Mail className="h-3.5 w-3.5" /> Invite
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border/60">
          {teamMembers.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 py-2.5"
            >
              <Avatar className="h-8 w-8 ring-1 ring-border/60">
                <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                  {initials(m.name, m.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{m.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{m.email}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {m.role}
              </Badge>
              <Badge variant="outline" className="hidden sm:inline-flex">
                {m.title}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function NotificationsSection() {
  const [emailNew, setEmailNew] = useState(true);
  const [emailDeal, setEmailDeal] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [pushMentions, setPushMentions] = useState(true);
  return (
    <Card id="notifications">
      <CardHeader>
        <CardTitle className="text-sm">Notifications</CardTitle>
        <CardDescription>Choose when we reach out to you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <Toggle label="Email me when a new lead arrives" checked={emailNew} onCheckedChange={setEmailNew} />
        <Toggle label="Email me on every deal stage change" checked={emailDeal} onCheckedChange={setEmailDeal} />
        <Toggle label="Daily pipeline digest at 8am" checked={emailDigest} onCheckedChange={setEmailDigest} />
        <Toggle label="Push notification on @mentions" checked={pushMentions} onCheckedChange={setPushMentions} />
      </CardContent>
    </Card>
  );
}

function BillingSection() {
  return (
    <Card id="billing">
      <CardHeader>
        <CardTitle className="text-sm">Billing</CardTitle>
        <CardDescription>
          You&apos;re on the {workspace.plan} plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{workspace.plan} Plan</p>
              <p className="text-muted-foreground">
                $24 per user / month · 6 of 10 seats used
              </p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[image:var(--gradient-primary)]"
              style={{ width: "60%" }}
            />
          </div>
        </div>
        <p className="text-muted-foreground">
          Next invoice on{" "}
          <span className="text-foreground">August 1, 2026</span> · $144.00 USD
        </p>
      </CardContent>
    </Card>
  );
}

function SecuritySection() {
  const [tfa, setTfa] = useState(true);
  const [sso, setSso] = useState(false);
  return (
    <Card id="security">
      <CardHeader>
        <CardTitle className="text-sm">Security</CardTitle>
        <CardDescription>Protect your workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <Toggle
          label="Require two-factor for all admins"
          checked={tfa}
          onCheckedChange={setTfa}
        />
        <Toggle
          label="Enable SSO (Okta, Google Workspace)"
          checked={sso}
          onCheckedChange={setSso}
        />
        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <p className="font-semibold">Active sessions</p>
          <p className="text-muted-foreground">
            1 active · Last sign-in from Jakarta, Indonesia · 3 minutes ago
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChangelogSection() {
  const items = [
    { v: "v0.1", date: "Today", body: "Initial mock-data release. Pipeline, contacts, companies, deals, inbox and reports — all themeable." },
    { v: "Coming", date: "Soon", body: "Real backend, CSV imports, email sync and signature blocks." },
  ];
  return (
    <Card id="changelog">
      <CardHeader>
        <CardTitle className="text-sm">What&apos;s new</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-3 border-l border-border/60 pl-5">
          {items.map((i) => (
            <li key={i.v} className="relative">
              <span className="absolute -left-[26px] flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 ring-2 ring-background">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <p className="text-xs font-semibold">{i.v} · {i.date}</p>
              <p className="text-[11px] text-muted-foreground">{i.body}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable                                                                   */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={defaultValue} type={type} className="h-9 text-sm" />
    </div>
  );
}

function Swatch({ hsl }: { hsl: string }) {
  return (
    <span
      className="h-3 w-3 rounded-full ring-1 ring-border/60"
      style={{ backgroundColor: `hsl(${hsl})` }}
    />
  );
}

function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (b: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-3 py-2.5">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
