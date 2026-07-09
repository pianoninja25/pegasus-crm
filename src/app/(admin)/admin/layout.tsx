import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { SuperadminGate } from "@/features/auth/SuperadminGate";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SuperadminGate>
      <AdminShell>{children}</AdminShell>
    </SuperadminGate>
  );
}
