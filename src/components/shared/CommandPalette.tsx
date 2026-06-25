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
  Briefcase,
  Building2,
  CalendarClock,
  Compass,
  CreditCard,
  Home,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  LogIn,
  Palette,
  PieChart,
  Plus,
  RefreshCcw,
  Sparkles,
  Target,
  Users,
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
      <CommandInput placeholder="Search contacts, deals, pages and actions…" />
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

        <CommandGroup heading="Workspace">
          <CommandItem
            value="pipeline kanban board stages"
            onSelect={() => go("/dashboard/pipeline")}
          >
            <KanbanSquare />
            Pipeline (kanban)
            <CommandShortcut>G P</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="contacts people"
            onSelect={() => go("/dashboard/contacts")}
          >
            <Users />
            Contacts
            <CommandShortcut>G C</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="companies accounts organizations"
            onSelect={() => go("/dashboard/companies")}
          >
            <Building2 />
            Companies
            <CommandShortcut>G O</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="deals opportunities revenue"
            onSelect={() => go("/dashboard/deals")}
          >
            <Briefcase />
            Deals
            <CommandShortcut>G $</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="leads prospects new"
            onSelect={() => go("/dashboard/leads")}
          >
            <Target />
            Leads
          </CommandItem>
          <CommandItem
            value="activities tasks calls emails"
            onSelect={() => go("/dashboard/activities")}
          >
            <ListChecks />
            Activities
            <CommandShortcut>G A</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="inbox conversations messages email threads"
            onSelect={() => go("/dashboard/inbox")}
          >
            <Inbox />
            Inbox
            <CommandShortcut>G I</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="calendar schedule meetings"
            onSelect={() => go("/dashboard/calendar")}
          >
            <CalendarClock />
            Calendar
          </CommandItem>
          <CommandItem
            value="reports analytics dashboards charts"
            onSelect={() => go("/dashboard/reports")}
          >
            <PieChart />
            Reports
            <CommandShortcut>G R</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="notifications bell"
            onSelect={() => go("/dashboard/notifications")}
          >
            <Bell />
            Notifications
          </CommandItem>
          <CommandItem
            value="settings members billing"
            onSelect={() => go("/dashboard/settings")}
          >
            <CreditCard />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Create">
          <CommandItem
            value="new deal create opportunity"
            onSelect={() => go("/dashboard/deals?new=1")}
          >
            <Plus />
            New deal
          </CommandItem>
          <CommandItem
            value="new contact person"
            onSelect={() => go("/dashboard/contacts?new=1")}
          >
            <Plus />
            New contact
          </CommandItem>
          <CommandItem
            value="new company account organization"
            onSelect={() => go("/dashboard/companies?new=1")}
          >
            <Plus />
            New company
          </CommandItem>
          <CommandItem
            value="new activity task"
            onSelect={() => go("/dashboard/activities?new=1")}
          >
            <Plus />
            Log an activity
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

/** Wrap the dashboard shell in this provider so any child can pop the
 * palette via {@link useCommandPalette}. Also binds the global ⌘K / Ctrl+K
 * hotkey. */
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
