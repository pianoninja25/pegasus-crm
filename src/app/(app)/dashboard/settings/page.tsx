"use client";

import {
  Bell,
  Building2,
  Check,
  Globe,
  Palette,
  Receipt,
  Settings,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatTile } from "@/components/common/StatTile";
import { CompanyBrandPanel } from "@/components/settings/CompanyBrandPanel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

import { useAuthStore } from "@/features/auth/authStore";
import { useT } from "@/features/locale/hooks";
import { useLocaleStore } from "@/features/locale/store";
import {
  CURRENCIES,
  LOCALES,
  type Currency,
  type Locale,
} from "@/features/locale/types";
import { useResolvedTheme, useThemeStore } from "@/features/theme/themeStore";
import { themePresets } from "@/features/theme/themes";
import { company, users } from "@/features/service/seed";
import { ROLE_META } from "@/features/service/types";
import { engineerAvatarStyle, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const workspace = useAuthStore((s) => s.workspace);
  const preset = useResolvedTheme();
  const setPreset = useThemeStore((s) => s.setPreset);
  const [glassEnabled, setGlassEnabled] = useState(true);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const locale = useLocaleStore((s) => s.locale);
  const currency = useLocaleStore((s) => s.currency);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const setCurrency = useLocaleStore((s) => s.setCurrency);
  const t = useT();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("nav.account")}
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Building2}
          label="Workspace"
          value={workspace?.name ?? company.name}
          hint={workspace?.plan ?? company.plan}
          tone="primary"
        />
        <StatTile
          icon={Users}
          label="Team members"
          value={String(users.length)}
          hint={`${users.filter((u) => u.role === "engineer").length} engineers`}
          tone="accent"
        />
        <StatTile
          icon={Palette}
          label="Theme"
          value={preset.name}
          hint={preset.vibe}
          tone="success"
        />
        <StatTile
          icon={Bell}
          label="Notifications"
          value="On"
          tone="warn"
        />
      </div>

      {/* Profile */}
      <Card id="profile">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> {t("settings.profile")}
          </CardTitle>
          <CardDescription>Your account inside Pegasus AC Service.</CardDescription>
        </CardHeader>
        <CardContent>
          {user && (
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-1 ring-primary/30">
                <AvatarFallback className="bg-[image:var(--gradient-primary)] text-sm font-semibold text-primary-foreground">
                  {initials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {user.email} · {user.title}
                </p>
                <Badge variant="outline" className="mt-1 h-5 text-[10px]">
                  {ROLE_META[user.role].label}
                </Badge>
              </div>
              <Button variant="outline" size="sm">
                {t("settings.editProfile")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language & Currency */}
      <Card id="locale">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> {t("settings.language")} ·{" "}
            {t("settings.currency")}
          </CardTitle>
          <CardDescription>{t("settings.languageHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Globe className="h-3.5 w-3.5" /> {t("settings.language")}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {LOCALES.map((entry) => {
                const active = entry.id === locale;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setLocale(entry.id as Locale)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border bg-card/40 px-3 py-2.5 text-left transition",
                      active
                        ? "border-primary/60 bg-primary/5"
                        : "border-border/60 hover:border-primary/40",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none" aria-hidden>
                        {entry.flag}
                      </span>
                      <span>
                        <span className="block text-xs font-semibold">
                          {entry.label}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          {entry.englishLabel} · {entry.intl}
                        </span>
                      </span>
                    </span>
                    {active ? (
                      <Check className="h-4 w-4 text-primary" aria-hidden />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" /> {t("settings.currency")}
            </p>
            <p className="mb-3 text-[11px] text-muted-foreground">
              {t("settings.currencyHint")}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {CURRENCIES.map((entry) => {
                const active = entry.code === currency;
                return (
                  <button
                    key={entry.code}
                    type="button"
                    onClick={() => setCurrency(entry.code as Currency)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border bg-card/40 px-3 py-2.5 text-left transition",
                      active
                        ? "border-primary/60 bg-primary/5"
                        : "border-border/60 hover:border-primary/40",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-semibold">
                        {entry.symbol}
                      </span>
                      <span>
                        <span className="block text-xs font-semibold">
                          {entry.code}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">
                          {entry.intl}
                        </span>
                      </span>
                    </span>
                    {active ? (
                      <Check className="h-4 w-4 text-primary" aria-hidden />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company & Brand — fuels every PDF / WhatsApp share */}
      <CompanyBrandPanel />

      {/* Appearance */}
      <Card id="appearance">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" /> {t("settings.appearance")}
          </CardTitle>
          <CardDescription>
            Pick a vibe. The whole app picks up the new accent palette instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {themePresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={cn(
                  "rounded-lg border bg-card/40 p-3 text-left transition",
                  preset.id === p.id
                    ? "border-primary/60 bg-primary/5"
                    : "border-border/60 hover:border-primary/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{p.name}</p>
                  {preset.id === p.id && (
                    <Badge variant="default" className="h-4 text-[9px]">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {p.tagline}
                </p>
                <div className="mt-2 flex gap-1">
                  <span
                    className="h-3 w-6 rounded"
                    style={{ background: `hsl(${p.palette.primary})` }}
                  />
                  <span
                    className="h-3 w-6 rounded"
                    style={{ background: `hsl(${p.palette.accent})` }}
                  />
                  <span
                    className="h-3 w-6 rounded"
                    style={{ background: `hsl(${p.palette.background})` }}
                  />
                </div>
              </button>
            ))}
          </div>
          <Separator />
          <Row label={t("settings.glassEffects")}>
            <Switch checked={glassEnabled} onCheckedChange={setGlassEnabled} />
          </Row>
          <Row label={t("settings.motion")}>
            <Switch checked={motionEnabled} onCheckedChange={setMotionEnabled} />
          </Row>
        </CardContent>
      </Card>

      {/* Team */}
      <Card id="members">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> {t("settings.team")}
          </CardTitle>
          <CardDescription>
            People with access to this Pegasus AC workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback
                  className="text-[10px] font-semibold"
                  style={engineerAvatarStyle(u.hue)}
                >
                  {initials(u.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{u.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {u.email}
                </p>
              </div>
              <Badge variant="outline" className="h-5 text-[10px]">
                {ROLE_META[u.role].label}
              </Badge>
              <Badge variant="outline" className="h-5 text-[10px]">
                {u.title}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Billing */}
      <Card id="billing">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" /> {t("settings.billing")}
          </CardTitle>
          <CardDescription>
            You are on the {workspace?.plan ?? "Growth"} plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Seats used</span>
              <span className="text-primary">{users.length} / 10</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                style={{ width: `${(users.length / 10) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Next renewal in 23 days. <a className="text-primary hover:underline" href="#">Manage billing →</a>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="hidden">
        <Settings className="h-0" />
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span>{label}</span>
      {children}
    </div>
  );
}
