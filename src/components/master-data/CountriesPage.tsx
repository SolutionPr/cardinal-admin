"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { paginateItems } from "@/lib/pagination";
import { CountryFormModal } from "@/components/master-data/CountryFormModal";
import { CountryRowActions } from "@/components/master-data/CountryRowActions";
import { DeleteCountryDialog } from "@/components/master-data/DeleteCountryDialog";
import { TablePagination } from "@/components/ui/TablePagination";
import type { Country } from "@/services/country.service";
import {
  useDeleteCountryMutation,
  useGetCountriesQuery,
} from "@/store/api/masterDataApi";

const DEFAULT_LIMIT = 10;

function SupportedIndicator({ supported }: { supported?: boolean }) {
  if (supported === undefined) {
    return <span className="text-xs font-semibold text-gray-400">—</span>;
  }

  return supported ? (
    <span className="inline-flex items-center justify-center size-7 rounded-full bg-green-50 dark:bg-green-500/10">
      <Check className="size-4 text-green-600 dark:text-green-400" strokeWidth={3} />
    </span>
  ) : (
    <span className="inline-flex items-center justify-center size-7 rounded-full bg-red-50 dark:bg-[#E52629]/10">
      <X className="size-4 text-[#E52629]" strokeWidth={3} />
    </span>
  );
}

function StatusBadge({ active }: { active?: boolean }) {
  if (active === undefined) {
    return <span className="text-xs font-semibold text-gray-400">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
        active
          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
          : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function CountriesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: allCountries = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCountriesQuery();

  const [searchVal, setSearchVal] = useState("");
  const [deleteCountry, { isLoading: isDeleting }] = useDeleteCountryMutation();

  const filteredCountries = useMemo(() => {
    if (!searchVal.trim()) return allCountries;
    const q = searchVal.trim().toLowerCase();
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.phonePrefix?.toLowerCase().includes(q)
    );
  }, [allCountries, searchVal]);

  const { items: countries, pagination } = useMemo(
    () => paginateItems(filteredCountries, page, limit),
    [filteredCountries, page, limit],
  );

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    setPage(1);
  };
  const errorMessage = error ? getApiErrorMessage(error) : null;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const openCreateForm = () => {
    setFormMode("create");
    setSelectedCountry(null);
    setFormOpen(true);
  };

  const openEditForm = (country: Country) => {
    setFormMode("edit");
    setSelectedCountry(country);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedCountry(null);
  };

  const openDeleteDialog = (country: Country) => {
    setDeleteError(null);
    setCountryToDelete(country);
  };

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setCountryToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!countryToDelete) return;

    setDeleteError(null);
    const idOrCode = countryToDelete.code ?? countryToDelete.id;

    try {
      await deleteCountry(idOrCode).unwrap();
      setCountryToDelete(null);

      if (countries.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-[#E52629]/10 flex items-center justify-center">
              <Globe className="size-5 text-[#E52629]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
                Countries
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Country configurations used across the platform.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E52629] to-[#B3191B] text-sm font-black text-white shadow-[0_4px_12px_rgba(229,38,41,0.2)] hover:from-[#C41E3A] hover:to-[#9B1517] transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            Add country
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-sm font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3">
          <AlertCircle className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {filteredCountries.length} registered countr{filteredCountries.length === 1 ? "y" : "ies"}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              id="country-search"
              type="text"
              value={searchVal}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search countries..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 text-[#E52629] animate-spin" />
          </div>
        ) : allCountries.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <Globe className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              No countries found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Create a country configuration to get started.
            </p>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-gradient-to-r from-[#E52629] to-[#B3191B] text-sm font-black text-white shadow-[0_4px_12px_rgba(229,38,41,0.2)] cursor-pointer"
            >
              <Plus className="size-4" />
              Add country
            </button>
          </div>
        ) : countries.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <Search className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              No matching countries found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              No country matches "{searchVal}". Try checking your spelling or search query.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02]">
                    {[
                      "Country",
                      "Code",
                      "Phone Prefix",
                      "Supported",
                      "Status",
                      "",
                    ].map((heading, index) => (
                      <th
                        key={`country-col-${index}`}
                        className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {countries.map((country, index) => (
                    <tr
                      key={country.id || country.code || `country-row-${index}`}
                      className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {country.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 font-mono">
                          {country.code ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 font-mono">
                          {country.phonePrefix ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <SupportedIndicator supported={country.isSupported} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge active={country.isActive} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <CountryRowActions
                          country={country}
                          onEdit={openEditForm}
                          onDelete={openDeleteDialog}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.total > 0 && (
              <TablePagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                isLoading={isFetching}
              />
            )}
          </>
        )}
      </div>

      <CountryFormModal
        open={formOpen}
        mode={formMode}
        country={selectedCountry}
        onClose={closeForm}
      />

      <DeleteCountryDialog
        country={countryToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={closeDeleteDialog}
      />
    </div>
  );
}
