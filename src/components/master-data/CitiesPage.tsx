"use client";

import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  AlertCircle,
  Building2,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { CityFormModal } from "@/components/master-data/CityFormModal";
import { CityRowActions } from "@/components/master-data/CityRowActions";
import { DeleteCityDialog } from "@/components/master-data/DeleteCityDialog";
import { TablePagination } from "@/components/ui/TablePagination";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type { City } from "@/services/city.service";
import {
  useDeleteCityMutation,
  useGetCitiesQuery,
  useGetCountriesQuery,
} from "@/store/api/masterDataApi";

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;

export default function CitiesPage() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [cityToDelete, setCityToDelete] = useState<City | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: countriesData, isLoading: isCountriesLoading } =
    useGetCountriesQuery();

  const countryOptions = useMemo(
    () => countriesData ?? [],
    [countriesData],
  );

  const selectCountryOptions = useMemo(() => {
    return countryOptions.map((c) => ({
      value: c.code ?? c.id,
      label: c.name,
      subLabel: c.code ? `(${c.code})` : undefined,
    }));
  }, [countryOptions]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (selectedCountry || countryOptions.length === 0) return;
    const first = countryOptions[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCountry(first.code ?? first.id);
  }, [countryOptions, selectedCountry]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetCitiesQuery(
    selectedCountry
      ? {
          countryIdOrCode: selectedCountry,
          page,
          limit,
          search: searchQuery || undefined,
        }
      : skipToken,
  );

  const [deleteCity, { isLoading: isDeleting }] = useDeleteCityMutation();

  const cities = data?.items ?? [];
  const pagination = data?.pagination;
  const errorMessage = error ? getApiErrorMessage(error) : null;

  const selectedCountryLabel =
    countryOptions.find(
      (country) => (country.code ?? country.id) === selectedCountry,
    )?.name ?? selectedCountry;

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setPage(1);
    setSearchInput("");
    setSearchQuery("");
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const openCreateForm = () => {
    setFormMode("create");
    setSelectedCity(null);
    setFormOpen(true);
  };

  const openEditForm = (city: City) => {
    setFormMode("edit");
    setSelectedCity(city);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedCity(null);
  };

  const openDeleteDialog = (city: City) => {
    setDeleteError(null);
    setCityToDelete(city);
  };

  const closeDeleteDialog = () => {
    if (isDeleting) return;
    setCityToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!cityToDelete) return;

    setDeleteError(null);

    try {
      await deleteCity(cityToDelete.id).unwrap();
      setCityToDelete(null);

      if (cities.length === 1 && page > 1) {
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
              <Building2 className="size-5 text-[#E52629]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
                Cities
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Manage cities for each country.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={!selectedCountry || isFetching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            disabled={!selectedCountry}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E52629] to-[#B3191B] text-sm font-black text-white shadow-[0_4px_12px_rgba(229,38,41,0.2)] hover:from-[#C41E3A] hover:to-[#9B1517] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="size-4" />
            Add city
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-5 sm:p-6">
        <div className="space-y-2 max-w-md">
          <label
            htmlFor="city-country"
            className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Country
          </label>
          <CustomSelect
            id="city-country"
            value={selectedCountry}
            disabled={isCountriesLoading || countryOptions.length === 0}
            onChange={handleCountryChange}
            options={selectCountryOptions}
            placeholder="Select a country"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-sm font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3">
          <AlertCircle className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
        {selectedCountry && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Showing cities for{" "}
                <span className="text-gray-900 dark:text-white">
                  {selectedCountryLabel}
                </span>
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                id="city-search"
                type="text"
                value={searchInput}
                disabled={!selectedCountry}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search cities..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all disabled:opacity-60"
              />
            </div>
          </div>
        )}

        {!selectedCountry ? (
          <div className="py-20 px-6 text-center">
            <MapPin className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Select a country
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Choose a country to load its cities.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 text-[#E52629] animate-spin" />
          </div>
        ) : cities.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <Building2 className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              No cities found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {searchQuery
                ? `No cities match "${searchQuery}" in ${selectedCountryLabel}.`
                : `No cities available for ${selectedCountryLabel}.`}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-gradient-to-r from-[#E52629] to-[#B3191B] text-sm font-black text-white shadow-[0_4px_12px_rgba(229,38,41,0.2)] cursor-pointer"
              >
                <Plus className="size-4" />
                Add city
              </button>
            )}
          </div>
        ) : (
          <>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02]">
                    {["City", "State Code", ""].map((heading, index) => (
                      <th
                        key={`city-col-${index}`}
                        className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {cities.map((city, index) => (
                    <tr
                      key={city.id || `city-row-${index}`}
                      className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {city.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 font-mono">
                          {city.stateCode ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <CityRowActions
                          city={city}
                          onEdit={openEditForm}
                          onDelete={openDeleteDialog}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
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

      <CityFormModal
        open={formOpen}
        mode={formMode}
        city={selectedCity}
        defaultCountryIdOrCode={selectedCountry}
        countryOptions={countryOptions}
        onClose={closeForm}
      />

      <DeleteCityDialog
        city={cityToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={closeDeleteDialog}
      />
    </div>
  );
}
