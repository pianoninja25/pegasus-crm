"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Info,
  Receipt,
  Save,
  Tag,
  User,
} from "lucide-react";

import { CustomerPicker } from "@/components/common/CustomerPicker";
import { FormField, FormSection } from "@/components/common/FormSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/features/locale/hooks";
import { useCustomers } from "@/features/service/hooks";
import {
  type IncomeSource,
  type PaymentMethod,
} from "@/features/service/types";

const SOURCE_ORDER: IncomeSource[] = [
  "service_job",
  "service_contract",
  "spare_part_sale",
  "product_sale",
];

const METHOD_ORDER: PaymentMethod[] = [
  "cash",
  "bank_transfer",
  "credit_card",
  "ewallet",
  "check",
];

export default function NewInvoicePage() {
  const t = useT();
  const customersQ = useCustomers();
  const customers = customersQ.data ?? [];

  const [customerId, setCustomerId] = useState("");
  const [source, setSource] = useState<IncomeSource>("service_job");
  const [amount, setAmount] = useState("");
  const [issuedAt, setIssuedAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [dueAt, setDueAt] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "">("");
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link href="/dashboard/finance/invoices">
          <ArrowLeft className="h-3.5 w-3.5" />{" "}
          {t("invoices.new.backToInvoices")}
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Receipt className="h-5 w-5 text-primary" />{" "}
            {t("invoices.new.title")}
          </h1>
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
            {t("invoices.new.description")}
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5" disabled>
          <Save className="h-3.5 w-3.5" /> {t("invoices.new.cta")}
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-6 p-5 md:grid-cols-2">
          <FormSection
            icon={<User className="h-3 w-3" />}
            title={t("invoices.new.section.parties")}
            className="md:col-span-2"
          >
            <FormField label={t("invoices.new.field.customer")}>
              <CustomerPicker
                value={customerId}
                onChange={setCustomerId}
                customers={customers}
                placeholder={t("quotations.create.customerPlaceholder")}
                noMatchLabel={t("customers.search.noResults")}
              />
            </FormField>
          </FormSection>

          <FormSection
            icon={<Tag className="h-3 w-3" />}
            title={t("invoices.new.section.line")}
          >
            <FormField label={t("invoices.new.field.source")}>
              <Select
                value={source}
                onValueChange={(v) => setSource(v as IncomeSource)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`invoices.source.${s}` as const)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label={t("invoices.new.field.amount")}>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="0"
              />
            </FormField>
          </FormSection>

          <FormSection
            icon={<CalendarDays className="h-3 w-3" />}
            title={t("invoices.new.section.terms")}
          >
            <FormField label={t("invoices.new.field.issuedAt")}>
              <Input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
              />
            </FormField>
            <FormField label={t("invoices.new.field.dueAt")}>
              <Input
                type="date"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </FormField>
            <FormField label={t("invoices.new.field.method")}>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {METHOD_ORDER.map((m) => (
                    <SelectItem key={m} value={m}>
                      {t(`invoices.method.${m}` as const)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </FormSection>

          <FormSection
            icon={<Info className="h-3 w-3" />}
            title={t("invoices.new.field.notes")}
            className="md:col-span-2"
          >
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="…"
            />
          </FormSection>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span>{t("invoices.new.demoNote")}</span>
      </div>
    </div>
  );
}
