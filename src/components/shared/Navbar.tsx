"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Command, LogIn, Menu, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";
import { CommandPalette } from "./CommandPalette";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          scrolled ? "pt-3" : "pt-5",
        )}
      >
        <div className="container">
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-full border px-3 py-2 transition-all duration-500",
              scrolled
                ? "glass-strong border-border/80 shadow-glow-sm"
                : "border-transparent bg-transparent",
            )}
          >
            <div className="flex items-center gap-6">
              <Logo />
              <nav className="hidden items-center gap-1 md:flex">
                {siteConfig.nav.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-primary/15 ring-1 ring-inset ring-primary/30"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 pl-3 pr-2 text-xs"
                onClick={() => setPaletteOpen(true)}
              >
                <Command className="h-3.5 w-3.5" />
                <span className="text-muted-foreground">Search…</span>
                <kbd className="ml-2 rounded-md border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  ⌘K
                </kbd>
              </Button>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="gap-1.5 text-foreground/80"
              >
                <Link href="/login">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign in
                </Link>
              </Button>
              <Button asChild size="sm" variant="default" className="gap-1.5">
                <Link href="/dashboard">
                  <Sparkles className="h-3.5 w-3.5" />
                  Open the CRM
                </Link>
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <SheetHeader>
                  <SheetTitle>Navigate</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  {siteConfig.nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm font-medium transition hover:border-primary/40"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline">
                    <Link href="/login">
                      <LogIn className="h-3.5 w-3.5" />
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard">
                      <Sparkles className="h-3.5 w-3.5" />
                      Open CRM
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
