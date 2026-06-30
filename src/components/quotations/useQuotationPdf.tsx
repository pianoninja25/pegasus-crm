"use client";

import { pdf } from "@react-pdf/renderer";
import { useCallback, useState } from "react";

import { useCompanyStore } from "@/features/company/store";
import { useT } from "@/features/locale/hooks";
import { quotationSubtotal, quotationTotal } from "@/features/service/seed";
import type { Customer, Quotation } from "@/features/service/types";
import { formatCurrency, formatDate } from "@/lib/format";

import { QuotationPDF } from "./QuotationPDF";

/**
 * Filename-safe slug — keeps alnum, spaces and dashes, collapses runs of
 * separators into a single hyphen. Used so a quotation downloads as
 * `QUO-0042_PT-Cendana-Property.pdf` rather than something punctuation-heavy
 * that some operating systems would reject.
 */
function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/**
 * Render a quotation to PDF on the client and stream it down as a file
 * download. Returns a stable `download(...)` callback and a `pending` flag
 * for spinners.
 *
 * Strategy: we use the imperative `pdf(<Document/>).toBlob()` API so we
 * don't need to mount a viewer in the tree just to grab the file. The
 * generated `<a download>` link is created in-memory and cleaned up
 * synchronously.
 */
export function useQuotationPdf() {
  const t = useT();
  const company = useCompanyStore((s) => s.profile);
  const [pending, setPending] = useState(false);

  const generate = useCallback(
    async (quotation: Quotation, customer: Customer | undefined) => {
      const sub = quotationSubtotal(quotation);
      const discount = sub * (quotation.discountPct / 100);
      const tax = (sub - discount) * (quotation.taxPct / 100);
      const total = quotationTotal(quotation);

      const formatted = {
        subtotal: formatCurrency(sub, { compact: false }),
        discount: formatCurrency(discount, { compact: false }),
        tax: formatCurrency(tax, { compact: false }),
        total: formatCurrency(total, { compact: false }),
        discountPct: String(quotation.discountPct),
        taxPct: String(quotation.taxPct),
        createdAt: formatDate(quotation.createdAt, { withYear: true }),
        validUntil: formatDate(quotation.validUntil, { withYear: true }),
        lines: quotation.lines.map((l) => ({
          description: l.description,
          quantity: String(l.quantity),
          unitPrice: formatCurrency(l.unitPrice, { compact: false }),
          lineTotal: formatCurrency(l.quantity * l.unitPrice, {
            compact: false,
          }),
        })),
      };

      const blob = await pdf(
        <QuotationPDF
          quotation={quotation}
          customer={customer}
          company={company}
          formatted={formatted}
          t={t}
        />,
      ).toBlob();
      return blob;
    },
    [company, t],
  );

  /** Render the PDF and trigger a browser download. */
  const download = useCallback(
    async (quotation: Quotation, customer: Customer | undefined) => {
      setPending(true);
      try {
        const blob = await generate(quotation, customer);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${quotation.number}_${slugify(
          customer?.name ?? quotation.title,
        )}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Defer revoke so the browser has time to actually start the download.
        setTimeout(() => URL.revokeObjectURL(url), 1_000);
      } finally {
        setPending(false);
      }
    },
    [generate],
  );

  return { download, pending };
}
