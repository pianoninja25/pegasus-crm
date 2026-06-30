"use client";

import { useEffect, useState } from "react";
import { MapPin, User, Wrench } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/features/locale/hooks";
import {
  useCreateCustomer,
  type CreateCustomerInput,
} from "@/features/service/hooks";
import {
  type Customer,
  type CustomerType,
} from "@/features/service/types";
import { cn } from "@/lib/utils";

interface NewCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (customer: Customer) => void;
  /**
   * Optional pre-fill for the customer name. Used when launching this dialog
   * from another flow (e.g. the quotation dialog's "Create new customer"
   * inline action) so the user doesn't retype what they already typed.
   */
  defaultName?: string;
}

interface FormState {
  type: CustomerType;
  name: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  notes: string;
}

/**
 * Centroid for major Indonesian cities. The customer's pin is placed at the
 * centroid since we no longer ask for explicit lat/lng — it's hard for most
 * users to find.
 *
 * Lookup is case-insensitive and tolerates a few common spelling variants.
 */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  jakarta: { lat: -6.2088, lng: 106.8456 },
  bandung: { lat: -6.9175, lng: 107.6191 },
  surabaya: { lat: -7.2575, lng: 112.7521 },
  medan: { lat: 3.5952, lng: 98.6722 },
  denpasar: { lat: -8.6705, lng: 115.2126 },
  bali: { lat: -8.4095, lng: 115.1889 },
  makassar: { lat: -5.1477, lng: 119.4327 },
  semarang: { lat: -6.9667, lng: 110.4167 },
  yogyakarta: { lat: -7.7956, lng: 110.3695 },
  jogja: { lat: -7.7956, lng: 110.3695 },
  malang: { lat: -7.9783, lng: 112.6263 },
  palembang: { lat: -2.9909, lng: 104.7565 },
  bekasi: { lat: -6.2349, lng: 106.9896 },
  depok: { lat: -6.4025, lng: 106.7942 },
  tangerang: { lat: -6.1781, lng: 106.63 },
  bogor: { lat: -6.5971, lng: 106.806 },
  batam: { lat: 1.0456, lng: 104.0305 },
  manado: { lat: 1.4748, lng: 124.8421 },
  balikpapan: { lat: -1.2654, lng: 116.8312 },
  pontianak: { lat: -0.0263, lng: 109.3425 },
  pekanbaru: { lat: 0.5071, lng: 101.4478 },
  padang: { lat: -0.9492, lng: 100.3543 },
  banjarmasin: { lat: -3.3194, lng: 114.5908 },
  cirebon: { lat: -6.7063, lng: 108.557 },
  solo: { lat: -7.5755, lng: 110.8243 },
  surakarta: { lat: -7.5755, lng: 110.8243 },
};

/** Country-level fallback when the city is not recognised. */
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  indonesia: { lat: -2.4, lng: 117 },
  malaysia: { lat: 4.2, lng: 109.5 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  philippines: { lat: 12.8797, lng: 121.774 },
  thailand: { lat: 15.87, lng: 100.9925 },
};

const EMPTY_FORM: FormState = {
  type: "residential",
  name: "",
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  country: "Indonesia",
  city: "",
  address: "",
  notes: "",
};

/** Resolves lat/lng from the city (preferred) or country (fallback). */
function resolveCoords(city: string, country: string): { lat: number; lng: number } {
  const cityKey = city.trim().toLowerCase();
  if (cityKey && CITY_COORDS[cityKey]) return CITY_COORDS[cityKey];
  const countryKey = country.trim().toLowerCase();
  if (countryKey && COUNTRY_COORDS[countryKey]) return COUNTRY_COORDS[countryKey];
  return COUNTRY_COORDS.indonesia;
}

export function NewCustomerDialog({
  open,
  onOpenChange,
  onCreated,
  defaultName,
}: NewCustomerDialogProps) {
  const t = useT();
  const createCustomer = useCreateCustomer();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, name: defaultName?.trim() ?? "" });
    }
  }, [open, defaultName]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const requiredOk =
    form.name.trim().length > 0 &&
    form.contactPerson.trim().length > 0 &&
    form.phone.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.address.trim().length > 0 &&
    form.city.trim().length > 0 &&
    form.country.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredOk || createCustomer.isPending) return;

    const coords = resolveCoords(form.city, form.country);
    const payload: CreateCustomerInput = {
      type: form.type,
      name: form.name.trim(),
      companyName: form.companyName.trim() || undefined,
      contactPerson: form.contactPerson.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      lat: coords.lat,
      lng: coords.lng,
      notes: form.notes.trim(),
    };

    const created = await createCustomer.mutateAsync(payload);
    onCreated?.(created);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("customers.create.title")}</DialogTitle>
          <DialogDescription>
            {t("customers.create.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="-mx-1.5 grid max-h-[70vh] gap-5 overflow-y-auto px-1.5"
        >
          {/* ── Section: Details ─────────────────────────────────────── */}
          <FormSection
            icon={<Wrench className="h-3.5 w-3.5" />}
            title={t("customers.create.sectionDetails")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label={`${t("customers.create.type")} *`}
                className="sm:col-span-2"
              >
                <TypeChips
                  value={form.type}
                  onChange={(v) => update("type", v)}
                  t={t}
                />
              </FormField>
              <FormField label={`${t("customers.create.name")} *`}>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder={t("customers.create.namePlaceholder")}
                  required
                />
              </FormField>
              <FormField label={t("customers.create.company")}>
                <Input
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder={t("customers.create.companyPlaceholder")}
                />
              </FormField>
            </div>
          </FormSection>

          {/* ── Section: Contact ─────────────────────────────────────── */}
          <FormSection
            icon={<User className="h-3.5 w-3.5" />}
            title={t("customers.create.sectionContact")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label={`${t("customers.create.contactPerson")} *`}>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => update("contactPerson", e.target.value)}
                  placeholder={t("customers.create.contactPersonPlaceholder")}
                  required
                />
              </FormField>
              <FormField label={`${t("customers.create.phone")} *`}>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+62…"
                  required
                />
              </FormField>
              <FormField
                label={`${t("customers.create.email")} *`}
                className="sm:col-span-2"
              >
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="contact@company.com"
                  required
                />
              </FormField>
            </div>
          </FormSection>

          {/* ── Section: Location ────────────────────────────────────── */}
          <FormSection
            icon={<MapPin className="h-3.5 w-3.5" />}
            title={t("customers.create.sectionLocation")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label={`${t("customers.create.country")} *`}>
                <Input
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  required
                />
              </FormField>
              <FormField label={`${t("customers.create.city")} *`}>
                <Input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Jakarta"
                  required
                />
              </FormField>
              <FormField
                label={`${t("customers.create.address")} *`}
                className="sm:col-span-2"
              >
                <Input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder={t("customers.create.addressPlaceholder")}
                  required
                />
              </FormField>
              <p className="text-[11px] text-muted-foreground sm:col-span-2">
                {t("customers.create.coordsHint")}
              </p>
            </div>
          </FormSection>

          {/* ── Notes ────────────────────────────────────────────────── */}
          <FormField label={t("customers.create.notes")}>
            <Textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder={t("customers.create.notesPlaceholder")}
              rows={3}
            />
          </FormField>

          {/* ── Lifecycle callout ────────────────────────────────────── */}
          <div className="flex items-start gap-2 rounded-md border border-slate-400/30 bg-slate-500/5 p-2.5 text-[11px]">
            <span className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-slate-400" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {t("customers.stage.prospect")}
              </span>{" "}
              · {t("customers.create.lifecycleHint")}
            </p>
          </div>
        </form>

        <DialogFooter className="mt-1 flex items-center justify-between gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            {t("customers.create.requiredHint")}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={createCustomer.isPending}
            >
              {t("customers.create.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={!requiredOk || createCustomer.isPending}
              onClick={handleSubmit}
            >
              {createCustomer.isPending
                ? t("customers.create.submitting")
                : t("customers.create.submit")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

function TypeChips({
  value,
  onChange,
  t,
}: {
  value: CustomerType;
  onChange: (v: CustomerType) => void;
  t: (key: import("@/features/locale/dictionary").DictKey) => string;
}) {
  const items: { id: CustomerType; dot: string }[] = [
    { id: "residential", dot: "bg-sky-500" },
    { id: "commercial", dot: "bg-violet-500" },
    { id: "industrial", dot: "bg-amber-500" },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
              active
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground",
            )}
          >
            <span className={cn("inline-block h-2 w-2 rounded-full", item.dot)} />
            {t(
              `customer.type.${item.id}` as
                | "customer.type.residential"
                | "customer.type.commercial"
                | "customer.type.industrial",
            )}
          </button>
        );
      })}
    </div>
  );
}
