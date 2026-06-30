"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CompanyProfile } from "./types";

/**
 * Sensible defaults for an Indonesian AC service business demo. Everything
 * here can be overridden from the Settings page.
 *
 * The defaults intentionally include a WhatsApp template in Bahasa Indonesian
 * because that's the dominant channel for SMB B2B in Indonesia.
 */
export const DEFAULT_COMPANY: CompanyProfile = {
  name: "Pegasus AC Service",
  tagline: "Cooling Comfort, Engineered.",
  address: "Jl. Jenderal Sudirman No. 123",
  cityRegion: "Jakarta Selatan 12190",
  country: "Indonesia",
  phone: "+62 811-0001",
  email: "hello@pegasus.ac",
  website: "pegasus.ac",
  npwp: "12.345.678.9-012.000",

  bankName: "Bank Central Asia (BCA)",
  bankAccountNumber: "012-3456789",
  bankAccountHolder: "PT Pegasus AC Service",

  signatoryName: "Leo Santoso",
  signatoryTitle: "Founder & Admin",

  defaultTerms:
    "1. Penawaran ini berlaku hingga tanggal yang tercantum di atas.\n2. Harga sudah termasuk PPN 11%.\n3. Pembayaran dapat dilakukan melalui transfer bank ke rekening yang tertera.\n4. Garansi servis 30 hari setelah pekerjaan selesai.",

  /*
   * The template intentionally avoids emojis. WhatsApp's `wa.me` URL scheme
   * decodes pre-filled text inconsistently across clients — modern WhatsApp
   * Web on some browsers replaces supplementary-plane emojis (📋, 📅, 💰
   * etc.) with U+FFFD (the replacement character). Plain ASCII with
   * WhatsApp's native `*bold*` markdown is universally compatible.
   *
   * Customer attaches the freshly-downloaded PDF themselves — the line
   * "Lampiran PDF: detail item & syarat" sets that expectation in-band so
   * the recipient knows there's a file coming.
   */
  defaultWhatsappTemplate: [
    "Halo Bapak/Ibu {{customer.contact}},",
    "",
    "Terima kasih atas kepercayaan kepada {{company.name}}. Berikut kami sampaikan penawaran harga:",
    "",
    "*Penawaran #{{quotation.number}}*",
    "- Layanan: {{quotation.title}}",
    "- Berlaku hingga: {{quotation.validUntil}}",
    "- Total: *{{quotation.total}}*",
    "",
    "Lampiran PDF berisi detail item, syarat & ketentuan, serta informasi pembayaran kami lampirkan pada pesan berikutnya.",
    "",
    "Silakan hubungi kami jika ada pertanyaan.",
    "",
    "Hormat kami,",
    "{{signatory.name}}",
    "{{company.name}}",
  ].join("\n"),
};

interface CompanyStoreState {
  profile: CompanyProfile;
  hydrated: boolean;
}

interface CompanyStoreActions {
  /** Merge-update — overrides only the supplied fields. */
  update: (patch: Partial<CompanyProfile>) => void;
  /** Reset profile back to {@link DEFAULT_COMPANY}. */
  reset: () => void;
  setHydrated: (value: boolean) => void;
}

export type CompanyStore = CompanyStoreState & CompanyStoreActions;

/**
 * Persisted (`localStorage`) company branding store. The PDF generator and
 * WhatsApp share helpers both consume from here, which means uploading a
 * new logo / stamp / bank info is reflected immediately app-wide without
 * needing a server.
 */
/**
 * Bump whenever the {@link DEFAULT_COMPANY} ships a non-additive change we
 * want existing users to receive (e.g. emoji template fix). Migrations live
 * below — they patch the persisted state in-place rather than wiping it,
 * so the user keeps their logo/stamp/bank info.
 */
const PERSIST_VERSION = 2;

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      profile: DEFAULT_COMPANY,
      hydrated: false,
      update: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
      reset: () => set({ profile: DEFAULT_COMPANY }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "pegasus-ac-company",
      storage: createJSONStorage(() => localStorage),
      version: PERSIST_VERSION,
      partialize: (s) => ({ profile: s.profile }),
      // Per-version migrations. Each step takes the previously-persisted
      // shape and returns the next. We intentionally only touch fields
      // that *must* change — everything else (logo, stamp, bank, etc.)
      // is preserved.
      migrate: (state, fromVersion) => {
        const next = state as { profile?: CompanyProfile } | undefined;
        const profile = next?.profile ?? DEFAULT_COMPANY;
        // v1 → v2: replace the legacy emoji WhatsApp template (which renders
        //          as U+FFFD on some WA Web clients) with the ASCII-safe one.
        if (fromVersion < 2) {
          const hadEmojiTemplate =
            profile.defaultWhatsappTemplate?.includes("📋") ||
            profile.defaultWhatsappTemplate?.includes("💰") ||
            profile.defaultWhatsappTemplate?.includes("📅");
          if (hadEmojiTemplate) {
            return {
              profile: {
                ...profile,
                defaultWhatsappTemplate:
                  DEFAULT_COMPANY.defaultWhatsappTemplate,
              },
            };
          }
        }
        return { profile };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
