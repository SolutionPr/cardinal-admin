"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { UpdateRecordConfirmDialog } from "@/components/ui/UpdateRecordConfirmDialog";
import {
  countryToFormValues,
  toCountryPayload,
  type Country,
  type CountryInput,
} from "@/services/country.service";
import {
  useCreateCountryMutation,
  useUpdateCountryMutation,
} from "@/store/api/masterDataApi";

const EMPTY_FORM: CountryInput = {
  code: "",
  name: "",
  phonePrefix: "",
  isActive: true,
  isSupported: true,
};

interface CountryFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  country?: Country | null;
  onClose: () => void;
}

function ToggleField({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center justify-between gap-4 p-4 rounded-2xl border cursor-pointer transition-colors",
        checked
          ? "border-[#E52629]/20 bg-[#E52629]/5 dark:bg-[#E52629]/10"
          : "border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]",
        disabled && "opacity-60 cursor-not-allowed",
      )}
    >
      <span>
        <span className="block text-sm font-bold text-gray-900 dark:text-white">
          {label}
        </span>
        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
          {description}
        </span>
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only peer"
      />
      <span
        aria-hidden
        className={cn(
          "inline-flex items-center justify-center size-5 rounded-md border shrink-0 transition-colors",
          checked
            ? "bg-[#E52629] border-[#E52629] text-white"
            : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/15",
          disabled && "cursor-not-allowed",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </label>
  );
}

export function CountryFormModal({
  open,
  mode,
  country,
  onClose,
}: CountryFormModalProps) {
  const [form, setForm] = useState<CountryInput>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [editIdOrCode, setEditIdOrCode] = useState("");
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const [createCountry, { isLoading: isCreating }] = useCreateCountryMutation();
  const [updateCountry, { isLoading: isUpdating }] = useUpdateCountryMutation();

  const isBusy = isCreating || isUpdating;
  const isEdit = mode === "edit";

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!open) return;
    setError("");
    setUpdateError("");
    setShowUpdateConfirm(false);
    if (isEdit && country) {
      setForm(countryToFormValues(country));
      setEditIdOrCode(country.code ?? country.id);
    } else {
      setForm({ ...EMPTY_FORM });
      setEditIdOrCode("");
    }
  }, [open, isEdit, country]);

  const updateField = <K extends keyof CountryInput>(
    key: K,
    value: CountryInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.code.trim()) {
      setError("Country code is required.");
      return;
    }

    if (!form.name.trim()) {
      setError("Country name is required.");
      return;
    }

    if (!form.phonePrefix.trim()) {
      setError("Phone prefix is required.");
      return;
    }

    if (isEdit && country) {
      setShowUpdateConfirm(true);
      return;
    }

    const payload = toCountryPayload(form);

    try {
      await createCountry(payload).unwrap();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleConfirmUpdate = async () => {
    if (!country) return;

    setUpdateError("");
    const payload = toCountryPayload(form);

    try {
      await updateCountry({
        idOrCode: editIdOrCode,
        body: payload,
      }).unwrap();
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
              key="country-form-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="country-form-panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="country-form-title"
              className="pointer-events-auto w-full max-w-lg bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-white/10">
                <div>
                  <h2
                    id="country-form-title"
                    className="text-lg font-black text-gray-900 dark:text-white font-heading"
                  >
                    {isEdit ? "Edit country" : "Add country"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                    {isEdit
                      ? "Update the country configuration."
                      : "Create a new country configuration."}
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

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="country-code"
                      className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Code
                    </label>
                    <input
                      id="country-code"
                      type="text"
                      value={form.code}
                      disabled={isBusy}
                      onChange={(event) =>
                        updateField("code", event.target.value.toUpperCase())
                      }
                      placeholder="US"
                      maxLength={3}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all font-mono uppercase disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="country-phone-prefix"
                      className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Phone prefix
                    </label>
                    <input
                      id="country-phone-prefix"
                      type="text"
                      value={form.phonePrefix}
                      disabled={isBusy}
                      onChange={(event) =>
                        updateField("phonePrefix", event.target.value)
                      }
                      placeholder="+1"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all font-mono disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="country-name"
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Country name
                  </label>
                  <input
                    id="country-name"
                    type="text"
                    value={form.name}
                    disabled={isBusy}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="United States"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all disabled:opacity-60"
                  />
                </div>

                <div className="space-y-3">
                  <ToggleField
                    id="country-is-active"
                    label="Active"
                    description="Country is available for use in the platform."
                    checked={form.isActive}
                    disabled={isBusy}
                    onChange={(checked) => updateField("isActive", checked)}
                  />
                  <ToggleField
                    id="country-is-supported"
                    label="Supported"
                    description="Country is supported for customer operations."
                    checked={form.isSupported}
                    disabled={isBusy}
                    onChange={(checked) => updateField("isSupported", checked)}
                  />
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
                    {isEdit ? "Save changes" : "Create country"}
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
        title="Update country"
        description={
          <>
            Are you sure you want to update{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {country?.name ?? form.name}
            </span>
            ?
          </>
        }
        confirmLabel="Update country"
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
