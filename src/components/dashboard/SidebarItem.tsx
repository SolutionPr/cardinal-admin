"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  isSubItemActive,
  navItemHasActiveChild,
  type NavItem,
  type NavSubItem,
} from "@/config/navigation";

interface SidebarItemProps extends NavItem {
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  subItems,
  badge,
  isCollapsed,
  isOpen,
  onToggle,
  pathname,
  hasChevronRight,
}: SidebarItemProps) {
  const router = useRouter();
  const hasSubItems = subItems && subItems.length > 0;
  const hasActiveChild = hasSubItems && navItemHasActiveChild(subItems, pathname);
  const isLeafActive = !hasSubItems && !!href && pathname === href;

  const handleParentClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      onToggle();
    } else if (href) {
      router.push(href);
    }
  };

  const activeClasses =
    "bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white shadow-[0_4px_12px_rgba(229,38,41,0.2)]";
  const sectionOpenClasses =
    "text-[#E52629] hover:bg-white/[0.04]";
  const idleClasses =
    "text-gray-400 hover:bg-white/[0.04] hover:text-white";

  if (hasSubItems) {
    return (
      <div className="space-y-1 relative">
        <button
          type="button"
          onClick={handleParentClick}
          className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 relative cursor-pointer focus:outline-none ${
            hasActiveChild ? sectionOpenClasses : idleClasses
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon
              className={`size-5 transition-colors ${
                hasActiveChild
                  ? "text-[#E52629]"
                  : "text-gray-400 group-hover:text-white"
              }`}
            />
            {!isCollapsed && (
              <span
                className={`text-[15px] font-bold whitespace-nowrap tracking-tight ${
                  hasActiveChild
                    ? "text-[#E52629]"
                    : "text-gray-400 group-hover:text-white"
                }`}
              >
                {label}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {badge && (
                <span className="bg-[#E8F8EE] text-[#13B24F] px-2 py-0.5 rounded-full text-[10px] font-black">
                  {badge}
                </span>
              )}
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                } ${hasActiveChild ? "text-[#E52629]" : "text-gray-500"}`}
              />
            </div>
          )}
        </button>

        {isOpen &&
          hasSubItems &&
          (isCollapsed ? (
            <div className="flex flex-col items-center gap-1.5 py-1">
              {subItems.map((sub: NavSubItem) => {
                const isChildActive = isSubItemActive(pathname, sub.href);
                const initials = sub.label
                  .split(/[\s-]+/)
                  .map((w) => w[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    title={sub.label}
                    className={`flex items-center justify-center size-8 rounded-xl text-xs font-black transition-all focus:outline-none cursor-pointer ${
                      isChildActive
                        ? "text-[#E52629] bg-[#E52629]/15 border border-[#E52629]/30"
                        : "text-gray-500 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {initials}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="pl-3.5 space-y-1 border-l border-white/10 ml-4 text-left">
              {subItems.map((sub: NavSubItem) => {
                const isChildActive = isSubItemActive(pathname, sub.href);
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 focus:outline-none cursor-pointer ${
                      isChildActive ? activeClasses : idleClasses
                    }`}
                  >
                    <span>{sub.label}</span>
                    {sub.badge && (
                      <span className="bg-[#E8F8EE] text-[#13B24F] px-2 py-0.5 rounded-full text-[9px] font-black mr-2">
                        {sub.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
      </div>
    );
  }

  return (
    <Link
      href={href || "#"}
      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 focus:outline-none cursor-pointer ${
        isLeafActive ? activeClasses : idleClasses
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`size-5 transition-colors ${
            isLeafActive ? "text-white" : "text-gray-400 group-hover:text-white"
          }`}
        />
        {!isCollapsed && (
          <span
            className={`text-[15px] font-bold whitespace-nowrap tracking-tight ${
              isLeafActive ? "text-white" : "text-gray-400 group-hover:text-white"
            }`}
          >
            {label}
          </span>
        )}
      </div>
      {!isCollapsed && (
        <div className="flex items-center gap-2">
          {badge && (
            <span className="bg-[#E8F8EE] text-[#13B24F] px-2 py-0.5 rounded-full text-[10px] font-black">
              {badge}
            </span>
          )}
          {hasChevronRight && (
            <ChevronRight className="size-4 text-gray-500" />
          )}
        </div>
      )}
    </Link>
  );
}
