"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CalendarCheck,
  CalendarRange,
  ScrollText,
  Users,
  Wrench,
} from "lucide-react";

import { CustomerPicker } from "@/components/common/CustomerPicker";
import { FormField, FormSection } from "@/components/common/FormSection";
import { NewCustomerDialog } from "@/components/customers/NewCustomerDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/features/locale/hooks";
import {
  useCreateContract,
  useCustomers,
  useEngineers,
  useUnitsForCustomer,
  type CreateContractInput,
} from "@/features/service/hooks";
import {
  FREQUENCY_META,
  type ContractType,
  type ServiceContract,
  type ServiceFrequency,
} from "@/features/service/types";
import {
  engineerAvatarStyle,
  formatCurrency,
  formatDate,
  initials,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface NewContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optionally pre-select a customer (e.g. launched from customer detail). */
  defaultCustomerId?: string;
  onCreated?: (contract: ServiceContract) => void;
}

interface FormState {
  customerId: string;
  engineerId: string;
  type: ContractType;
  frequency: ServiceFrequency;
  customIntervalDays: string;
  startDate: string;
  endDate: string;
  value: string;
  notes: string;
  unitIds: string[];
}

const TYPE_ORDER: ContractType[] = [
  "ac_cleaning",
  "preventive_maintenance",
  "spare_part_replacement",
  "ac_replacement",
  "custom",
];

const FREQUENCY_ORDER: ServiceFrequency[] = [
  "monthly",
  "quarterly",
  "biannual",
  "annual",
  "custom",
];

function isoDate(d: Date): string {
  const local = new Date(d);
  local.setHours(0, 0, 0, 0);
  return local.toISOString().slice(0, 10);
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return isoDate(d);
}

function makeEmptyForm(defaultCustomerId?: string): FormState {
  const start = isoDate(new Date());
  return {
    customerId: defaultCustomerId ?? "",
    engineerId: "",
    type: "preventive_maintenance",
    frequency: "quarterly",
    customIntervalDays: "60",
    startDate: start,
    endDate: addMonths(start, 12),
    value: "",
    notes: "",
    unitIds: [],
  };
}

export function NewContractDialog({
  open,
  onOpenChange,
  defaultCustomerId,
  onCreated,
}: NewContractDialogProps) {
  const t = useT();
  const customersQ = useCustomers();
  const customers = customersQ.data ?? [];
  const engineersQ = useEngineers();
  const engineers = engineersQ.data ?? [];
  const createContract = useCreateContract();

  const [form, setForm] = useState<FormState>(() =>
    makeEmptyForm(defaultCustomerId),
  );
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  /** Snapshot of the picker's search query at the moment the user clicked
   *  "create new" — forwarded to NewCustomerDialog as defaultName. */
  const [createCustomerName, setCreateCustomerName] = useState("");

  useEffect(() => {
    if (open) setForm(makeEmptyForm(defaultCustomerId));
  }, [open, defaultCustomerId]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /* ── AC units for the selected customer ─────────────────────────── */
  const unitsQ = useUnitsForCustomer(form.customerId || undefined);
  const units = unitsQ.data ?? [];

  /* ── Schedule preview (first 4 work-order dates) ─────────────────── */
  const intervalDays = useMemo(() => {
    if (form.frequency === "custom") {
      const n = Number.parseInt(form.customIntervalDays, 10);
      return Number.isFinite(n) && n > 0 ? n : 60;
    }
    return FREQUENCY_META[form.frequency].intervalDays;
  }, [form.frequency, form.customIntervalDays]);

  const previewDates = useMemo(() => {
    if (!form.startDate || !form.endDate) return [] as string[];
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const out: string[] = [];
    let cursor = new Date(start);
    while (cursor <= end && out.length < 4) {
      out.push(cursor.toISOString());
      cursor = new Date(cursor);
      cursor.setDate(cursor.getDate() + intervalDays);
    }
    return out;
  }, [form.startDate, form.endDate, intervalDays]);

  /* ── Validation ─────────────────────────────────────────────────── */
  const valueNum = Number.parseFloat(form.value) || 0;
  const requiredOk =
    form.customerId.length > 0 &&
    form.engineerId.length > 0 &&
    form.startDate.length > 0 &&
    form.endDate.length > 0 &&
    new Date(form.endDate) > new Date(form.startDate) &&
    valueNum > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredOk || createContract.isPending) return;

    const payload: CreateContractInput = {
      customerId: form.customerId,
      engineerId: form.engineerId,
      type: form.type,
      frequency: form.frequency,
      customIntervalDays:
        form.frequency === "custom"
          ? Number.parseInt(form.customIntervalDays, 10) || 60
          : undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      value: valueNum,
      notes: form.notes.trim(),
      unitIds: form.unitIds,
    };
    const created = await createContract.mutateAsync(payload);
    onCreated?.(created);
    onOpenChange(false);
  };

  const toggleUnit = (id: string) =>
    update(
      "unitIds",
      form.unitIds.includes(id)
        ? form.unitIds.filter((x) => x !== id)
        : [...form.unitIds, id],
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("contracts.create.title")}</DialogTitle>
          <DialogDescription>
            {t("contracts.create.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="-mx-1.5 grid max-h-[70vh] gap-5 overflow-y-auto px-1.5"
        >
          {/* ── Section: Parties ────────────────────────────────────── */}
          <FormSection
            icon={<Users className="h-3.5 w-3.5" />}
            title={t("contracts.create.sectionParties")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label={`${t("contracts.create.customer")} *`}
                className="sm:col-span-2"
              >
                <CustomerPicker
                  value={form.customerId}
                  customers={customers}
                  onChange={(id) => {
                    update("customerId", id);
                    update("unitIds", []);
                  }}
                  onCreateNew={(currentSearch) => {
                    setCreateCustomerName(currentSearch);
                    setCreateCustomerOpen(true);
                  }}
                  placeholder={t("contracts.create.customerPlaceholder")}
                  noMatchLabel={t("contracts.create.customerNoMatch")}
                  createNewLabel={t("contracts.create.customerCreateNew")}
                />
              </FormField>
              <FormField
                label={`${t("contracts.create.engineer")} *`}
                className="sm:col-span-2"
                hint={t("contracts.create.engineerLead")}
              >
                <EngineerPicker
                  value={form.engineerId}
                  onChange={(id) => update("engineerId", id)}
                  engineers={engineers}
                  placeholder={t("contracts.create.engineerPlaceholder")}
                />
              </FormField>
            </div>
          </FormSection>

          {/* ── Section: Terms & scope ──────────────────────────────── */}
          <FormSection
            icon={<ScrollText className="h-3.5 w-3.5" />}
            title={t("contracts.create.sectionTerms")}
          >
            <div className="grid gap-3">
              <FormField label={`${t("contracts.create.type")} *`}>
                <div className="flex flex-wrap gap-1.5">
                  {TYPE_ORDER.map((typeId) => {
                    const active = form.type === typeId;
                    return (
                      <button
                        key={typeId}
                        type="button"
                        onClick={() => update("type", typeId)}
                        className={cn(
                          "inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors",
                          active
                            ? "border-primary/50 bg-primary/15 text-primary"
                            : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {t(`contracts.type.${typeId}` as const)}
                      </button>
                    );
                  })}
                </div>
              </FormField>
              <FormField label={`${t("contracts.create.frequency")} *`}>
                <div className="flex flex-wrap gap-1.5">
                  {FREQUENCY_ORDER.map((freqId) => {
                    const active = form.frequency === freqId;
                    return (
                      <button
                        key={freqId}
                        type="button"
                        onClick={() => update("frequency", freqId)}
                        className={cn(
                          "inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors",
                          active
                            ? "border-primary/50 bg-primary/15 text-primary"
                            : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {t(`contracts.frequency.${freqId}` as const)}
                      </button>
                    );
                  })}
                </div>
                {form.frequency === "custom" && (
                  <div className="mt-2 max-w-[200px]">
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      {t("contracts.create.customIntervalDays")}
                    </Label>
                    <Input
                      inputMode="numeric"
                      value={form.customIntervalDays}
                      onChange={(e) =>
                        update(
                          "customIntervalDays",
                          e.target.value.replace(/[^0-9]/g, ""),
                        )
                      }
                      className="mt-1 h-9 text-right tabular-nums"
                    />
                  </div>
                )}
              </FormField>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField label={`${t("contracts.create.startDate")} *`}>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                  />
                </FormField>
                <FormField label={`${t("contracts.create.endDate")} *`}>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => update("endDate", e.target.value)}
                  />
                </FormField>
                <FormField label={t("contracts.create.duration")}>
                  <DurationHint
                    startDate={form.startDate}
                    endDate={form.endDate}
                  />
                </FormField>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
                <FormField label={t("contracts.create.notes")}>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder={t("contracts.create.notesPlaceholder")}
                    rows={4}
                  />
                </FormField>
                <FormField
                  label={`${t("contracts.create.value")} *`}
                  hint={t("contracts.create.valueHint")}
                >
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      inputMode="decimal"
                      value={form.value}
                      onChange={(e) =>
                        update(
                          "value",
                          e.target.value.replace(/[^0-9.]/g, ""),
                        )
                      }
                      placeholder="0"
                      className="h-9 pl-8 text-right tabular-nums"
                    />
                  </div>
                  {valueNum > 0 && (
                    <p className="text-right text-[10px] text-muted-foreground">
                      {formatCurrency(valueNum, { compact: false })}
                    </p>
                  )}
                </FormField>
              </div>
            </div>
          </FormSection>

          {/* ── Section: Coverage units (only if customer picked) ─── */}
          {form.customerId && (
            <FormSection
              icon={<Wrench className="h-3.5 w-3.5" />}
              title={t("contracts.create.sectionCoverage")}
            >
              <p className="text-[11px] text-muted-foreground">
                {t("contracts.create.unitsHint")}
              </p>
              {units.length === 0 ? (
                <div className="rounded-md border border-dashed border-border/60 bg-card/30 p-4 text-center text-[11px] text-muted-foreground">
                  {t("contracts.create.unitsNone")}
                </div>
              ) : (
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {units.map((u) => {
                    const active = form.unitIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleUnit(u.id)}
                        className={cn(
                          "flex items-start gap-2 rounded-md border px-3 py-2 text-left transition-colors",
                          active
                            ? "border-primary/50 bg-primary/10"
                            : "border-border/60 bg-card/40 hover:border-primary/30",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border/60 bg-background",
                          )}
                        >
                          {active && <span className="text-[9px]">✓</span>}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">
                            {u.brand} {u.model}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {u.location} · {u.btu.toLocaleString()} BTU
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </FormSection>
          )}

          {/* ── Section: Schedule preview ───────────────────────────── */}
          <FormSection
            icon={<CalendarRange className="h-3.5 w-3.5" />}
            title={t("contracts.create.previewSchedule")}
          >
            <p className="text-[11px] text-muted-foreground">
              {t("contracts.create.previewScheduleHint")}
            </p>
            <div className="grid gap-2 sm:grid-cols-4">
              {previewDates.length === 0 ? (
                <div className="col-span-full rounded-md border border-dashed border-border/60 bg-card/30 p-4 text-center text-[11px] text-muted-foreground">
                  —
                </div>
              ) : (
                previewDates.map((iso, idx) => (
                  <div
                    key={iso}
                    className="rounded-md border border-border/60 bg-card/40 px-3 py-2"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      #{idx + 1}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-foreground tabular-nums">
                      {formatDate(iso, { withYear: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </FormSection>
        </form>

        <DialogFooter className="mt-1 flex items-center justify-between gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            {t("contracts.create.requiredHint")}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={createContract.isPending}
            >
              {t("contracts.create.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={!requiredOk || createContract.isPending}
              onClick={handleSubmit}
            >
              {createContract.isPending
                ? t("contracts.create.submitting")
                : t("contracts.create.submit")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <NewCustomerDialog
        open={createCustomerOpen}
        onOpenChange={setCreateCustomerOpen}
        defaultName={createCustomerName}
        onCreated={(created) => {
          update("customerId", created.id);
          update("unitIds", []);
          setCreateCustomerName("");
          setCreateCustomerOpen(false);
        }}
      />
    </Dialog>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

function EngineerPicker({
  value,
  onChange,
  engineers,
  placeholder,
}: {
  value: string;
  onChange: (id: string) => void;
  engineers: { id: string; name: string; title?: string; hue?: number }[];
  placeholder: string;
}) {
  const selected = engineers.find((e) => e.id === value);
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm"
      >
        <option value="">{placeholder}</option>
        {engineers.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
            {e.title ? ` · ${e.title}` : ""}
          </option>
        ))}
      </select>
      {selected && (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-2.5 py-1.5">
          <Avatar className="h-6 w-6">
            <AvatarFallback
              className="text-[9px] font-semibold"
              style={engineerAvatarStyle(selected.hue)}
            >
              {initials(selected.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{selected.name}</p>
            {selected.title && (
              <p className="truncate text-[10px] text-muted-foreground">
                {selected.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DurationHint({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    return Math.round((e.getTime() - s.getTime()) / 86_400_000);
  }, [startDate, endDate]);
  const months = Math.round((days / 30) * 10) / 10;
  return (
    <div className="flex h-9 items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2.5 text-xs">
      <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="tabular-nums">
        {days <= 0 ? "—" : `${days} days · ~${months} mo`}
      </span>
    </div>
  );
}
