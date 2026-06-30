/**
 * WhatsApp click-to-chat helpers.
 *
 * We deliberately avoid the WhatsApp Business Cloud API for this scale —
 * the universal `wa.me/<phone>?text=<message>` URL works on every device,
 * desktop or mobile, and matches how Indonesian SMBs actually share
 * quotations / invoices today (open chat with pre-filled text, manually
 * attach the freshly-downloaded PDF, hit send).
 */

/**
 * Clean a phone number for use in `wa.me` URLs.
 *
 * `wa.me` expects an **international, digits-only** number with no leading
 * `+`. Handles common Indonesian variants:
 *
 *  - `+62 812-3456-7890` → `6281234567890`
 *  - `0812-3456-7890`     → `6281234567890` (leading `0` → `62`)
 *  - `(021) 555 1234`     → `622155551234`
 *
 * Returns `null` if the input doesn't contain enough digits to be valid.
 */
export function cleanPhoneForWa(input: string): string | null {
  if (!input) return null;
  // Strip everything except digits and a leading "+"
  let digits = input.replace(/[^\d+]/g, "");
  // Normalise: drop leading + (wa.me wants no plus)
  if (digits.startsWith("+")) digits = digits.slice(1);
  // Indonesian leading-zero local form → +62
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  // Sanity check — minimum length for an international mobile number
  if (digits.length < 7) return null;
  return digits;
}

/** Build a `wa.me` URL. Phone is cleaned first; `text` is URL-encoded. */
export function whatsappShareUrl(
  phone: string,
  text: string,
): string | null {
  const cleaned = cleanPhoneForWa(phone);
  if (!cleaned) return null;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

/**
 * Render a WhatsApp template by substituting `{{var.path}}` placeholders
 * with values from the supplied context. Unknown placeholders are left as
 * the literal text — easier to spot bugs than rendering an empty string.
 */
export function renderWhatsappTemplate(
  template: string,
  context: Record<string, string>,
): string {
  return template.replace(/\{\{([\w.]+)\}\}/g, (full, key: string) =>
    Object.prototype.hasOwnProperty.call(context, key) ? context[key] : full,
  );
}
