"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { UpdateRecordConfirmDialog } from "@/components/ui/UpdateRecordConfirmDialog";
import {
  cityToFormValues,
  toCityPayload,
  type City,
  type CityInput,
} from "@/services/city.service";
import {
  useCreateCityMutation,
  useUpdateCityMutation,
} from "@/store/api/masterDataApi";

const EMPTY_FORM: CityInput = {
  name: "",
  stateCode: "",
  latitude: "",
  longitude: "",
  countryIdOrCode: "",
};

interface CountryOption {
  id: string;
  name: string;
  code?: string;
}

interface CityFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  city?: City | null;
  defaultCountryIdOrCode: string;
  countryOptions: CountryOption[];
  onClose: () => void;
}

export function CityFormModal({
  open,
  mode,
  city,
  defaultCountryIdOrCode,
  countryOptions,
  onClose,
}: CityFormModalProps) {
  const [form, setForm] = useState<CityInput>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState("");
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [createCity, { isLoading: isCreating }] = useCreateCityMutation();
  const [updateCity, { isLoading: isUpdating }] = useUpdateCityMutation();

  const isBusy = isCreating || isUpdating;
  const isEdit = mode === "edit";

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!open) return;
    setError("");
    setUpdateError("");
    setShowUpdateConfirm(false);
    if (isEdit && city) {
      setForm(cityToFormValues(city, defaultCountryIdOrCode));
      setEditId(city.id);
    } else {
      setForm({
        ...EMPTY_FORM,
        countryIdOrCode: defaultCountryIdOrCode,
      });
      setEditId("");
    }
  }, [open, isEdit, city, defaultCountryIdOrCode]);

  const updateField = <K extends keyof CityInput>(
    key: K,
    value: CityInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("City name is required.");
      return;
    }

    if (!form.stateCode.trim()) {
      setError("State code is required.");
      return;
    }

    if (!form.latitude.trim()) {
      setError("Latitude is required.");
      return;
    }

    if (!form.longitude.trim()) {
      setError("Longitude is required.");
      return;
    }

    if (!form.countryIdOrCode.trim()) {
      setError("Country is required.");
      return;
    }

    if (isEdit && city) {
      setShowUpdateConfirm(true);
      return;
    }

    const payload = toCityPayload(form);

    try {
      await createCity(payload).unwrap();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleConfirmUpdate = async () => {
    if (!city) return;

    setUpdateError("");
    const payload = toCityPayload(form);

    try {
      await updateCity({ id: editId, body: payload }).unwrap();
      setShowUpdateConfirm(false);
      onClose();
    } catch (err) {
      setUpdateError(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="city-form-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="city-form-panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="city-form-title"
              className="pointer-events-auto w-full max-w-lg bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-white/10">
                <div>
                  <h2
                    id="city-form-title"
                    className="text-lg font-black text-gray-900 dark:text-white font-heading"
                  >
                    {isEdit ? "Edit city" : "Add city"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    {isEdit
                      ? "Update the city details."
                      : "Create a new city for the selected country."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isBusy}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="city-country-select"
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Country
                  </label>
                  <select
                    id="city-country-select"
                    value={form.countryIdOrCode}
                    disabled={isBusy}
                    onChange={(event) =>
                      updateField("countryIdOrCode", event.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {countryOptions.map((country) => {
                      const value = country.code ?? country.id;
                      return (
                        <option key={country.id} value={value}>
                          {country.name}
                          {country.code ? ` (${country.code})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="city-name"
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    City name
                  </label>
                  <input
                    id="city-name"
                    type="text"
                    value={form.name}
                    disabled={isBusy}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="New York"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="city-state-code"
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    State code
                  </label>
                  <input
                    id="city-state-code"
                    type="text"
                    value={form.stateCode}
                    disabled={isBusy}
                    onChange={(event) =>
                      updateField("stateCode", event.target.value.toUpperCase())
                    }
                    placeholder="NY"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all font-mono uppercase disabled:opacity-60"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="city-latitude"
                      className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Latitude
                    </label>
                    <input
                      id="city-latitude"
                      type="text"
                      inputMode="decimal"
                      value={form.latitude}
                      disabled={isBusy}
                      onChange={(event) =>
                        updateField("latitude", event.target.value)
                      }
                      placeholder="40.7128"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all font-mono disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="city-longitude"
                      className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Longitude
                    </label>
                    <input
                      id="city-longitude"
                      type="text"
                      inputMode="decimal"
                      value={form.longitude}
                      disabled={isBusy}
                      onChange={(event) =>
                        updateField("longitude", event.target.value)
                      }
                      placeholder="-74.0060"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all font-mono disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isBusy}
                    className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white rounded-xl text-sm font-black shadow-[0_4px_12px_rgba(229,38,41,0.25)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isBusy && <Loader2 className="size-4 animate-spin" />}
                    {isEdit ? "Save changes" : "Create city"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
      <UpdateRecordConfirmDialog
        open={showUpdateConfirm}
        title="Update city"
        description={
          <>
            Are you sure you want to update{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {city?.name ?? form.name}
            </span>
            ?
          </>
        }
        confirmLabel="Update city"
        isLoading={isUpdating}
        error={updateError}
        onConfirm={handleConfirmUpdate}
        onClose={() => {
          if (isUpdating) return;
          setShowUpdateConfirm(false);
          setUpdateError("");
        }}
      />
    </>
  );
}
