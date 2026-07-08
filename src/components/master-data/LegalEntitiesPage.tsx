"use client";

import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import {
  CreateLegalEntityConfirmDialog,
  DeleteLegalEntityDialog,
} from "@/components/master-data/DeleteLegalEntityDialog";
import { LegalEntityFormModal } from "@/components/master-data/LegalEntityFormModal";
import type { LegalEntity, LegalEntityInput } from "@/services/legal-entity.service";
import {
  useCreateLegalEntityMutation,
  useDeleteLegalEntityMutation,
  useGetCountriesQuery,
  useGetCountryBusinessTypesQuery,
  useGetLegalEntitiesQuery,
} from "@/store/api/masterDataApi";

export default function LegalEntitiesPage() {
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedSupportedBusinessTypeId, setSelectedSupportedBusinessTypeId] =
    useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingCreate, setPendingCreate] = useState<LegalEntityInput | null>(
    null,
  );
  const [createDialogError, setCreateDialogError] = useState<string | null>(
    null,
  );
  const [entityToDelete, setEntityToDelete] = useState<LegalEntity | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: countries = [], isLoading: isCountriesLoading } =
    useGetCountriesQuery();

  const countryOptions = useMemo(() => countries, [countries]);

  const selectedCountry = countryOptions.find(
    (country) => country.id === selectedCountryId,
  );
  const selectedCountryCode = selectedCountry?.code ?? selectedCountry?.id ?? "";

  const {
    data: supportedBusinessTypes = [],
    isLoading: isLoadingSupportedTypes,
    isFetching: isFetchingSupportedTypes,
    error: supportedTypesError,
    refetch: refetchSupportedTypes,
  } = useGetCountryBusinessTypesQuery(
    selectedCountryCode ? selectedCountryCode : skipToken,
  );

  const selectedSupportedType = supportedBusinessTypes.find(
    (type) => type.supportedBusinessTypeId === selectedSupportedBusinessTypeId,
  );

  const {
    data: legalEntities = [],
    isLoading: isLoadingEntities,
    isFetching: isFetchingEntities,
    error: entitiesError,
    refetch: refetchEntities,
  } = useGetLegalEntitiesQuery(
    selectedSupportedBusinessTypeId
      ? selectedSupportedBusinessTypeId
      : skipToken,
  );

  const [createLegalEntity, { isLoading: isCreating }] =
    useCreateLegalEntityMutation();
  const [deleteLegalEntity, { isLoading: isDeleting }] =
    useDeleteLegalEntityMutation();

  useEffect(() => {
    if (selectedCountryId || countryOptions.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCountryId(countryOptions[0].id);
  }, [countryOptions, selectedCountryId]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (supportedBusinessTypes.length === 0) {
      setSelectedSupportedBusinessTypeId("");
      return;
    }

    const stillValid = supportedBusinessTypes.some(
      (type) => type.supportedBusinessTypeId === selectedSupportedBusinessTypeId,
    );

    if (!stillValid) {
      setSelectedSupportedBusinessTypeId(
        supportedBusinessTypes[0].supportedBusinessTypeId,
      );
    }
  }, [supportedBusinessTypes, selectedSupportedBusinessTypeId]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const errorMessage = supportedTypesError
    ? getApiErrorMessage(supportedTypesError)
    : entitiesError
      ? getApiErrorMessage(entitiesError)
      : null;
  const isRefreshing = isFetchingSupportedTypes || isFetchingEntities;
  const isTableLoading =
    isLoadingSupportedTypes ||
    (selectedSupportedBusinessTypeId && isLoadingEntities);

  const handleRefresh = () => {
    if (selectedCountryCode) {
      refetchSupportedTypes();
    }
    if (selectedSupportedBusinessTypeId) {
      refetchEntities();
    }
  };

  const handleFormSubmit = (values: LegalEntityInput) => {
    setCreateDialogError(null);
    setPendingCreate(values);
    setFormOpen(false);
  };

  const closeCreateConfirm = () => {
    if (isCreating) return;
    setPendingCreate(null);
    setCreateDialogError(null);
  };

  const handleConfirmCreate = async () => {
    if (!pendingCreate) return;

    setCreateDialogError(null);

    try {
      const created = await createLegalEntity(pendingCreate).unwrap();
      setPendingCreate(null);
      setSuccessMessage(
        `${created.name} created for ${selectedSupportedType?.name ?? "business type"}.`,
      );
    } catch (err) {
      setCreateDialogError(getApiErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!entityToDelete) return;

    setDeleteError(null);

    try {
      const result = await deleteLegalEntity(entityToDelete.id).unwrap();
      setEntityToDelete(null);
      setSuccessMessage(
        result.message ?? `${entityToDelete.name} deleted successfully.`,
      );
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
              <Building className="size-5 text-[#E52629]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
                Legal Entities
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Manage legal entities for supported country-business types.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={cn("size-4", isRefreshing && "animate-spin")}
            />
            Refresh
          </button>

          <button
            type="button"
            disabled={!selectedSupportedBusinessTypeId}
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white text-sm font-black shadow-[0_4px_12px_rgba(229,38,41,0.25)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="size-4" />
            Add legal entity
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label
              htmlFor="legal-entity-country"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Country
            </label>
            <select
              id="legal-entity-country"
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
          </div>

          <div className="space-y-2">
            <label
              htmlFor="legal-entity-business-type"
              className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Business type
            </label>
            <select
              id="legal-entity-business-type"
              value={selectedSupportedBusinessTypeId}
              disabled={
                !selectedCountryCode ||
                isLoadingSupportedTypes ||
                supportedBusinessTypes.length === 0
              }
              onChange={(event) =>
                setSelectedSupportedBusinessTypeId(event.target.value)
              }
              className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {supportedBusinessTypes.length === 0 ? (
                <option value="">
                  {selectedCountryCode
                    ? "No business types attached to this country"
                    : "Select a country first"}
                </option>
              ) : (
                supportedBusinessTypes.map((type) => (
                  <option
                    key={type.supportedBusinessTypeId}
                    value={type.supportedBusinessTypeId}
                  >
                    {type.name}
                  </option>
                ))
              )}
            </select>
          </div>
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
        {isTableLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-8 text-[#E52629] animate-spin" />
          </div>
        ) : !selectedSupportedBusinessTypeId ? (
          <div className="py-20 px-6 text-center">
            <Building className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Select a country and business type
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Legal entities are scoped to supported country-business types.
            </p>
          </div>
        ) : legalEntities.length === 0 ? (
          <div className="py-20 px-6 text-center">
            <Building className="size-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              No legal entities found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Add a legal entity for {selectedSupportedType?.name ?? "this business type"}.
            </p>
          </div>
        ) : (
          <>
            {selectedSupportedType && selectedCountry && (
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {legalEntities.length} legal entit
                  {legalEntities.length === 1 ? "y" : "ies"} for{" "}
                  <span className="text-gray-900 dark:text-white">
                    {selectedSupportedType.name}
                  </span>{" "}
                  in{" "}
                  <span className="text-gray-900 dark:text-white">
                    {selectedCountry.name}
                  </span>
                </p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02]">
                    {["Name", "Code", ""].map((heading, index) => (
                      <th
                        key={`legal-entity-col-${index}`}
                        className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {legalEntities.map((entity, index) => (
                    <tr
                      key={entity.id || entity.code || `legal-entity-row-${index}`}
                      className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {entity.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {entity.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setEntityToDelete(entity);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-[#E52629]/10 hover:bg-red-100 dark:hover:bg-[#E52629]/15 transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <LegalEntityFormModal
        open={formOpen}
        supportedBusinessTypeId={selectedSupportedBusinessTypeId}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <CreateLegalEntityConfirmDialog
        pending={
          pendingCreate
            ? { name: pendingCreate.name, code: pendingCreate.code }
            : null
        }
        businessTypeName={selectedSupportedType?.name ?? "business type"}
        countryName={selectedCountry?.name ?? "country"}
        isCreating={isCreating}
        error={createDialogError}
        onConfirm={handleConfirmCreate}
        onClose={closeCreateConfirm}
      />

      <DeleteLegalEntityDialog
        legalEntity={entityToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (isDeleting) return;
          setEntityToDelete(null);
          setDeleteError(null);
        }}
      />
    </div>
  );
}
