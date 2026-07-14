"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  UserCircle,
  LogOut,
  Search,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { crmNavigation, navItemHasActiveChild } from "@/config/navigation";
import { SidebarItem } from "./SidebarItem";

function BrandLogo({ collapsed }: { collapsed: boolean }) {
  const logo = (
    <Image
      src="/icon.png"
      alt="Cardinal CRM"
      width={collapsed ? 48 : 56}
      height={collapsed ? 48 : 56}
      className={`object-contain shrink-0 ${collapsed ? "size-12" : "size-14"}`}
      priority
    />
  );

  if (collapsed) {
    return <div className="mx-auto">{logo}</div>;
  }

  return (
    <div className="flex items-center gap-2.5">
      {logo}
      <div>
        <span className="text-white font-black text-lg tracking-tight block leading-none">
          Cardinal CRM
        </span>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Admin
        </span>
      </div>
    </div>
  );
}

function pageTitleFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard";

  // Check if this path matches corporate application details
  if (segments[1] === "applications" && segments[2] === "corporate") {
    if (segments[4] === "associated-person") {
      return "Associated Person Details";
    }
    if (segments[3]) {
      return "Corporate Application Details";
    }
  }

  // Check if this path matches personal application details
  if (segments[1] === "applications" && segments[2] === "personal") {
    if (segments[3]) {
      return "Personal Application Details";
    }
  }

  const segment = segments[segments.length - 1];
  if (segment === "dashboard") return "Dashboard";
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
  if (isUuid) return "Details";

  return segment.replace(/-/g, " ");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, mounted, toggleTheme } = useTheme();
  const { user, initials, logout } = useAuth();
  const isDark = mounted && theme === "dark";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(
    {},
  );
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 1,
      color: "bg-green-500",
      text: "New contact assigned: Sarah Chen from Acme Corp",
      time: "30 min ago",
    },
    {
      id: 2,
      color: "bg-blue-500",
      text: "Deal closed: Enterprise Plan — €24,000",
      time: "2 hours ago",
    },
    {
      id: 3,
      color: "bg-amber-500",
      text: "Task due: Follow up with 3 warm leads",
      time: "Today",
    },
  ]);

  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Auto-expand submenu when a child route is active
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenSubmenus((prev) => {
      const next = { ...prev };
      for (const item of crmNavigation) {
        if (item.subItems && navItemHasActiveChild(item.subItems, pathname)) {
          next[item.label] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  const handleToggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isSubmenuOpen = (label: string, hasSubItems: boolean) => {
    if (!hasSubItems) return false;
    const item = crmNavigation.find((nav) => nav.label === label);
    if (item && navItemHasActiveChild(item.subItems, pathname)) {
      return openSubmenus[label] !== false;
    }
    return !!openSubmenus[label];
  };

  const sidebarNav = (
    <>
      {crmNavigation.map((item) => (
        <SidebarItem
          key={item.label}
          {...item}
          isCollapsed={isSidebarCollapsed}
          isOpen={isSubmenuOpen(item.label, !!item.subItems?.length)}
          onToggle={() => handleToggleSubmenu(item.label)}
          pathname={pathname}
        />
      ))}
    </>
  );

  const userFooter = (collapsed: boolean) => (
    <div
      className={`flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/5 transition-all ${collapsed ? "justify-center" : ""}`}
    >
      <div className="size-10 bg-gradient-to-br from-[#E52629] to-[#C41E3A] rounded-xl flex items-center justify-center border border-white/10 shrink-0 shadow-lg shadow-[#E52629]/10">
        <UserCircle className="size-7 text-white/90" />
      </div>
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-white leading-none truncate">
              {user?.name ?? "Admin User"}
            </p>
            <p className="text-[10px] text-gray-500 font-bold mt-1.5 uppercase tracking-wider truncate">
              {user?.email ?? "CRM Manager"}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-2 text-gray-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-[#FAFAFA] flex overflow-hidden">
      {(isNotificationsOpen || isProfileOpen) && (
        <div
          className="fixed inset-0 z-40 bg-transparent cursor-default"
          onClick={() => {
            setIsNotificationsOpen(false);
            setIsProfileOpen(false);
          }}
          aria-hidden
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-gradient-to-b from-[#0F0D0E] via-[#1D090B] to-[#0A0909] transition-all duration-300 relative z-30 ${
          isSidebarCollapsed ? "w-20 overflow-visible" : "w-72"
        }`}
      >
        <div className="p-6 pb-8 flex items-center justify-between">
          <Link href="/dashboard">
            <BrandLogo collapsed={isSidebarCollapsed} />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 no-scrollbar overflow-y-auto">
          {sidebarNav}
        </nav>

        <div className="p-4">{userFooter(isSidebarCollapsed)}</div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              key="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#0F0D0E] via-[#1D090B] to-[#0A0909] z-50 flex flex-col lg:hidden border-r border-white/5"
            >
              <div className="p-6 pb-4 flex items-center justify-between">
                <Link href="/dashboard">
                  <BrandLogo collapsed={false} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 no-scrollbar">
                {crmNavigation.map((item) => (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    isCollapsed={false}
                    isOpen={isSubmenuOpen(item.label, !!item.subItems?.length)}
                    onToggle={() => handleToggleSubmenu(item.label)}
                    pathname={pathname}
                  />
                ))}
              </nav>

              <div className="p-4 border-t border-white/5">
                {userFooter(false)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header
          className={`h-16 ${isDark ? "bg-[#0A0909] border-white/5" : "bg-white/80 border-gray-100 backdrop-blur-md"} border-b px-8 flex items-center justify-between sticky top-0 shrink-0 transition-all duration-300 ${isNotificationsOpen || isProfileOpen ? "z-50" : "z-20"}`}
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-colors cursor-pointer ${isDark ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-50 text-gray-500"}`}
            >
              <Menu className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden lg:block p-2 rounded-lg transition-colors cursor-pointer ${isDark ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-50 text-gray-500"}`}
            >
              <Menu className="size-5" />
            </button>
            <h2
              className={`text-sm font-bold capitalize font-heading ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {pageTitleFromPath(pathname)}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div
              className={`hidden md:flex items-center justify-between px-4 py-2 w-64 rounded-xl border transition-all ${isDark ? "bg-white/5 border-white/5 text-gray-500" : "bg-gray-50 border border-gray-100 text-gray-400"}`}
            >
              <div className="flex items-center gap-2 w-full">
                <Search className="size-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search CRM..."
                  className="bg-transparent border-none outline-none text-xs font-semibold w-full placeholder-gray-400 dark:placeholder-gray-500 text-gray-950 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-1 opacity-60 shrink-0 pointer-events-none">
                <span className="text-[10px] font-bold">⌘</span>
                <span className="text-[10px] font-bold">K</span>
              </div>
            </div>

            <div
              className={`flex items-center gap-4 border-l pl-6 relative ${isDark ? "border-white/5" : "border-gray-100"}`}
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-colors duration-300 cursor-pointer flex items-center justify-center ${isDark ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-50 text-gray-500"}`}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="size-5 text-amber-500" />
                ) : (
                  <Moon className="size-5 text-indigo-600" />
                )}
              </motion.button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                  }}
                  className={`p-2 rounded-xl relative transition-colors cursor-pointer ${isDark ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-gray-50 text-gray-500"}`}
                >
                  <Bell className="size-5" />
                  {hasUnreadNotifications && (
                    <span
                      className={`absolute top-2 right-2 size-2 bg-[#E52629] border-2 rounded-full ${isDark ? "border-[#0A0909]" : "border-white"}`}
                    />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121212]/90 dark:backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl py-3 z-50">
                    <div className="px-4 pb-2 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
                      <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider font-heading">
                        Notifications
                      </span>
                      <span
                        onClick={() => {
                          setNotificationsList([]);
                          setHasUnreadNotifications(false);
                        }}
                        className="text-[10px] text-[#E52629] font-bold cursor-pointer hover:underline"
                      >
                        Clear all
                      </span>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-64 overflow-y-auto no-scrollbar">
                      {notificationsList.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                          No notifications
                        </div>
                      ) : (
                        notificationsList.map((n) => (
                          <div
                            key={n.id}
                            className="p-3 px-4 hover:bg-red-50/10 dark:hover:bg-white/[0.02] transition-colors flex items-start gap-2.5 cursor-pointer"
                          >
                            <div
                              className={`size-2 rounded-full ${n.color} mt-1.5 shrink-0`}
                            />
                            <div>
                              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">
                                {n.text}
                              </p>
                              <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                                {n.time}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="size-8 bg-gradient-to-br from-[#E52629] to-[#C41E3A] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-[#E52629]/20 hover:scale-105 transition-transform cursor-pointer"
                >
                  {initials}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121212]/90 dark:backdrop-blur-md border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl py-2.5 z-50 text-left">
                    <div className="px-4 py-2 border-b border-gray-50 dark:border-white/5">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white font-heading">
                        {user?.name ?? "Admin User"}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 truncate">
                        {user?.email ?? "CRM Manager"}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left flex items-center gap-2 cursor-pointer"
                      >
                        <UserCircle className="size-3.5 text-gray-400" />
                        <span>Profile</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50/50 dark:hover:bg-white/5 transition-colors text-left flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="size-3.5 text-red-500" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA] dark:bg-[#0A0909] transition-colors duration-300"
        >
          {children}
        </div>
      </main>
    </div>
  );
}
