"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Filter,
  Check,
  ChevronDown,
  Building,
  User,
  Mail,
  Calendar,
  X,
  ShieldCheck,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  Search,
  Loader2,
  AlertCircle,
  Globe,
  MapPin,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { TablePagination } from "@/components/ui/TablePagination";
import {
  useGetCompanyProfilesQuery,
  type CompanyProfile,
} from "@/store/api/applicationsApi";
import { getApiErrorMessage } from "@/lib/api";

export default function CorporateApplicationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  // Automatically debounce search input changes (500ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch list of company profiles
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    error: listError,
  } = useGetCompanyProfilesQuery({
    page,
    limit,
    search: debouncedSearch,
  });

  const profiles = listData?.profiles ?? [];

  // Pagination meta data
  const pagination = {
    page: listData?.page ?? page,
    limit: listData?.limit ?? limit,
    total: listData?.total ?? 0,
    totalPages: listData?.totalPages ?? 1,
  };

  // Search input handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchQuery);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200/50 dark:border-green-500/20";
      case "PENDING":
      case "NOT_STARTED":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20";
      case "REJECTED":
      case "FAILED":
        return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20";
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20";
    }
  };

  const formatKycStatus = (status: string) => {
    if (!status) return "N/A";
    return status
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-[#E52629]/10 flex items-center justify-center">
            <Building2 className="size-5 text-[#E52629]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
              Corporate Applications
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Manage corporate account applications and business onboarding requests.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111111] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative w-72">
            <input
              type="text"
              placeholder="Search company or reg no..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151314] text-xs font-bold text-gray-950 dark:text-white outline-none focus:border-[#E52629] dark:focus:border-[#E52629] transition-all"
            />
            <Search className="size-3.5 text-gray-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </form>
        </div>

        {isListFetching && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
            <Loader2 className="size-3.5 animate-spin text-[#E52629]" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Applications Table Card */}
      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
        {isListLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="size-8 animate-spin text-[#E52629] mx-auto" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Fetching applications...
            </p>
          </div>
        ) : listError ? (
          <div className="py-20 px-6 text-center space-y-3">
            <AlertCircle className="size-10 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Failed to load corporate applications
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {getApiErrorMessage(listError)}
            </p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <Building className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              No matching corporate applications
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Try adjusting your query.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02]">
                    {["S.No.", "Company Name", "Registration No.", "Country", "Entity Type", "Submitted Date", "KYC Status"].map(
                      (heading, index) => (
                        <th
                          key={`corp-col-${index}`}
                          className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {profiles.map((app, index) => (
                    <tr
                      key={app.id}
                      onClick={() => router.push(`/dashboard/applications/corporate/${app.id}`)}
                      className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 font-mono">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                            <Building className="size-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {app.businessLegalName || "Tricky Web Solutions"}
                            </span>
                            {app.brandName && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                Brand: {app.brandName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 font-mono">
                          {app.registrationNumber || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {app.country?.name || "Sweden"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {app.entityType?.name || "Enkelt bolag"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            getStatusClass(app.kycStatus)
                          )}
                        >
                          {formatKycStatus(app.kycStatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <TablePagination
              pagination={pagination}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              pageSizeOptions={[5, 10, 20]}
            />
          </>
        )}
      </div>
    </div>
  );
}
