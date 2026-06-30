"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleSync } from "@/features/locale/LocaleSync";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <TooltipProvider delayDuration={150}>
          <LocaleSync />
          {children}
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
