"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Github, KeyRound, Mail } from "lucide-react";

import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { CursorGlow } from "@/components/shared/CursorGlow";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/authStore";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("leo@pegasus.io");
  const [password, setPassword] = useState("•••••••••");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signIn();
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuroraBackground />
      <CursorGlow />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 lg:px-10">
        <Logo />
        <Button asChild variant="ghost" size="sm" className="text-foreground/80">
          <Link href="/">Back to home</Link>
        </Button>
      </header>

      <main className="relative grid min-h-screen place-items-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border border-border/60 bg-card/70 p-7 backdrop-blur-xl shadow-glow-sm">
            <div className="mb-6 text-center">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sign in to your Pegasus CRM workspace.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  signIn();
                  router.push("/dashboard");
                }}
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  signIn();
                  router.push("/dashboard");
                }}
              >
                <Mail className="h-4 w-4" />
                Google
              </Button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                or
              </span>
              <Separator className="flex-1" />
            </div>

            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-[11px] text-primary hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full gap-2" size="lg">
                <KeyRound className="h-4 w-4" />
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Demo workspace — every credential lands you in as{" "}
              <span className="text-foreground">Leo Santoso</span>.
            </p>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/dashboard" className="text-primary hover:underline">
              Skip and explore the demo
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
