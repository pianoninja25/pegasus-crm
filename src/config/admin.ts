import {
  Building2,
  LayoutDashboard,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Static nav for the **superadmin** `/admin` platform console.
 *
 * Kept separate from `dashboardSidebar` because the two experiences are
 * fully disjoint: the tenant dashboard is a per-workspace UX, whereas the
 * admin console is the cross-tenant control plane.
 */
export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** True when the item's route is a prefix of the current pathname. */
  matchExact?: boolean;
}

export interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

export const adminSidebar: AdminNavSection[] = [
  {
    label: "Platform",
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        matchExact: true,
      },
      {
        label: "Tenants",
        href: "/admin/tenants",
        icon: Building2,
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
      },
    ],
  },
];
