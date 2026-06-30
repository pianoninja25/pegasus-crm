"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  Calendar,
  FileText,
  ListPlus,
  Plus,
  Trash2,
} from "lucide-react";

import { CustomerPicker } from "@/components/common/CustomerPicker";
import { FormField, FormSection } from "@/components/common/FormSection";
import { NewCustomerDialog } from "@/components/customers/NewCustomerDialog";
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
  useCreateQuotation,
  useCustomers,
  type CreateQuotationInput,
} from "@/features/service/hooks";
import {
  type Quotation,
  type QuotationCategory,
} from "@/features/service/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface NewQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optionally pre-select a customer (e.g. when launched from a customer page). */
  defaultCustomerId?: string;
  onCreated?: (quotation: Quotation) => void;
}

interface LineDraft {
  /** Local row id — discarded on submit. */
  rid: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

interface FormState {
  title: string;
  category: QuotationCategory;
  customerId: string;
  validUntil: string;
  notes: string;
  lines: LineDraft[];
  discountPct: string;
  taxPct: string;
}

/** Returns yyyy-mm-dd offset by `days` from today, used as the default `validUntil`. */
function isoDateInDays(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function emptyLine(): LineDraft {
  return {
    rid: Math.random().toString(36).slice(2, 8),
    description: "",
    quantity: "1",
    unitPrice: "",
  };
}

function makeEmptyForm(defaultCustomerId?: string): FormState {
  return {
    title: "",
    category: "service",
    customerId: defaultCustomerId ?? "",
    validUntil: isoDateInDays(30),
    notes: "",
    lines: [emptyLine()],
    discountPct: "0",
    taxPct: "11",
  };
}

export function NewQuotationDialog({
  open,
  onOpenChange,
  defaultCustomerId,
  onCreated,
}: NewQuotationDialogProps) {
  const t = useT();
  const customersQ = useCustomers();
  const customers = customersQ.data ?? [];
  const createQuotation = useCreateQuotation();

  const [form, setForm] = useState<FormState>(() =>
    makeEmptyForm(defaultCustomerId),
  );
  /**
   * Tracks whether the nested "create new customer" dialog is open on top of
   * this quotation dialog. We keep the quotation form mounted while it's
   * open so all in-progress fields (lines, totals, notes) survive.
   */
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  /** Snapshot of CustomerPicker's search at the moment "create new" was
   *  clicked — forwarded as the default name on the nested dialog. */
  const [createCustomerName, setCreateCustomerName] = useState("");

  useEffect(() => {
    if (open) setForm(makeEmptyForm(defaultCustomerId));
  }, [open, defaultCustomerId]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /* ── Line item ops ─────────────────────────────────────────────── */
  const setLine = (rid: string, patch: Partial<LineDraft>) =>
    setForm((f) => ({
      ...f,
      lines: f.lines.map((l) => (l.rid === rid ? { ...l, ...patch } : l)),
    }));
  const addLine = () =>
    setForm((f) => ({ ...f, lines: [...f.lines, emptyLine()] }));
  const removeLine = (rid: string) =>
    setForm((f) => ({
      ...f,
      lines:
        f.lines.length === 1 ? f.lines : f.lines.filter((l) => l.rid !== rid),
    }));

  /* ── Computed totals ───────────────────────────────────────────── */
  const computed = useMemo(() => {
    const subtotal = form.lines.reduce((sum, l) => {
      const q = Number.parseFloat(l.quantity) || 0;
      const p = Number.parseFloat(l.unitPrice) || 0;
      return sum + q * p;
    }, 0);
    const discountPct = Number.parseFloat(form.discountPct) || 0;
    const taxPct = Number.parseFloat(form.taxPct) || 0;
    const discount = subtotal * (discountPct / 100);
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (taxPct / 100);
    const total = Math.round(afterDiscount + tax);
    return { subtotal, discount, tax, total };
  }, [form.lines, form.discountPct, form.taxPct]);

  /* (CustomerPicker handles its own typeahead state) */

  /* ── Validation ────────────────────────────────────────────────── */
  const linesOk = form.lines.every(
    (l) =>
      l.description.trim().length > 0 &&
      Number.parseFloat(l.quantity) > 0 &&
      Number.parseFloat(l.unitPrice) > 0,
  );
  const requiredOk =
    form.title.trim().length > 0 &&
    form.customerId.length > 0 &&
    form.validUntil.length > 0 &&
    linesOk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiredOk || createQuotation.isPending) return;

    const payload: CreateQuotationInput = {
      title: form.title.trim(),
      category: form.category,
      customerId: form.customerId,
      notes: form.notes.trim(),
      validUntil: form.validUntil,
      lines: form.lines.map((l) => ({
        description: l.description.trim(),
        quantity: Number.parseFloat(l.quantity) || 0,
        unitPrice: Number.parseFloat(l.unitPrice) || 0,
      })),
      discountPct: Number.parseFloat(form.discountPct) || 0,
      taxPct: Number.parseFloat(form.taxPct) || 0,
    };

    const created = await createQuotation.mutateAsync(payload);
    onCreated?.(created);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("quotations.create.title")}</DialogTitle>
          <DialogDescription>
            {t("quotations.create.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="-mx-1.5 grid max-h-[70vh] gap-5 overflow-y-auto px-1.5"
        >
          {/* ── Section: Details ────────────────────────────────────── */}
          <FormSection
            icon={<FileText className="h-3.5 w-3.5" />}
            title={t("quotations.create.sectionDetails")}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label={`${t("quotations.create.titleField")} *`}
                className="sm:col-span-2"
              >
                <Input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder={t("quotations.create.titlePlaceholder")}
                  required
                />
              </FormField>
              <FormField label={`${t("quotations.create.category")} *`}>
                <CategoryChips
                  value={form.category}
                  onChange={(v) => update("category", v)}
                  t={t}
                />
              </FormField>
              <FormField label={`${t("quotations.create.validUntil")} *`}>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) => update("validUntil", e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </FormField>
              <FormField
                label={`${t("quotations.create.customer")} *`}
                className="sm:col-span-2"
              >
                <CustomerPicker
                  value={form.customerId}
                  customers={customers}
                  onChange={(id) => update("customerId", id)}
                  onCreateNew={(currentSearch) => {
                    setCreateCustomerName(currentSearch);
                    setCreateCustomerOpen(true);
                  }}
                  placeholder={t("quotations.create.customerPlaceholder")}
                  noMatchLabel={t("quotations.create.customerNoMatch")}
                  createNewLabel={t("quotations.create.customerCreateNew")}
                  createNewHint={t("quotations.create.customerCreateAsHint")}
                />
              </FormField>
            </div>
          </FormSection>

          {/* ── Section: Line items ─────────────────────────────────── */}
          <FormSection
            icon={<ListPlus className="h-3.5 w-3.5" />}
            title={t("quotations.create.sectionLines")}
          >
            <div className="space-y-2">
              {/* Header row (hidden on mobile) */}
              <div className="hidden grid-cols-[1fr_72px_140px_120px_32px] gap-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground sm:grid">
                <span>{t("quotations.create.lineDescription")} *</span>
                <span className="text-center">
                  {t("quotations.create.lineQty")} *
                </span>
                <span className="text-right">
                  {t("quotations.create.lineUnitPrice")} *
                </span>
                <span className="text-right">
                  {t("quotations.create.lineTotal")}
                </span>
                <span />
              </div>
              {form.lines.map((line) => {
                const lineTotal =
                  (Number.parseFloat(line.quantity) || 0) *
                  (Number.parseFloat(line.unitPrice) || 0);
                return (
                  <div
                    key={line.rid}
                    className="grid gap-2 sm:grid-cols-[1fr_72px_140px_120px_32px]"
                  >
                    <Input
                      value={line.description}
                      onChange={(e) =>
                        setLine(line.rid, { description: e.target.value })
                      }
                      placeholder={t(
                        "quotations.create.lineDescriptionPlaceholder",
                      )}
                      className="h-9"
                    />
                    <Input
                      inputMode="decimal"
                      value={line.quantity}
                      onChange={(e) =>
                        setLine(line.rid, {
                          quantity: e.target.value.replace(/[^0-9.]/g, ""),
                        })
                      }
                      className="h-9 text-center tabular-nums"
                    />
                    <Input
                      inputMode="decimal"
                      value={line.unitPrice}
                      onChange={(e) =>
                        setLine(line.rid, {
                          unitPrice: e.target.value.replace(/[^0-9.]/g, ""),
                        })
                      }
                      placeholder="0"
                      className="h-9 text-right tabular-nums"
                    />
                    <div className="flex h-9 items-center justify-end px-2 text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(lineTotal, { compact: false })}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-rose-500"
                      onClick={() => removeLine(line.rid)}
                      disabled={form.lines.length === 1}
                      aria-label={t("quotations.create.removeLine")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={addLine}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("quotations.create.addLine")}
              </Button>
            </div>
          </FormSection>

          {/* ── Section: Totals ─────────────────────────────────────── */}
          <FormSection
            icon={<Calculator className="h-3.5 w-3.5" />}
            title={t("quotations.create.sectionTotals")}
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
              <FormField label={t("quotations.create.notes")}>
                <Textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder={t("quotations.create.notesPlaceholder")}
                  rows={4}
                />
              </FormField>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <FormField label={t("quotations.create.discountPct")}>
                    <Input
                      inputMode="decimal"
                      value={form.discountPct}
                      onChange={(e) =>
                        update(
                          "discountPct",
                          e.target.value.replace(/[^0-9.]/g, ""),
                        )
                      }
                      className="h-9 text-right tabular-nums"
                    />
                  </FormField>
                  <FormField label={t("quotations.create.taxPct")}>
                    <Input
                      inputMode="decimal"
                      value={form.taxPct}
                      onChange={(e) =>
                        update(
                          "taxPct",
                          e.target.value.replace(/[^0-9.]/g, ""),
                        )
                      }
                      className="h-9 text-right tabular-nums"
                    />
                  </FormField>
                </div>
                <div className="space-y-1 rounded-md border border-border/60 bg-card/40 p-2.5 text-xs">
                  <TotalRow
                    label={t("quotations.create.subtotal")}
                    value={formatCurrency(computed.subtotal, {
                      compact: false,
                    })}
                  />
                  {computed.discount > 0 && (
                    <TotalRow
                      label={t("quotations.create.discountAmount")}
                      value={`-${formatCurrency(computed.discount, {
                        compact: false,
                      })}`}
                      muted
                    />
                  )}
                  <TotalRow
                    label={t("quotations.create.taxAmount")}
                    value={formatCurrency(computed.tax, { compact: false })}
                    muted
                  />
                  <div className="my-1 border-t border-border/60" />
                  <TotalRow
                    label={t("quotations.create.total")}
                    value={formatCurrency(computed.total, { compact: false })}
                    emphasize
                  />
                </div>
              </div>
            </div>
          </FormSection>
        </form>

        <DialogFooter className="mt-1 flex items-center justify-between gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            {t("quotations.create.requiredHint")}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => onOpenChange(false)}
              disabled={createQuotation.isPending}
            >
              {t("quotations.create.cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={!requiredOk || createQuotation.isPending}
              onClick={handleSubmit}
            >
              {createQuotation.isPending
                ? t("quotations.create.submitting")
                : t("quotations.create.submit")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* ── Nested: create-customer dialog ─────────────────────────── */}
      <NewCustomerDialog
        open={createCustomerOpen}
        onOpenChange={setCreateCustomerOpen}
        defaultName={createCustomerName}
        onCreated={(created) => {
          // Auto-select the new customer back in the quotation form so the
          // user lands exactly where they would have if it already existed.
          update("customerId", created.id);
          setCreateCustomerName("");
          setCreateCustomerOpen(false);
        }}
      />
    </Dialog>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

function CategoryChips({
  value,
  onChange,
  t,
}: {
  value: QuotationCategory;
  onChange: (v: QuotationCategory) => void;
  t: (key: import("@/features/locale/dictionary").DictKey) => string;
}) {
  const order: QuotationCategory[] = [
    "service",
    "product",
    "spare_parts",
    "service_contract",
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {order.map((id) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex items-center rounded-md border px-2.5 py-1 text-xs transition-colors",
              active
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {t(`quotations.category.${id}` as const)}
          </button>
        );
      })}
    </div>
  );
}

function TotalRow({
  label,
  value,
  muted,
  emphasize,
}: {
  label: string;
  value: string;
  muted?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "text-[11px]",
          muted ? "text-muted-foreground" : "text-foreground",
          emphasize && "text-xs font-semibold uppercase tracking-wider",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          emphasize
            ? "font-display text-sm font-semibold text-foreground"
            : muted
              ? "text-[11px] text-muted-foreground"
              : "text-xs font-medium text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

