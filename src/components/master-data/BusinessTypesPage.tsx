"use client";

import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Link2,
  Loader2,
  RefreshCw,
  Unlink,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { BusinessType } from "@/services/business-type.service";
import {
  BusinessTypeActionDialog,
  type PendingBusinessTypeAction,
} from "@/components/master-data/BusinessTypeActionDialog";
import {
  useAttachBusinessTypeToCountryMutation,
  useDetachBusinessTypeFromCountryMutation,
  useGetBusinessTypesQuery,
  useGetCountriesQuery,
  useGetCountryBusinessTypesQuery,
} from "@/store/api/masterDataApi";

export default function BusinessTypesPage() {
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busyTypeId, setBusyTypeId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] =
    useState<PendingBusinessTypeAction | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const {
    data: businessTypes = [],
    isLoading,
    isFetching,
    error,
    refetch: refetchBusinessTypes,
  } = useGetBusinessTypesQuery();

  const { data: countries = [], isLoading: isCountriesLoading } =
    useGetCountriesQuery();

  const [attachBusinessType, { isLoading: isAttaching }] =
    useAttachBusinessTypeToCountryMutation();
  const [detachBusinessType, { isLoading: isDetaching }] =
    useDetachBusinessTypeFromCountryMutation();

  const countryOptions = useMemo(() => countries, [countries]);

  const selectedCountry = countryOptions.find(
    (country) => country.id === selectedCountryId,
  );
  const selectedCountryCode = selectedCountry?.code ?? selectedCountry?.id ?? "";

  const {
    data: attachedBusinessTypes = [],
    isLoading: isLoadingAttached,
    isFetching: isFetchingAttached,
    error: attachedError,
    refetch: refetchAttached,
  } = useGetCountryBusinessTypesQuery(
    selectedCountryCode ? selectedCountryCode : skipToken,
  );

  useEffect(() => {
    if (selectedCountryId || countryOptions.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCountryId(countryOptions[0].id);
  }, [countryOptions, selectedCountryId]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const attachedTypeIds = useMemo(
    () =>
      new Set(
        attachedBusinessTypes.map((type) => type.businessTypeId ?? type.supportedBusinessTypeId),
      ),
    [attachedBusinessTypes],
  );

  const errorMessage = error
    ? getApiErrorMessage(error)
    : attachedError
      ? getApiErrorMessage(attachedError)
      : null;
  const isActionBusy = isAttaching || isDetaching;
  const isRefreshing = isFetching || isFetchingAttached;

  const handleRefresh = () => {
    refetchBusinessTypes();
    if (selectedCountryCode) {
      refetchAttached();
    }
  };

  const handleAttach = async (businessType: BusinessType) => {
    if (!selectedCountryId) return;

    setDialogError(null);
    setSuccessMessage(null);
    setBusyTypeId(businessType.id);

    try {
      const result = await attachBusinessType({
        countryId: selectedCountryId,
        businessTypeId: businessType.id,
      }).unwrap();
      setPendingAction(null);
      setSuccessMessage(
        result.message ??
          `${businessType.name} attached to ${selectedCountry?.name ?? "country"}.`,
      );
    } catch (err) {
      setDialogError(getApiErrorMessage(err));
    } finally {
      setBusyTypeId(null);
    }
  };

  const handleDetach = async (businessType: BusinessType) => {
    if (!selectedCountryId) return;

    setDialogError(null);
    setSuccessMessage(null);
    setBusyTypeId(businessType.id);

    try {
      const result = await detachBusinessType({
        countryId: selectedCountryId,
        businessTypeId: businessType.id,
      }).unwrap();
      setPendingAction(null);
      setSuccessMessage(
        result.message ??
          `${businessType.name} detached from ${selectedCountry?.name ?? "country"}.`,
      );
    } catch (err) {
      setDialogError(getApiErrorMessage(err));
    } finally {
      setBusyTypeId(null);
    }
  };

  const openAttachDialog = (businessType: BusinessType) => {
    setDialogError(null);
    setPendingAction({ action: "attach", businessType });
  };

  const openDetachDialog = (businessType: BusinessType) => {
    setDialogError(null);
    setPendingAction({ action: "detach", businessType });
  };

  const closeActionDialog = () => {
    if (isActionBusy) return;
    setPendingAction(null);
    setDialogError(null);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    if (pendingAction.action === "attach") {
      handleAttach(pendingAction.businessType);
      return;
    }

    handleDetach(pendingAction.businessType);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-[#E52629]/10 flex items-center justify-center">
              <Briefcase className="size-5 text-[#E52629]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
                Business Types
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                View business types and manage country associations.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-5 sm:p-6">
        <div className="space-y-2 max-w-md">
          <label
            htmlFor="business-type-country"
            className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Country
          </label>
          <select
            id="business-type-country"
            value={selectedCountryId}
            disabled={isCountriesLoading || countryOptions.length === 0}
            onChange={(event) => setSelectedCountryId(event.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {countryOptions.length === 0 ? (
              <option value="">No countries available</option>
            ) : (
              countryOptions.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                  {country.code ? ` (${country.code})` : ""}
                </option>
              ))
            )}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Attach or detach business types for the selected country.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-sm font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3">
          <AlertCircle className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl px-4 py-3">
          <CheckCircle2 className="size-4 shrink-0" />
          {successMessage}
        </div>
      )}

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
        {isLoading || (selectedCountryCode && isLoadingAttached) ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 text-[#E52629] animate-spin" />
          </div>
        ) : businessTypes.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <Briefcase className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              No business types found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Business types will appear here once available.
            </p>
          </div>
        ) : (
          <>
            {selectedCountry && (
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {attachedBusinessTypes.length} of {businessTypes.length} business
                  types attached to{" "}
                  <span className="text-gray-900 dark:text-white">
                    {selectedCountry.name}
                  </span>
                </p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02]">
                    {["Business Type", "Description", "Status", ""].map(
                      (heading, index) => (
                        <th
                          key={`business-type-col-${index}`}
                          className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {businessTypes.map((businessType, index) => {
                    const isAttached = attachedTypeIds.has(businessType.id);
                    const isRowBusy =
                      isActionBusy && busyTypeId === businessType.id;

                    return (
                      <tr
                        key={businessType.id || `business-type-row-${index}`}
                        className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {businessType.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {businessType.description ?? "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                              isAttached
                                ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400",
                            )}
                          >
                            {isAttached ? "Attached" : "Not attached"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            {isAttached ? (
                              <button
                                type="button"
                                disabled={!selectedCountryId || isActionBusy}
                                onClick={() => openDetachDialog(businessType)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-[#E52629]/10 hover:bg-red-100 dark:hover:bg-[#E52629]/15 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {isRowBusy && isDetaching ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Unlink className="size-3.5" />
                                )}
                                Detach
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!selectedCountryId || isActionBusy}
                                onClick={() => openAttachDialog(businessType)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#E52629] bg-[#E52629]/10 hover:bg-[#E52629]/15 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {isRowBusy && isAttaching ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Link2 className="size-3.5" />
                                )}
                                Attach
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <BusinessTypeActionDialog
        pending={pendingAction}
        countryName={selectedCountry?.name ?? "country"}
        isLoading={isActionBusy}
        error={dialogError}
        onConfirm={handleConfirmAction}
        onClose={closeActionDialog}
      />
    </div>
  );
}
