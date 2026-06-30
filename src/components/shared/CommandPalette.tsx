"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarClock,
  ClipboardCheck,
  Compass,
  FileText,
  HandCoins,
  HardHat,
  Home,
  LayoutDashboard,
  LogIn,
  Palette,
  PieChart,
  Plus,
  Receipt,
  RefreshCcw,
  ScrollText,
  Settings,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useThemeStore } from "@/features/theme/themeStore";
import { themePresets } from "@/features/theme/themes";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const setPreset = useThemeStore((state) => state.setPreset);
  const reset = useThemeStore((state) => state.resetCustomizations);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const pickVibe = (id: string) => {
    setPreset(id);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search customers, quotations, visits, pages…" />
      <CommandList>
        <CommandEmpty>Nothing matches. Try another keyword.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}>
            <Home />
            Home
            <CommandShortcut>G H</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard />
            Open dashboard
            <CommandShortcut>G D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/login")}>
            <LogIn />
            Sign in
            <CommandShortcut>G L</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Operations">
          <CommandItem
            value="customers clients companies people"
            onSelect={() => go("/dashboard/customers")}
          >
            <Users />
            Customers
            <CommandShortcut>G C</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="quotations quote pricing"
            onSelect={() => go("/dashboard/quotations")}
          >
            <FileText />
            Quotations
            <CommandShortcut>G Q</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="contracts service contracts"
            onSelect={() => go("/dashboard/contracts")}
          >
            <ScrollText />
            Service Contracts
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="visits work orders service jobs"
            onSelect={() => go("/dashboard/work-orders")}
          >
            <Wrench />
            Work Orders
            <CommandShortcut>G V</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="engineers technicians team field"
            onSelect={() => go("/dashboard/engineers")}
          >
            <HardHat />
            Engineers
            <CommandShortcut>G E</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="scheduling calendar upcoming"
            onSelect={() => go("/dashboard/scheduling")}
          >
            <CalendarClock />
            Scheduling
          </CommandItem>
          <CommandItem
            value="my tasks jobs engineer assigned work orders"
            onSelect={() => go("/dashboard/my-tasks")}
          >
            <ClipboardCheck />
            My tasks
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Finance">
          <CommandItem
            value="invoices billing payments receivables"
            onSelect={() => go("/dashboard/finance/invoices")}
          >
            <Receipt />
            Invoices
          </CommandItem>
          <CommandItem
            value="expenses spend fuel salaries spare parts costs"
            onSelect={() => go("/dashboard/finance/expenses")}
          >
            <HandCoins />
            Expenses
          </CommandItem>
          <CommandItem
            value="reports analytics charts dashboards profit loss income"
            onSelect={() => go("/dashboard/reports")}
          >
            <PieChart />
            Reports
            <CommandShortcut>G R</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Create">
          <CommandItem
            value="new quotation create"
            onSelect={() => go("/dashboard/quotations/new")}
          >
            <Plus />
            New quotation
          </CommandItem>
          <CommandItem
            value="new customer create"
            onSelect={() => go("/dashboard/customers/new")}
          >
            <Plus />
            New customer
          </CommandItem>
          <CommandItem
            value="new contract create"
            onSelect={() => go("/dashboard/contracts/new")}
          >
            <Plus />
            New service contract
          </CommandItem>
          <CommandItem
            value="new work order create"
            onSelect={() => go("/dashboard/work-orders/new")}
          >
            <Plus />
            New work order
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem
            value="notifications bell"
            onSelect={() => go("/dashboard/notifications")}
          >
            <Bell />
            Notifications
          </CommandItem>
          <CommandItem
            value="settings preferences"
            onSelect={() => go("/dashboard/settings")}
          >
            <Settings />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Switch vibe">
          {themePresets.map((preset) => (
            <CommandItem
              key={preset.id}
              value={`${preset.name} ${preset.vibe}`}
              onSelect={() => pickVibe(preset.id)}
            >
              <Sparkles />
              {preset.name}
              <span className="ml-auto text-xs text-muted-foreground">
                {preset.tagline}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              reset();
              onOpenChange(false);
            }}
          >
            <RefreshCcw />
            Reset theme customisations
          </CommandItem>
          <CommandItem onSelect={() => go("/dashboard/settings#theme")}>
            <Palette />
            Open theme settings
          </CommandItem>
          <CommandItem onSelect={() => go("/dashboard/reports")}>
            <Compass />
            Explore reports
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Provider + hook                                                            */
/* -------------------------------------------------------------------------- */

interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(
  null,
);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const value = useMemo<CommandPaletteContextValue>(
    () => ({ open, close, toggle, isOpen }),
    [open, close, toggle, isOpen],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={isOpen} onOpenChange={setIsOpen} />
    </CommandPaletteContext.Provider>
  );
}

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used inside a <CommandPaletteProvider>",
    );
  }
  return ctx;
}
