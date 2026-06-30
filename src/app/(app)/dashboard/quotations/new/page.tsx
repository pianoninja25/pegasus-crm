"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { NewQuotationDialog } from "@/components/quotations/NewQuotationDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/features/locale/hooks";

/**
 * Direct-link entry point for the new-quotation flow. Anything that
 * lands here (e.g. customer detail "+ New quotation" button, command
 * palette shortcut, email CTA) gets the same dialog the list page
 * uses, then jumps back to the list (or the new quotation) on close.
 *
 * Supports `?customer=<id>` to pre-select a customer so the user
 * doesn't have to re-pick from the typeahead when coming from a
 * customer-scoped context.
 */
export default function NewQuotationPage() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCustomerId = searchParams.get("customer") ?? undefined;

  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      router.replace("/dashboard/quotations");
    }
  }, [open, router]);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link href="/dashboard/quotations">
          <ArrowLeft className="h-3.5 w-3.5" /> {t("quotations.title")}
        </Link>
      </Button>
      <PageHeader
        eyebrow={t("quotations.create.title")}
        title={t("quotations.create.title")}
        description={t("quotations.create.description")}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("quotations.create.sectionDetails")}
          </CardTitle>
          <CardDescription>
            {t("quotations.create.requiredHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {t("quotations.create.description")}
        </CardContent>
      </Card>

      <NewQuotationDialog
        open={open}
        onOpenChange={setOpen}
        defaultCustomerId={defaultCustomerId}
        onCreated={(created) => {
          router.push(`/dashboard/quotations/${created.id}`);
        }}
      />
    </div>
  );
}
