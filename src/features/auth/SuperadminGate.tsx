"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "./authStore";
import { useMounted } from "@/hooks/useMounted";

interface SuperadminGateProps {
  children: React.ReactNode;
}

/**
 * Route guard for the `/admin` platform console.
 *
 * • Not signed in           → redirect to `/login`
 * • Signed in, not superadmin → redirect to `/dashboard`
 * • Signed in as superadmin → render the tree
 *
 * This is a **client-side** guard, matching the rest of the demo's mock
 * auth setup. When a real auth layer is introduced, the equivalent check
 * should also run in `middleware.ts` so the platform pages are not even
 * shipped to non-superadmins.
 */
export function SuperadminGate({ children }: SuperadminGateProps) {
  const router = useRouter();
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "superadmin") {
      router.replace("/dashboard");
    }
  }, [user, mounted, router]);

  if (!mounted) return null;
  if (!user || user.role !== "superadmin") return null;
  return <>{children}</>;
}
