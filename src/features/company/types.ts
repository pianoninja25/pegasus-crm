/**
 * Branding + company-of-record details printed on every outgoing document
 * (quotations, invoices, work orders). Stored client-side in a persisted
 * Zustand store — see {@link useCompanyStore}.
 */
export interface CompanyProfile {
  /** Legal / commercial name. Headlines every PDF. */
  name: string;
  /** Optional short tagline shown beneath the logo on PDFs. */
  tagline: string;
  /** Street address, single line. */
  address: string;
  /** City + province + postal code. */
  cityRegion: string;
  /** Country (defaults to Indonesia). */
  country: string;
  phone: string;
  email: string;
  /** Public website URL (printed in the PDF footer). */
  website: string;
  /** Indonesian tax-ID — required on formal quotations & invoices. */
  npwp: string;

  /** Bank info block printed in the "payment to" footer. */
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;

  /**
   * Logo image as a base64 data URL — uploaded by the user from the settings
   * panel. Sized in the PDF to fit a 96×96 frame; transparent PNGs work best.
   */
  logoDataUrl?: string;
  /** Authorising stamp, semi-transparent PNG. Sized in the PDF to 96×96. */
  stampDataUrl?: string;
  /** Optional signatory image (transparent PNG). */
  signatureDataUrl?: string;
  /** Signatory's printed name + title beneath the stamp/signature. */
  signatoryName: string;
  signatoryTitle: string;

  /** Standard T&C / scope block printed beneath the line items. */
  defaultTerms: string;
  /** Pre-filled WhatsApp message template — uses {{placeholders}}. */
  defaultWhatsappTemplate: string;
}

/** Tagging type so we can reference the WhatsApp template variables. */
export type WhatsappTemplateVar =
  | "{{customer.name}}"
  | "{{customer.contact}}"
  | "{{quotation.number}}"
  | "{{quotation.title}}"
  | "{{quotation.total}}"
  | "{{quotation.validUntil}}"
  | "{{company.name}}"
  | "{{signatory.name}}";
