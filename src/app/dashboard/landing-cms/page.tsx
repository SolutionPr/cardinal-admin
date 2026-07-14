"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  RefreshCw,
  FolderOpen,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface RouteItem {
  label: string;
  path: string;
}

interface RouteCategory {
  category: string;
  routes: RouteItem[];
}

const websiteRoutes: RouteCategory[] = [
  {
    category: "Landing",
    routes: [{ label: "Homepage (landing page)", path: "/" }],
  },
  {
    category: "Top-level nav",
    routes: [
      { label: "Customers", path: "/customers" },
      { label: "Login", path: "/login" },
      { label: "Signup", path: "/signup" },
    ],
  },
  {
    category: "Products (/products/...)",
    routes: [
      { label: "Business account", path: "/products/business-account" },
      { label: "Cards", path: "/products/cards" },
      { label: "Cashback", path: "/products/cashback" },
      { label: "International payments", path: "/products/international-payments" },
      { label: "Fixed interest", path: "/products/fixed-interest" },
      { label: "Model Portfolios", path: "/products/model-portfolios" },
      { label: "Business Brokerage", path: "/products/business-brokerage" },
      { label: "Online payments", path: "/products/online-payments" },
      { label: "POS terminals", path: "/products/pos-terminals" },
      { label: "Invoicing", path: "/products/invoicing" },
      { label: "Bookkeeping", path: "/products/bookkeeping" },
      { label: "Tax filing", path: "/products/tax-filing" },
      { label: "Digital employees", path: "/products/digital-employees" },
      { label: "Business travel", path: "/products/business-travel" },
      { label: "Integrations", path: "/products/integrations" },
    ],
  },
  {
    category: "Solutions (/solutions/...)",
    routes: [
      { label: "Freelancers", path: "/solutions/freelancers" },
      { label: "Partnerships", path: "/solutions/partnerships" },
      { label: "Startups", path: "/solutions/startups" },
      { label: "Non-profits", path: "/solutions/non-profits" },
      { label: "Companies in formation", path: "/solutions/companies-in-formation" },
      { label: "Cash management", path: "/solutions/cash-management" },
      { label: "Unlimited spendings", path: "/solutions/unlimited-spendings" },
      { label: "Company registration", path: "/solutions/company-registration" },
      { label: "Freelancer registration", path: "/solutions/freelancer-registration" },
    ],
  },
  {
    category: "Pricing (/pricing/...)",
    routes: [
      { label: "Pricing parent page", path: "/pricing" },
      { label: "Freelancers Pricing", path: "/pricing/freelancers" },
      { label: "Companies Pricing", path: "/pricing/companies" },
      { label: "Enterprises Pricing", path: "/pricing/enterprises" },
    ],
  },
  {
    category: "Personal (/personal/...)",
    routes: [
      { label: "Accounts", path: "/personal/accounts" },
      { label: "Payments", path: "/personal/payments" },
      { label: "Cards", path: "/personal/cards" },
      { label: "Stocks and ETFs", path: "/personal/stocks-and-etfs" },
      { label: "Crypto", path: "/personal/crypto" },
      { label: "Interest Rate", path: "/personal/interest-rate" },
      { label: "Rewards", path: "/personal/rewards" },
      { label: "Prime Plan", path: "/personal/prime" },
      { label: "Personal Pricing", path: "/personal/pricing" },
    ],
  },
  {
    category: "Resources (/resources/...)",
    routes: [
      { label: "About Cardinal", path: "/resources/about-cardinal" },
      { label: "Press", path: "/resources/press" },
      { label: "Careers", path: "/resources/careers" },
      { label: "Events & webinars", path: "/resources/events-and-webinars" },
      { label: "Blog", path: "/resources/blog" },
      { label: "Affiliate program", path: "/resources/affiliate-program" },
      { label: "Help Centre Business", path: "/resources/help-centre-business" },
      { label: "Help Centre Personal", path: "/resources/help-centre-personal" },
      { label: "Contact us", path: "/resources/contact-us" },
    ],
  },
];

export default function LandingCMSPage() {
  const [selectedRoute, setSelectedRoute] = useState<string>("/");
  const [cmsToken, setCmsToken] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Landing: true,
    "Top-level nav": true,
  });
  const [isRoutesSidebarCollapsed, setIsRoutesSidebarCollapsed] = useState<boolean>(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const adminToken = localStorage.getItem("cardinal_crm_token");
    if (adminToken) {
      setCmsToken(adminToken);
    } else {
      setCmsToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjZDk3MzJiOS1iMTA5LTQ1ZGEtYTk1Zi1mYThhOWMwZjgwODciLCJlbWFpbCI6ImFkbWluQGZpbnRlY2guY29tIiwiZGV2aWNlSWQiOiI4MDFmZmNjMi0wZGU5LTRiZmMtOGEyOS0wMjdmNzE5NTk3ZjUiLCJpYXQiOjE3ODQwMDU0OTksImV4cCI6MTc4NDYxMDI5OX0.m6GTTNntZUNPXU4k4ueaC3QRvu43eE9Yq9jABKQs128");
    }
  }, []);

  // Listen for navigation messages from the preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      let newPath = "";
      if (typeof event.data === "string") {
        try {
          const parsed = JSON.parse(event.data);
          newPath = parsed.path || parsed.route || parsed.url || parsed.pathname || parsed.href || parsed.currentRoute || (parsed.type === "ROUTE_CHANGE" && parsed.data);
        } catch {
          if (event.data.startsWith("/") || event.data.startsWith("http")) {
            newPath = event.data;
          }
        }
      } else if (typeof event.data === "object") {
        newPath = event.data.path || event.data.route || event.data.url || event.data.pathname || event.data.href || event.data.currentRoute || (event.data.type === "ROUTE_CHANGE" && event.data.data);
      }

      if (newPath && typeof newPath === "string") {
        let cleanPath = newPath;
        if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
          try {
            cleanPath = new URL(cleanPath).pathname;
          } catch {}
        }
        cleanPath = cleanPath.split("?")[0].split("#")[0];
        const formattedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
        setSelectedRoute(formattedPath);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Auto-expand category when selectedRoute changes
  useEffect(() => {
    const parentGroup = websiteRoutes.find((group) =>
      group.routes.some((r) => r.path === selectedRoute)
    );
    if (parentGroup) {
      setExpandedCategories((prev) => ({
        ...prev,
        [parentGroup.category]: true,
      }));
    }
  }, [selectedRoute]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCmsToken(val);
    localStorage.setItem("cardinal_cms_token", val);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  // Filter routes based on search
  const filteredRoutes = websiteRoutes
    .map((group) => {
      const routes = group.routes.filter(
        (r) =>
          r.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.path.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...group, routes };
    })
    .filter((group) => group.routes.length > 0);

  const baseUrl = "https://fintech.elyriasoft.com";
  const previewUrl = `${baseUrl}${selectedRoute}${
    cmsToken ? `?cms_token=${encodeURIComponent(cmsToken)}` : ""
  }`;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      {/* Left panel - Route Selector */}
      <div className={cn(
        "w-full lg:w-96 flex flex-col bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden shrink-0 transition-all duration-300",
        isRoutesSidebarCollapsed && "lg:w-0 lg:opacity-0 lg:pointer-events-none lg:border-0 lg:p-0 lg:m-0"
      )}>
        {!isRoutesSidebarCollapsed && (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                  <Globe className="size-5 text-[#e52629]" />
                  Website Routes
                </h2>
                <span className="text-[11px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  47 Pages
                </span>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search pages or paths..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Routes List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {filteredRoutes.map((group) => {
                const isExpanded = !!expandedCategories[group.category];
                return (
                  <div key={group.category} className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-transparent">
                    <button
                      type="button"
                      onClick={() => toggleCategory(group.category)}
                      className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <FolderOpen className="size-3.5 text-gray-400 dark:text-gray-500" />
                        {group.category}
                      </span>
                      <ChevronRight
                        className={cn(
                          "size-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </button>
                    {isExpanded && (
                      <div className="p-1.5 space-y-1">
                        {group.routes.map((route) => {
                          const isActive = selectedRoute === route.path;
                          return (
                            <button
                              key={route.path}
                              type="button"
                              onClick={() => setSelectedRoute(route.path)}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group",
                                isActive
                                  ? "bg-[#e52629] text-white font-bold shadow-sm shadow-[#e52629]/10"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                              )}
                            >
                              <div className="min-w-0 pr-2">
                                <div
                                  className={cn(
                                    "truncate font-medium",
                                    isActive ? "text-white" : "text-gray-900 dark:text-white"
                                  )}
                                >
                                  {route.label}
                                </div>
                                <div
                                  className={cn(
                                    "text-xs truncate font-mono mt-0.5",
                                    isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                                  )}
                                >
                                  {route.path}
                                </div>
                              </div>
                              <Eye
                                className={cn(
                                  "size-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                                  isActive ? "text-white opacity-100" : "text-gray-400 dark:text-gray-500"
                                )}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredRoutes.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No routes found matching your search.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right panel - Live Preview and Control Bar */}
      <div className="w-full lg:flex-1 flex flex-col bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {/* Editor Controls bar */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Collapse sidebar button */}
            <button
              type="button"
              onClick={() => setIsRoutesSidebarCollapsed(!isRoutesSidebarCollapsed)}
              className="p-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors shadow-sm cursor-pointer"
              title={isRoutesSidebarCollapsed ? "Show routes panel" : "Full screen preview"}
            >
              {isRoutesSidebarCollapsed ? <FolderOpen className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
            
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md">
                Viewing: <span className="font-mono text-primary font-medium">{selectedRoute}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Action buttons */}
            <button
              type="button"
              onClick={reloadIframe}
              className="p-2 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors shadow-sm cursor-pointer"
              title="Reload preview"
            >
              <RefreshCw className="size-4" />
            </button>

            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-[#e52629] text-white hover:bg-[#c41e3a] rounded-xl shadow-sm shadow-primary/10 transition-colors"
            >
              Full Screen <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 bg-gray-50 dark:bg-[#0b0b0b] relative">
          <iframe
            key={iframeKey}
            src={previewUrl}
            className="w-full h-full border-0 bg-white dark:bg-[#111111]"
            title="Website Live CMS Preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
}

