"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Loader2,
  MessageCircle,
  Receipt,
  ScrollText,
  Send,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";

import { InsightCard } from "@/components/common/InsightCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  SendViaWhatsappDialog,
  shouldSkipWhatsappHelper,
} from "@/components/quotations/SendViaWhatsappDialog";
import { useQuotationPdf } from "@/components/quotations/useQuotationPdf";
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
import { useCompanyStore } from "@/features/company/store";
import { useT } from "@/features/locale/hooks";
import {
  useQuotation,
  useSetQuotationStatus,
} from "@/features/service/hooks";
import {
  customerMap,
  quotationSubtotal,
  quotationTotal,
  userMap,
} from "@/features/service/seed";
import {
  QUOTATION_CATEGORY_META,
  QUOTATION_STATUS_META,
} from "@/features/service/types";
import {
  engineerAvatarStyle,
  formatCurrency,
  formatDate,
  initials,
  relativeTime,
} from "@/lib/format";
import {
  cleanPhoneForWa,
  renderWhatsappTemplate,
  whatsappShareUrl,
} from "@/lib/whatsapp";

export default function QuotationDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useT();
  const quotationQ = useQuotation(params.id);
  const setStatus = useSetQuotationStatus();
  const company = useCompanyStore((s) => s.profile);
  const { download: downloadPdf, pending: pdfPending } = useQuotationPdf();
  const q = quotationQ.data ?? null;

  /* ── derived totals + validity ─────────────────────────────────── */
  const computed = useMemo(() => {
    if (!q) return null;
    const sub = quotationSubtotal(q);
    const discount = sub * (q.discountPct / 100);
    const tax = (sub - discount) * (q.taxPct / 100);
    const total = quotationTotal(q);
    const now = Date.now();
    const validUntilMs = new Date(q.validUntil).getTime();
    const daysLeft = Math.ceil((validUntilMs - now) / 86_400_000);
    return { sub, discount, tax, total, daysLeft };
  }, [q]);

  /* ── Customer + WhatsApp ───────────────────────────────────────── */
  const maybeCustomer = q ? customerMap[q.customerId] : undefined;
  const waPhoneClean = maybeCustomer
    ? cleanPhoneForWa(maybeCustomer.phone)
    : null;
  const [waDialogOpen, setWaDialogOpen] = useState(false);

  /** Pre-rendered WhatsApp message — used both for the preview and the share. */
  const waMessage = useMemo(() => {
    if (!q || !maybeCustomer) return "";
    return renderWhatsappTemplate(company.defaultWhatsappTemplate, {
      "customer.name": maybeCustomer.name,
      "customer.contact":
        maybeCustomer.contactPerson || maybeCustomer.name,
      "quotation.number": q.number,
      "quotation.title": q.title,
      "quotation.total": formatCurrency(quotationTotal(q), { compact: false }),
      "quotation.validUntil": formatDate(q.validUntil, { withYear: true }),
      "company.name": company.name,
      "signatory.name": company.signatoryName,
    });
  }, [company, maybeCustomer, q]);

  /**
   * The actual share operation — runs *after* the user has confirmed (or
   * if they previously dismissed the helper). Three steps:
   *   1. Download the PDF (browser shows a Downloads notification)
   *   2. Open `wa.me/<phone>?text=<msg>` in a new tab
   *   3. Auto-promote `draft → sent` so the timeline reflects the share
   *
   * WhatsApp's URL scheme doesn't allow attaching files — that's a Meta
   * security constraint, not a bug. The helper dialog explains this; here
   * we just execute the operation reliably.
   */
  const runWhatsappShare = useCallback(async () => {
    if (!q || !maybeCustomer || !waPhoneClean) return;
    await downloadPdf(q, maybeCustomer);
    const url = whatsappShareUrl(maybeCustomer.phone, waMessage);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    if (q.status === "draft") {
      setStatus.mutate({ id: q.id, status: "sent" });
    }
  }, [
    downloadPdf,
    maybeCustomer,
    q,
    setStatus,
    waMessage,
    waPhoneClean,
  ]);

  /**
   * Entry point for the "Send via WhatsApp" button. Shows the explainer
   * dialog the first time, then remembers the preference. Power users who
   * have dismissed it skip straight to the action.
   */
  const handleSendViaWhatsapp = useCallback(() => {
    if (!q || !maybeCustomer) return;
    if (!waPhoneClean) {
      window.alert(t("quotations.detail.shareWaInvalidPhone"));
      return;
    }
    if (shouldSkipWhatsappHelper()) {
      void runWhatsappShare();
    } else {
      setWaDialogOpen(true);
    }
  }, [maybeCustomer, q, runWhatsappShare, t, waPhoneClean]);

  if (!quotationQ.isLoading && !q) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/quotations">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("quotations.title")}
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {t("quotations.detail.notFound")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!q || !computed) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  const customer = customerMap[q.customerId];
  const owner = userMap[q.ownerId];
  const sMeta = QUOTATION_STATUS_META[q.status];
  const cMeta = QUOTATION_CATEGORY_META[q.category];

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 h-7 gap-1.5">
        <Link href="/dashboard/quotations">
          <ArrowLeft className="h-3.5 w-3.5" /> {t("quotations.title")}
        </Link>
      </Button>

      {/* ── Hero strip ────────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold">{q.title}</h1>
              <StatusBadge
                label={sMeta.label}
                tone={sMeta.tone}
                color={sMeta.color}
              />
              <StatusBadge label={cMeta.label} tone={cMeta.tone} />
              <Badge
                variant="outline"
                className="h-5 gap-1 border-border/60 text-[10px] text-muted-foreground"
              >
                {q.number}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ClipboardCheck className="h-3 w-3" />{" "}
                {relativeTime(q.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                {formatDate(q.validUntil, { withYear: true })} ·{" "}
                {computed.daysLeft >= 0
                  ? `${computed.daysLeft}d ${t("quotations.detail.validityRemaining")}`
                  : t("quotations.detail.expired")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => downloadPdf(q, customer)}
              disabled={pdfPending}
            >
              {pdfPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}{" "}
              {t("quotations.detail.downloadPdf")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
              onClick={handleSendViaWhatsapp}
              disabled={pdfPending || !waPhoneClean}
              title={
                !waPhoneClean
                  ? t("quotations.detail.shareWaInvalidPhone")
                  : undefined
              }
            >
              <MessageCircle className="h-3.5 w-3.5" />{" "}
              {t("quotations.detail.shareWa")}
            </Button>
            {q.status === "draft" && (
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setStatus.mutate({ id: q.id, status: "sent" })}
              >
                <Send className="h-3.5 w-3.5" />{" "}
                {t("quotations.detail.send")}
              </Button>
            )}
            {q.status === "sent" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-rose-600 dark:text-rose-300"
                  onClick={() =>
                    setStatus.mutate({ id: q.id, status: "rejected" })
                  }
                >
                  <XCircle className="h-3.5 w-3.5" />{" "}
                  {t("quotations.detail.markRejected")}
                </Button>
                <Button
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={() =>
                    setStatus.mutate({ id: q.id, status: "approved" })
                  }
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                  {t("quotations.detail.markApproved")}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Insight strip ─────────────────────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <InsightCard
          variant="compact"
          icon={FileText}
          tone="primary"
          label={t("quotations.detail.subtotal")}
          value={formatCurrency(computed.sub)}
          caption={`${q.lines.length} ${t("quotations.detail.lineCount")}`}
        />
        <InsightCard
          variant="compact"
          icon={Sparkles}
          tone={q.discountPct > 0 ? "warn" : "muted"}
          label={t("quotations.detail.discount")}
          value={formatCurrency(computed.discount)}
          caption={`${q.discountPct}%`}
        />
        <InsightCard
          variant="compact"
          icon={Receipt}
          tone="accent"
          label={t("quotations.detail.tax")}
          value={formatCurrency(computed.tax)}
          caption={`${q.taxPct}%`}
        />
        <InsightCard
          variant="compact"
          icon={ClipboardCheck}
          tone="success"
          label={t("quotations.detail.total")}
          value={formatCurrency(computed.total)}
          caption={`${q.lines.length} ${t("quotations.detail.lineCount")}`}
          emphasize
        />
        <InsightCard
          variant="compact"
          icon={CalendarClock}
          tone={computed.daysLeft < 7 ? "warn" : "muted"}
          label={t("quotations.detail.validUntil")}
          value={
            computed.daysLeft >= 0
              ? `${computed.daysLeft}d`
              : t("quotations.detail.expired")
          }
          caption={formatDate(q.validUntil, { withYear: true })}
        />
      </div>

      {/* ── Main grid: rail + lines ───────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Profile rail (compact) */}
        <div className="space-y-3">
          <Card className="h-fit">
            <CardContent className="space-y-3 p-3 text-xs">
              {/* Customer */}
              {customer && (
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="flex items-center gap-2 transition hover:text-primary"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                      {initials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("quotations.detail.customer")}
                    </p>
                    <p className="truncate font-medium text-foreground">
                      {customer.name}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {customer.city}, {customer.country}
                    </p>
                  </div>
                </Link>
              )}

              {/* Owner */}
              {owner && (
                <div className="flex items-center gap-2 border-t border-border/40 pt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className="text-[10px] font-semibold"
                      style={engineerAvatarStyle(owner.hue)}
                    >
                      {initials(owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("quotations.detail.owner")}
                    </p>
                    <p className="truncate font-medium text-foreground">
                      {owner.name}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {owner.title}
                    </p>
                  </div>
                </div>
              )}

              {/* History timeline */}
              <div className="space-y-1 border-t border-border/40 pt-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("quotations.detail.history")}
                </p>
                <ol className="relative space-y-1.5 border-l border-border/60 pl-3 pt-1">
                  <li className="relative">
                    <span className="absolute -left-[14px] top-1 inline-flex h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                    <p className="text-[11px] font-medium text-foreground">
                      {t("quotations.detail.drafted")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(q.createdAt, { withYear: true })}
                    </p>
                  </li>
                  {q.sentAt && (
                    <li className="relative">
                      <span className="absolute -left-[14px] top-1 inline-flex h-2 w-2 rounded-full bg-sky-500 ring-2 ring-background" />
                      <p className="text-[11px] font-medium text-foreground">
                        {t("quotations.detail.sentToCustomer")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(q.sentAt, { withYear: true })}
                      </p>
                    </li>
                  )}
                  {q.decidedAt && (
                    <li className="relative">
                      <span
                        className="absolute -left-[14px] top-1 inline-flex h-2 w-2 rounded-full ring-2 ring-background"
                        style={{ backgroundColor: sMeta.color }}
                      />
                      <p className="text-[11px] font-medium text-foreground">
                        {sMeta.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(q.decidedAt, { withYear: true })}
                      </p>
                    </li>
                  )}
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Next step (approved only) */}
          {q.status === "approved" && (
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">
                  {t("quotations.detail.nextStep")}
                </CardTitle>
                <CardDescription className="text-[11px]">
                  {t("quotations.detail.nextStepHint")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 p-3 pt-0">
                <NextStepLink
                  href={`/dashboard/work-orders/new?customer=${q.customerId}&fromQuote=${q.id}`}
                  icon={<Wrench className="h-3.5 w-3.5" />}
                  label={t("quotations.detail.convertWorkOrder")}
                />
                {q.category === "service_contract" && (
                  <NextStepLink
                    href={`/dashboard/contracts/new?customer=${q.customerId}&fromQuote=${q.id}`}
                    icon={<ScrollText className="h-3.5 w-3.5" />}
                    label={t("quotations.detail.convertContract")}
                  />
                )}
                <NextStepLink
                  href={`/dashboard/finance/invoices/new?customer=${q.customerId}&fromQuote=${q.id}`}
                  icon={<Receipt className="h-3.5 w-3.5" />}
                  label={t("quotations.detail.convertInvoice")}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Line items + notes */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3 pb-2">
            <div>
              <CardTitle className="text-sm">
                {t("quotations.detail.lineItems")}
              </CardTitle>
              <CardDescription className="text-[11px]">
                {q.lines.length} {t("quotations.detail.lineCount")} ·{" "}
                {formatCurrency(computed.sub)} {t("quotations.detail.subtotal")}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-background/30 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2">
                      {t("quotations.create.lineDescription")}
                    </th>
                    <th className="px-2 py-2 text-right">
                      {t("quotations.create.lineQty")}
                    </th>
                    <th className="px-2 py-2 text-right">
                      {t("quotations.create.lineUnitPrice")}
                    </th>
                    <th className="px-3 py-2 text-right">
                      {t("quotations.create.lineTotal")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {q.lines.map((line) => (
                    <tr
                      key={line.id}
                      className="border-b border-border/40 last:border-b-0"
                    >
                      <td className="px-3 py-2.5 text-xs">
                        {line.description}
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs tabular-nums">
                        {line.quantity}
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                        {formatCurrency(line.unitPrice, { compact: false })}
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs font-semibold tabular-nums">
                        {formatCurrency(line.quantity * line.unitPrice, {
                          compact: false,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 pt-3 text-right text-[11px] text-muted-foreground"
                    >
                      {t("quotations.detail.subtotal")}
                    </td>
                    <td className="px-3 pt-3 text-right text-xs tabular-nums">
                      {formatCurrency(computed.sub, { compact: false })}
                    </td>
                  </tr>
                  {q.discountPct > 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-3 text-right text-[11px] text-muted-foreground"
                      >
                        {t("quotations.detail.discount")} ({q.discountPct}%)
                      </td>
                      <td className="px-3 text-right text-xs tabular-nums text-rose-500 dark:text-rose-300">
                        -{formatCurrency(computed.discount, { compact: false })}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 text-right text-[11px] text-muted-foreground"
                    >
                      {t("quotations.detail.tax")} ({q.taxPct}%)
                    </td>
                    <td className="px-3 text-right text-xs tabular-nums">
                      {formatCurrency(computed.tax, { compact: false })}
                    </td>
                  </tr>
                  <tr className="border-t border-border/60">
                    <td
                      colSpan={3}
                      className="px-3 pb-3 pt-2 text-right text-xs font-semibold uppercase tracking-wider"
                    >
                      {t("quotations.detail.total")}
                    </td>
                    <td className="px-3 pb-3 pt-2 text-right font-display text-base font-semibold tabular-nums">
                      {formatCurrency(computed.total, { compact: false })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {q.notes && (
              <div className="border-t border-border/40 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("quotations.detail.notes")}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {q.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── WhatsApp share helper ─────────────────────────────────── */}
      {customer && (
        <SendViaWhatsappDialog
          open={waDialogOpen}
          onOpenChange={setWaDialogOpen}
          messagePreview={waMessage}
          customerName={customer.name}
          onRun={runWhatsappShare}
        />
      )}
    </div>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

function NextStepLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-card/40 px-2.5 py-1.5 text-xs transition-colors hover:border-primary/40 hover:text-primary"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ArrowRight className="h-3 w-3 text-muted-foreground" />
    </Link>
  );
}
