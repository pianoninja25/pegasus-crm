import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Section heading used inside form dialogs to group related fields
 * (e.g. "Parties", "Line items", "Totals"). Renders a small uppercase
 * label with a tinted icon prefix and the children stacked below.
 *
 * Use alongside {@link FormField} so the dialog layout stays uniform
 * across NewQuotationDialog, NewContractDialog, NewCustomerDialog,
 * NewEngineerDialog and CompanyBrandPanel.
 */
export function FormSection({
  icon,
  title,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

/**
 * Labelled form field wrapper. Renders a 11px uppercase-ish label
 * above the input. Append `*` to the label string when the field is
 * required.
 */
export function FormField({
  label,
  children,
  className,
  hint,
}: {
  label: string;
  children: ReactNode;
  /** Optional helper text shown below the input. */
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[11px] font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && (
        <p className="text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
