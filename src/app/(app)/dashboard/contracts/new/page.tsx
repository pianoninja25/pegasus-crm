"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ScrollText } from "lucide-react";

import { NewContractDialog } from "@/components/contracts/NewContractDialog";
import { PageHeader } from "@/components/common/PageHeader";
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
 * Direct-link entry point for the new-contract flow. Anything that lands
 * here (e.g. a quick-action shortcut, command palette, or email CTA)
 * gets the same dialog the list page uses, then jumps back to the list
 * on cancel.
 */
export default function NewContractPage() {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      router.replace("/dashboard/contracts");
    }
  }, [open, router]);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link href="/dashboard/contracts">
          <ArrowLeft className="h-3.5 w-3.5" /> {t("contracts.title")}
        </Link>
      </Button>
      <PageHeader
        eyebrow={t("contracts.create.title")}
        title={t("contracts.create.title")}
        description={t("contracts.create.description")}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            {t("contracts.create.sectionTerms")}
          </CardTitle>
          <CardDescription>
            {t("contracts.create.previewScheduleHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          The recurring work-order generator runs every time the app boots —
          see <code>generateContractVisits()</code> inside{" "}
          <code className="ml-0.5">src/features/service/seed.ts</code>.
        </CardContent>
      </Card>

      <NewContractDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(created) => {
          router.push(`/dashboard/contracts/${created.id}`);
        }}
      />
    </div>
  );
}
