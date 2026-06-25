"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "./authStore";
import { useMounted } from "@/hooks/useMounted";

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Mock auth gate. Until the auth store reports a `user`, redirect to /login.
 * The persisted store auto-signs the demo user in on first load so this is
 * mostly a soft guard — useful when the user explicitly signs out.
 */
export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!mounted) return;
    if (!user) router.replace("/login");
  }, [user, mounted, router]);

  if (!mounted) return null;
  if (!user) return null;
  return <>{children}</>;
}
