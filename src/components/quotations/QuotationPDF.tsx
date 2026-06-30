"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { CompanyProfile } from "@/features/company/types";
import type { DictKey } from "@/features/locale/dictionary";
import type { Customer, Quotation } from "@/features/service/types";

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The PDF uses a deliberately conservative palette (slate grey + a single
 * accent colour) so it scans as a professional commercial document. All
 * dimensions are in points (72pt = 1 inch).
 */
const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#1f2937",
    lineHeight: 1.4,
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logo: { width: 56, height: 56, objectFit: "contain", marginRight: 12 },
  brand: { flexDirection: "row", alignItems: "center" },
  companyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: "#0f172a",
  },
  tagline: { fontSize: 8, color: "#64748b", marginTop: 2 },
  companyMeta: { fontSize: 8, color: "#475569", marginTop: 4 },
  headerRight: { alignItems: "flex-end" },
  docTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: "#0f172a",
    letterSpacing: 1.2,
  },
  docMeta: { fontSize: 8.5, color: "#475569", marginTop: 4 },
  docMetaRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 2 },
  docMetaLabel: { fontSize: 8.5, color: "#94a3b8", marginRight: 6 },

  // ── Bill-to + dates band
  band: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderTopWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: "#cbd5e1",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  bandHeading: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#64748b",
    letterSpacing: 1.1,
    marginBottom: 3,
  },

  // ── Items table
  table: { marginBottom: 12 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  th: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: "#f8fafc",
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  td: { fontSize: 9.5, color: "#1f2937" },
  tdMuted: { fontSize: 9, color: "#64748b" },
  colDesc: { flex: 1 },
  colQty: { width: 40, textAlign: "center" },
  colUnit: { width: 90, textAlign: "right" },
  colTotal: { width: 90, textAlign: "right" },

  // ── Totals
  totals: {
    marginTop: 6,
    alignSelf: "flex-end",
    width: "44%",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  totalsLabel: { fontSize: 9, color: "#475569" },
  totalsValue: { fontSize: 9.5, color: "#1f2937" },
  totalsGrand: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginTop: 4,
    backgroundColor: "#0f172a",
  },
  totalsGrandLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#e2e8f0",
    letterSpacing: 0.8,
  },
  totalsGrandValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11.5,
    color: "#f8fafc",
  },

  // ── Footer (terms + bank + signature)
  footer: {
    marginTop: 18,
    flexDirection: "row",
    gap: 16,
  },
  footerCol: { flex: 1 },
  paymentBox: {
    borderWidth: 0.75,
    borderColor: "#cbd5e1",
    padding: 8,
    marginBottom: 8,
  },
  paymentBoxLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#64748b",
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  paymentLine: { fontSize: 9, color: "#1f2937" },

  termsHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#64748b",
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  termsBody: { fontSize: 8.5, color: "#475569" },
  notesBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 2,
    borderColor: "#3b82f6",
  },
  notesBody: { fontSize: 8.5, color: "#334155" },

  // ── Signature block
  signBlock: { alignItems: "flex-start", marginTop: 12 },
  regards: { fontSize: 8.5, color: "#475569", marginBottom: 4 },
  stampSig: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  stamp: { width: 76, height: 76, objectFit: "contain", opacity: 0.85 },
  signature: { width: 110, height: 40, objectFit: "contain" },
  signatoryName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#0f172a",
    marginTop: 4,
  },
  signatoryTitle: { fontSize: 8.5, color: "#64748b" },

  // ── Page-bottom footer (URL + page number)
  pageFooter: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: "#94a3b8",
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderColor: "#e2e8f0",
  },
});

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export interface QuotationPdfProps {
  quotation: Quotation;
  customer: Customer | undefined;
  company: CompanyProfile;
  /**
   * Pre-formatted strings. We accept these as a bag instead of formatting
   * inside the PDF because the formatters depend on the user's chosen
   * locale + currency (from the Zustand locale store) which can't be read
   * inside a non-React PDF render context.
   */
  formatted: {
    subtotal: string;
    discount: string;
    tax: string;
    total: string;
    createdAt: string;
    validUntil: string;
    lines: Array<{
      description: string;
      quantity: string;
      unitPrice: string;
      lineTotal: string;
    }>;
    discountPct: string;
    taxPct: string;
  };
  /**
   * Translator passed in from the parent. We can't use the `useT()` hook
   * inside the `Document` because @react-pdf renders out-of-tree.
   */
  t: (key: DictKey) => string;
}

/**
 * Print-ready quotation document. Mirrors the on-screen detail page but
 * laid out for A4 paper, with the company branding from the persisted
 * settings store stamped in the header + footer.
 *
 * Generated on the client via `@react-pdf/renderer`. No server-side
 * dependency — works on cheap hosting + on a laptop with poor Wi-Fi.
 */
export function QuotationPDF({
  quotation,
  customer,
  company,
  formatted,
  t,
}: QuotationPdfProps) {
  const hasDiscount = quotation.discountPct > 0;

  return (
    <Document
      title={`${t("quotations.detail.printed.docTitle")} ${quotation.number}`}
      author={company.name}
      subject={quotation.title}
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header band ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={[styles.brand, { flex: 1 }]}>
            {company.logoDataUrl && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={company.logoDataUrl} style={styles.logo} />
            )}
            <View>
              <Text style={styles.companyName}>{company.name}</Text>
              {company.tagline && (
                <Text style={styles.tagline}>{company.tagline}</Text>
              )}
              <Text style={styles.companyMeta}>{company.address}</Text>
              <Text style={styles.companyMeta}>
                {company.cityRegion} · {company.country}
              </Text>
              <Text style={styles.companyMeta}>
                {company.phone} · {company.email}
              </Text>
              {company.npwp && (
                <Text style={styles.companyMeta}>NPWP: {company.npwp}</Text>
              )}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>
              {t("quotations.detail.printed.docTitle")}
            </Text>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>
                {t("quotations.detail.printed.no")}
              </Text>
              <Text style={styles.docMeta}>{quotation.number}</Text>
            </View>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>
                {t("quotations.detail.printed.date")}
              </Text>
              <Text style={styles.docMeta}>{formatted.createdAt}</Text>
            </View>
            <View style={styles.docMetaRow}>
              <Text style={styles.docMetaLabel}>
                {t("quotations.detail.printed.validUntil")}
              </Text>
              <Text style={styles.docMeta}>{formatted.validUntil}</Text>
            </View>
          </View>
        </View>

        {/* ── Bill-to band ─────────────────────────────────────────── */}
        <View style={styles.band}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bandHeading}>
              {t("quotations.detail.printed.billTo")}
            </Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10 }}>
              {customer?.name ?? "—"}
            </Text>
            {customer?.contactPerson && (
              <Text style={{ fontSize: 9, color: "#475569" }}>
                {customer.contactPerson}
              </Text>
            )}
            <Text style={{ fontSize: 8.5, color: "#475569", marginTop: 2 }}>
              {customer?.address}
              {customer?.city ? `, ${customer.city}` : ""}
            </Text>
            <Text style={{ fontSize: 8.5, color: "#475569" }}>
              {customer?.phone}
              {customer?.email ? ` · ${customer.email}` : ""}
            </Text>
          </View>
          <View style={{ width: 180 }}>
            <Text style={styles.bandHeading}>{quotation.title}</Text>
            {quotation.notes && (
              <Text style={{ fontSize: 8.5, color: "#64748b" }}>
                {quotation.notes}
              </Text>
            )}
          </View>
        </View>

        {/* ── Items table ─────────────────────────────────────────── */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colDesc]}>
              {t("quotations.detail.printed.description")}
            </Text>
            <Text style={[styles.th, styles.colQty]}>
              {t("quotations.detail.printed.qty")}
            </Text>
            <Text style={[styles.th, styles.colUnit]}>
              {t("quotations.detail.printed.unitPrice")}
            </Text>
            <Text style={[styles.th, styles.colTotal]}>
              {t("quotations.detail.printed.lineTotal")}
            </Text>
          </View>
          {formatted.lines.map((line, idx) => (
            <View key={idx} style={styles.tableRow} wrap={false}>
              <Text style={[styles.td, styles.colDesc]}>{line.description}</Text>
              <Text style={[styles.td, styles.colQty]}>{line.quantity}</Text>
              <Text style={[styles.tdMuted, styles.colUnit]}>
                {line.unitPrice}
              </Text>
              <Text
                style={[
                  styles.td,
                  styles.colTotal,
                  { fontFamily: "Helvetica-Bold" },
                ]}
              >
                {line.lineTotal}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Totals ──────────────────────────────────────────────── */}
        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              {t("quotations.detail.printed.subtotal")}
            </Text>
            <Text style={styles.totalsValue}>{formatted.subtotal}</Text>
          </View>
          {hasDiscount && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                {t("quotations.detail.printed.discount")} ({formatted.discountPct}
                %)
              </Text>
              <Text style={[styles.totalsValue, { color: "#b91c1c" }]}>
                -{formatted.discount}
              </Text>
            </View>
          )}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              {t("quotations.detail.printed.tax")} ({formatted.taxPct}%)
            </Text>
            <Text style={styles.totalsValue}>{formatted.tax}</Text>
          </View>
          <View style={styles.totalsGrand}>
            <Text style={styles.totalsGrandLabel}>
              {t("quotations.detail.printed.total")}
            </Text>
            <Text style={styles.totalsGrandValue}>{formatted.total}</Text>
          </View>
        </View>

        {/* ── Footer block: terms / payment / signature ──────────── */}
        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <View style={styles.paymentBox}>
              <Text style={styles.paymentBoxLabel}>
                {t("quotations.detail.printed.paymentTo")}
              </Text>
              <Text style={styles.paymentLine}>{company.bankName}</Text>
              <Text style={styles.paymentLine}>
                {company.bankAccountNumber} · {company.bankAccountHolder}
              </Text>
            </View>
            <Text style={styles.termsHeading}>
              {t("quotations.detail.printed.terms")}
            </Text>
            <Text style={styles.termsBody}>{company.defaultTerms}</Text>
          </View>
          <View style={[styles.footerCol, { alignItems: "flex-end" }]}>
            <View style={styles.signBlock}>
              <Text style={styles.regards}>
                {t("quotations.detail.printed.regards")}
              </Text>
              <View style={styles.stampSig}>
                {company.stampDataUrl && (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image src={company.stampDataUrl} style={styles.stamp} />
                )}
                {company.signatureDataUrl && (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image
                    src={company.signatureDataUrl}
                    style={styles.signature}
                  />
                )}
              </View>
              <Text style={styles.signatoryName}>{company.signatoryName}</Text>
              <Text style={styles.signatoryTitle}>
                {company.signatoryTitle}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Page bottom ─────────────────────────────────────────── */}
        <View style={styles.pageFooter} fixed>
          <Text>
            {company.name} · {company.website || company.email}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
