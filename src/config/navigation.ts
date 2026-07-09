import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Database,
  Building2,
  CheckSquare,
  BarChart3,
  Settings,
  FileText,
} from "lucide-react";

export interface NavSubItem {
  label: string;
  href: string;
  badge?: string;
}

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  subItems?: NavSubItem[];
  badge?: string;
  hasChevronRight?: boolean;
}

export const crmNavigation: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Database,
    label: "Master Data",
    subItems: [
      { label: "Countries", href: "/dashboard/master-data/countries" },
      { label: "Cities", href: "/dashboard/master-data/cities" },
      { label: "Business Types", href: "/dashboard/master-data/business-types" },
      { label: "Legal Entities", href: "/dashboard/master-data/legal-entities" },
      { label: "Pricing Plans", href: "/dashboard/master-data/plans" },
    ],
  },
  {
    icon: FileText,
    label: "Applications",
    subItems: [
      { label: "Corporate Application", href: "/dashboard/applications/corporate" },
      { label: "Personal Application", href: "/dashboard/applications/personal" },
    ],
  },
  {
    icon: Building2,
    label: "Companies",
    href: "/dashboard/companies",
  },
  {
    icon: CheckSquare,
    label: "Tasks",
    href: "/dashboard/tasks",
  },
  {
    icon: BarChart3,
    label: "Reports",
    href: "/dashboard/reports",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/dashboard/settings",
    hasChevronRight: true,
  },
];

export function isSubItemActive(pathname: string, href: string): boolean {
  return pathname === href;
}

export function navItemHasActiveChild(
  subItems: NavSubItem[] | undefined,
  pathname: string,
): boolean {
  return subItems?.some((sub) => isSubItemActive(pathname, sub.href)) ?? false;
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.subItems?.length) {
    return navItemHasActiveChild(item.subItems, pathname);
  }
  return !!item.href && pathname === item.href;
}
