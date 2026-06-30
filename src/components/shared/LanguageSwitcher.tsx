"use client";

import { Check, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/features/locale/hooks";
import { useLocaleStore } from "@/features/locale/store";
import {
  CURRENCIES,
  LOCALES,
  type Currency,
  type Locale,
} from "@/features/locale/types";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "compact" | "expanded";
}

/**
 * Topbar control that lets the user flip between English / Bahasa Indonesia
 * and pick a workspace currency. The selection is persisted via
 * {@link useLocaleStore} and broadcast through {@link LocaleSync}.
 */
export function LanguageSwitcher({ variant = "compact" }: LanguageSwitcherProps) {
  const locale = useLocaleStore((s) => s.locale);
  const currency = useLocaleStore((s) => s.currency);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const setCurrency = useLocaleStore((s) => s.setCurrency);
  const t = useT();

  const currentLocale = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];
  const currentCurrency =
    CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "compact" ? "icon" : "sm"}
          className={cn(
            "gap-1.5 text-xs font-medium",
            variant === "compact" ? "h-9 w-9" : "h-9 px-2",
          )}
          aria-label={`${t("settings.language")} / ${t("settings.currency")}`}
        >
          {variant === "compact" ? (
            <Globe className="h-4 w-4" aria-hidden />
          ) : (
            <>
              <span aria-hidden>{currentLocale.flag}</span>
              <span className="uppercase tracking-wide">{locale}</span>
              <span className="text-muted-foreground">·</span>
              <span>{currentCurrency.symbol}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56"
        sideOffset={6}
      >
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("settings.language")}
        </DropdownMenuLabel>
        {LOCALES.map((entry) => (
          <DropdownMenuItem
            key={entry.id}
            onSelect={() => setLocale(entry.id as Locale)}
            className="flex items-center gap-2 text-sm"
          >
            <span aria-hidden>{entry.flag}</span>
            <span className="flex-1">{entry.label}</span>
            {entry.id === locale ? (
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          {t("settings.currency")}
        </DropdownMenuLabel>
        {CURRENCIES.map((entry) => (
          <DropdownMenuItem
            key={entry.code}
            onSelect={() => setCurrency(entry.code as Currency)}
            className="flex items-center gap-2 text-sm"
          >
            <span className="w-6 font-semibold text-muted-foreground">
              {entry.symbol}
            </span>
            <span className="flex-1">{entry.label}</span>
            {entry.code === currency ? (
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
