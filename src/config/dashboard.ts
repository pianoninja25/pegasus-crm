import {
  Bell,
  CalendarClock,
  ClipboardCheck,
  FileText,
  HandCoins,
  HardHat,
  LayoutDashboard,
  PieChart,
  Receipt,
  ScrollText,
  Settings,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { DictKey } from "@/features/locale/dictionary";
import type { UserRole } from "@/features/service/types";

export interface SidebarItem {
  /** Dictionary key — translated at render time. */
  labelKey: DictKey;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeTone?: "default" | "accent" | "destructive";
  hideCollapsed?: boolean;
  /** Roles allowed to see this item. Default = all roles. */
  roles?: UserRole[];
}

export interface SidebarSection {
  /** Dictionary key — translated at render time. */
  labelKey: DictKey;
  items: SidebarItem[];
}

/**
 * Sidebar nav for the AC Service application. Item visibility is filtered at
 * render time by the active user's role: engineers see a slimmed-down nav
 * with just their work, admin staff see customer + finance flows, etc.
 */
export const dashboardSidebar: SidebarSection[] = [
  {
    labelKey: "nav.workspace",
    items: [
      {
        labelKey: "nav.dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        labelKey: "nav.scheduling",
        href: "/dashboard/scheduling",
        icon: CalendarClock,
        badge: "upcoming",
        badgeTone: "default",
      },
      {
        labelKey: "nav.myTasks",
        href: "/dashboard/my-tasks",
        icon: ClipboardCheck,
        roles: ["engineer", "administrator", "manager"],
      },
    ],
  },
  {
    labelKey: "nav.operations",
    items: [
      {
        labelKey: "nav.customers",
        href: "/dashboard/customers",
        icon: Users,
        roles: ["administrator", "manager", "admin_staff"],
      },
      {
        labelKey: "nav.engineers",
        href: "/dashboard/engineers",
        icon: HardHat,
        roles: ["administrator", "manager", "admin_staff"],
      },
      {
        labelKey: "nav.quotations",
        href: "/dashboard/quotations",
        icon: FileText,
        roles: ["administrator", "manager", "admin_staff"],
      },
      {
        labelKey: "nav.contracts",
        href: "/dashboard/contracts",
        icon: ScrollText,
        badge: "Live",
        badgeTone: "accent",
        roles: ["administrator", "manager", "admin_staff"],
      },
      {
        labelKey: "nav.workOrders",
        href: "/dashboard/work-orders",
        icon: Wrench,
      },
    ],
  },
  {
    labelKey: "nav.finance",
    items: [
      {
        labelKey: "nav.invoices",
        href: "/dashboard/finance/invoices",
        icon: Receipt,
        roles: ["administrator", "manager", "admin_staff"],
      },
      {
        labelKey: "nav.expenses",
        href: "/dashboard/finance/expenses",
        icon: HandCoins,
        roles: ["administrator", "manager", "admin_staff"],
      },
      {
        labelKey: "nav.reports",
        href: "/dashboard/reports",
        icon: PieChart,
        roles: ["administrator", "manager"],
      },
    ],
  },
  {
    labelKey: "nav.account",
    items: [
      {
        labelKey: "nav.notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        badge: "notifications",
        badgeTone: "default",
      },
      {
        labelKey: "nav.settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
