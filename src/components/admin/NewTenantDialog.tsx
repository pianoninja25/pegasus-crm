"use client";

import { useEffect, useState } from "react";
import { Building2, Globe, UserRound } from "lucide-react";

import { FormField, FormSection } from "@/components/common/FormSection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePlatformStore } from "@/features/platform/store";
import {
  TENANT_PLAN_META,
  TENANT_STATUS_META,
  type Tenant,
  type TenantPlan,
  type TenantStatus,
} from "@/features/platform/types";

const PLANS: TenantPlan[] = ["Starter", "Growth", "Scale", "Enterprise"];
const STATUSES: TenantStatus[] = ["trial", "active", "past_due", "suspended"];

const COUNTRY_OPTIONS = [
  { code: "ID", label: "Indonesia" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "SG", label: "Singapore" },
  { code: "MY", label: "Malaysia" },
  { code: "AU", label: "Australia" },
  { code: "IN", label: "India" },
  { code: "PH", label: "Philippines" },
  { code: "TH", label: "Thailand" },
  { code: "VN", label: "Vietnam" },
];

interface NewTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (tenant: Tenant) => void;
}

interface FormState {
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  country: string;
  industry: string;
  notes: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  plan: "Starter",
  status: "trial",
  country: "ID",
  industry: "",
  notes: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function NewTenantDialog({
  open,
  onOpenChange,
  onCreated,
}: NewTenantDialogProps) {
  const createTenant = usePlatformStore((s) => s.createTenant);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setSlugTouched(false);
      setPending(false);
    }
  }, [open]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === "name" && !slugTouched
        ? { slug: slugify(value as string) }
        : {}),
    }));

  const requiredOk =
    form.name.trim().length > 0 &&
    form.slug.trim().length > 0 &&
    form.industry.trim().length > 0 &&
    form.ownerName.trim().length > 0 &&
    /.+@.+\..+/.test(form.ownerEmail.trim());

  const submit = async () => {
    if (!requiredOk || pending) return;
    setPending(true);
    const created = createTenant({
      name: form.name,
      slug: form.slug,
      plan: form.plan,
      status: form.status,
      country: form.country,
      industry: form.industry.trim(),
      notes: form.notes.trim() || undefined,
      owner: {
        name: form.ownerName,
        email: form.ownerEmail,
        phone: form.ownerPhone,
        title: "Administrator",
      },
    });
    onCreated?.(created);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New tenant</DialogTitle>
          <DialogDescription>
            Provision a new workspace. An owner administrator is created at the
            same time so the tenant can be signed into immediately.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="-mx-1.5 grid max-h-[70vh] gap-5 overflow-y-auto px-1.5"
        >
          <FormSection
            icon={<Building2 className="h-3.5 w-3.5" />}
            title="Workspace"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Workspace name *">
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Acme HVAC Co."
                  required
                />
              </FormField>
              <FormField
                label="Slug *"
                hint="Used for URLs — lowercase, dash-separated."
              >
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update("slug", slugify(e.target.value));
                  }}
                  placeholder="acme-hvac"
                  required
                />
              </FormField>
              <FormField label="Plan *">
                <Select
                  value={form.plan}
                  onValueChange={(v) => update("plan", v as TenantPlan)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {TENANT_PLAN_META[p].label} · $
                        {TENANT_PLAN_META[p].priceMonthly}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Status *">
                <Select
                  value={form.status}
                  onValueChange={(v) => update("status", v as TenantStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {TENANT_STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormSection>

          <FormSection
            icon={<Globe className="h-3.5 w-3.5" />}
            title="Locale & category"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Country *">
                <Select
                  value={form.country}
                  onValueChange={(v) => update("country", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Industry *">
                <Input
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  placeholder="Commercial HVAC"
                  required
                />
              </FormField>
            </div>
            <FormField label="Notes" hint="Visible to superadmins only.">
              <Textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any internal context — e.g. onboarding partner, contract terms…"
                rows={2}
              />
            </FormField>
          </FormSection>

          <FormSection
            icon={<UserRound className="h-3.5 w-3.5" />}
            title="Owner administrator"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Full name *">
                <Input
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </FormField>
              <FormField label="Work email *">
                <Input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => update("ownerEmail", e.target.value)}
                  placeholder="jane@acmehvac.com"
                  required
                />
              </FormField>
              <FormField label="Phone">
                <Input
                  value={form.ownerPhone}
                  onChange={(e) => update("ownerPhone", e.target.value)}
                  placeholder="+1 415-555-0100"
                />
              </FormField>
            </div>
          </FormSection>
        </form>

        <DialogFooter className="mt-1 flex items-center justify-between gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            Fields marked * are required.
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={!requiredOk || pending}
              onClick={submit}
            >
              {pending ? "Creating…" : "Create tenant"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
