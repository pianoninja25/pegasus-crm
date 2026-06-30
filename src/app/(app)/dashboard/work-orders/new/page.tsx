"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewWorkOrderPage() {
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link href="/dashboard/work-orders">
          <ArrowLeft className="h-3.5 w-3.5" /> Work orders
        </Link>
      </Button>
      <PageHeader
        eyebrow="New work order"
        title="Create a new work order"
        description="Pick the customer, the work type, an engineer and a slot — Pegasus will auto-build the checklist."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Demo placeholder
          </CardTitle>
          <CardDescription>
            This route is reserved for the work-order creation form. The
            schedule generator already provisions recurring work orders
            automatically when service contracts are created — this form is
            for one-off jobs (e.g. converted from approved quotations).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          You can scaffold the form by mirroring the quotation creator at{" "}
          <code>src/app/(app)/dashboard/quotations/new/page.tsx</code>.
        </CardContent>
      </Card>
    </div>
  );
}
