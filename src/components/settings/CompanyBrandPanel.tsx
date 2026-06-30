"use client";

import {
  AlertCircle,
  Image as ImageIcon,
  MessageSquare,
  Receipt,
  RotateCcw,
  Stamp as StampIcon,
  Upload,
  X,
} from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyStore } from "@/features/company/store";
import type { CompanyProfile } from "@/features/company/types";
import { useT } from "@/features/locale/hooks";
import { cn } from "@/lib/utils";

/**
 * Reads a `File` (from an `<input type="file">`) as a base64 data URL.
 * We store images this way because the demo has no backend — Zustand
 * persists straight to `localStorage`, and an inline data URL is the
 * simplest format that survives a refresh and is embeddable in PDFs.
 *
 * Cap is ~750KB once base64-encoded (~512KB raw), which is plenty for a
 * logo/stamp and keeps the persisted state from exploding.
 */
const MAX_IMAGE_BYTES = 512 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

/**
 * "Company & Brand" panel for the settings page. Drives the persistent
 * {@link useCompanyStore} which the PDF generator + WhatsApp share consume.
 * Renders inputs for identity, branding (logo/stamp/signature), bank info,
 * default terms, and the WhatsApp message template.
 */
export function CompanyBrandPanel() {
  const t = useT();
  const profile = useCompanyStore((s) => s.profile);
  const update = useCompanyStore((s) => s.update);
  const reset = useCompanyStore((s) => s.reset);

  const onText = (key: keyof CompanyProfile) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update({ [key]: event.target.value } as Partial<CompanyProfile>);

  return (
    <Card id="company-brand">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4" /> {t("settings.company.title")}
        </CardTitle>
        <CardDescription>{t("settings.company.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── Identity ───────────────────────────────────────────── */}
        <Section title={t("settings.company.sectionIdentity")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("settings.company.name")}>
              <Input value={profile.name} onChange={onText("name")} />
            </Field>
            <Field label={t("settings.company.tagline")}>
              <Input value={profile.tagline} onChange={onText("tagline")} />
            </Field>
            <Field label={t("settings.company.address")} className="sm:col-span-2">
              <Input value={profile.address} onChange={onText("address")} />
            </Field>
            <Field label={t("settings.company.cityRegion")}>
              <Input
                value={profile.cityRegion}
                onChange={onText("cityRegion")}
              />
            </Field>
            <Field label={t("settings.company.country")}>
              <Input value={profile.country} onChange={onText("country")} />
            </Field>
            <Field label={t("settings.company.phone")}>
              <Input value={profile.phone} onChange={onText("phone")} />
            </Field>
            <Field label={t("settings.company.email")}>
              <Input value={profile.email} onChange={onText("email")} />
            </Field>
            <Field label={t("settings.company.website")}>
              <Input value={profile.website} onChange={onText("website")} />
            </Field>
            <Field label={t("settings.company.npwp")}>
              <Input value={profile.npwp} onChange={onText("npwp")} />
            </Field>
          </div>
        </Section>

        <Separator />

        {/* ── Brand assets ───────────────────────────────────────── */}
        <Section title={t("settings.company.sectionBrand")}>
          <div className="grid gap-3 sm:grid-cols-3">
            <AssetUploader
              icon={<ImageIcon className="h-3.5 w-3.5" />}
              label={t("settings.company.logoLabel")}
              hint={t("settings.company.logoHint")}
              value={profile.logoDataUrl}
              onChange={(v) => update({ logoDataUrl: v })}
              t={t}
            />
            <AssetUploader
              icon={<StampIcon className="h-3.5 w-3.5" />}
              label={t("settings.company.stampLabel")}
              hint={t("settings.company.stampHint")}
              value={profile.stampDataUrl}
              onChange={(v) => update({ stampDataUrl: v })}
              t={t}
            />
            <AssetUploader
              icon={<ImageIcon className="h-3.5 w-3.5" />}
              label={t("settings.company.signatureLabel")}
              hint={t("settings.company.signatureHint")}
              value={profile.signatureDataUrl}
              onChange={(v) => update({ signatureDataUrl: v })}
              t={t}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("settings.company.signatoryName")}>
              <Input
                value={profile.signatoryName}
                onChange={onText("signatoryName")}
              />
            </Field>
            <Field label={t("settings.company.signatoryTitle")}>
              <Input
                value={profile.signatoryTitle}
                onChange={onText("signatoryTitle")}
              />
            </Field>
          </div>
        </Section>

        <Separator />

        {/* ── Bank ───────────────────────────────────────────────── */}
        <Section title={t("settings.company.sectionBank")}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t("settings.company.bankName")}>
              <Input value={profile.bankName} onChange={onText("bankName")} />
            </Field>
            <Field label={t("settings.company.bankAccountNumber")}>
              <Input
                value={profile.bankAccountNumber}
                onChange={onText("bankAccountNumber")}
              />
            </Field>
            <Field label={t("settings.company.bankAccountHolder")}>
              <Input
                value={profile.bankAccountHolder}
                onChange={onText("bankAccountHolder")}
              />
            </Field>
          </div>
        </Section>

        <Separator />

        {/* ── Terms ──────────────────────────────────────────────── */}
        <Section title={t("settings.company.sectionTerms")}>
          <Field
            label={t("settings.company.defaultTerms")}
            hint={t("settings.company.defaultTermsHint")}
          >
            <Textarea
              value={profile.defaultTerms}
              onChange={onText("defaultTerms")}
              rows={5}
              className="font-mono text-xs"
            />
          </Field>
        </Section>

        <Separator />

        {/* ── WhatsApp template ─────────────────────────────────── */}
        <Section
          title={t("settings.company.sectionWhatsapp")}
          icon={<MessageSquare className="h-3.5 w-3.5" />}
        >
          <Field
            label={t("settings.company.whatsappTemplate")}
            hint={t("settings.company.whatsappTemplateHint")}
          >
            <Textarea
              value={profile.defaultWhatsappTemplate}
              onChange={onText("defaultWhatsappTemplate")}
              rows={8}
              className="font-mono text-[11px]"
            />
          </Field>
          <p className="flex items-start gap-1.5 rounded-md border border-border/40 bg-muted/30 p-2 text-[10px] text-muted-foreground">
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{t("settings.company.whatsappPlaceholders")}</span>
          </p>
        </Section>

        <Separator />

        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="text-[11px] text-muted-foreground">
            {t("settings.company.savedHint")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs"
            onClick={() => {
              if (window.confirm(t("settings.company.resetConfirm"))) reset();
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("settings.company.reset")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ───────────────────────── Sub-components ───────────────────────────── */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[11px] font-medium text-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AssetUploader({
  icon,
  label,
  hint,
  value,
  onChange,
  t,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  t: (key: Parameters<ReturnType<typeof useT>>[0]) => string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
        {icon}
        {label}
      </Label>
      <div className="group relative flex h-28 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/60 bg-muted/30">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={label}
              className="h-full w-full object-contain p-3"
            />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition hover:text-rose-500"
              aria-label={t("settings.company.removeImage")}
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-1.5 text-[11px] text-muted-foreground transition hover:text-primary"
          >
            <Upload className="h-4 w-4" />
            {t("settings.company.uploadCta")}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > MAX_IMAGE_BYTES) {
              window.alert(
                `Image too large — must be under ${Math.round(
                  MAX_IMAGE_BYTES / 1024,
                )}KB.`,
              );
              return;
            }
            const dataUrl = await readFileAsDataUrl(file);
            onChange(dataUrl);
            event.target.value = "";
          }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}
