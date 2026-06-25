import {
  Bell,
  Briefcase,
  Building2,
  CalendarClock,
  CreditCard,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  PieChart,
  Settings,
  Sparkles,
  Target,
  Users,
  Users2,
  type LucideIcon,
} from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeTone?: "default" | "accent" | "destructive";
  /** Hide from collapsed (icon-only) sidebar. */
  hideCollapsed?: boolean;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export const dashboardSidebar: SidebarSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "Pipeline",
        href: "/dashboard/pipeline",
        icon: KanbanSquare,
        badge: "Live",
        badgeTone: "accent",
      },
      {
        label: "Inbox",
        href: "/dashboard/inbox",
        icon: Inbox,
        /** Badge value overridden at render time by the unread count. */
        badge: "inbox",
        badgeTone: "default",
      },
    ],
  },
  {
    label: "Records",
    items: [
      {
        label: "Contacts",
        href: "/dashboard/contacts",
        icon: Users,
      },
      {
        label: "Companies",
        href: "/dashboard/companies",
        icon: Building2,
      },
      {
        label: "Deals",
        href: "/dashboard/deals",
        icon: Briefcase,
        badge: "$",
        badgeTone: "accent",
      },
      {
        label: "Leads",
        href: "/dashboard/leads",
        icon: Target,
        badge: "New",
        badgeTone: "accent",
      },
    ],
  },
  {
    label: "Productivity",
    items: [
      {
        label: "Activities",
        href: "/dashboard/activities",
        icon: ListChecks,
        /** Badge value overridden at render time by the live task count. */
        badge: "todo",
        badgeTone: "default",
      },
      {
        label: "Calendar",
        href: "/dashboard/calendar",
        icon: CalendarClock,
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: PieChart,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        badge: "notifications",
        badgeTone: "default",
      },
      {
        label: "Team",
        href: "/dashboard/settings#members",
        icon: Users2,
      },
      {
        label: "Billing",
        href: "/dashboard/settings#billing",
        icon: CreditCard,
      },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      {
        label: "What's new",
        href: "/dashboard/settings#changelog",
        icon: Sparkles,
        badge: "v0.1",
        badgeTone: "default",
        hideCollapsed: true,
      },
    ],
  },
];
