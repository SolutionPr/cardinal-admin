"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Loader2, X } from "lucide-react";
import type { LegalEntityInput } from "@/services/legal-entity.service";

const EMPTY_FORM: Omit<LegalEntityInput, "supportedBusinessTypeId"> = {
  name: "",
  code: "",
};

interface LegalEntityFormModalProps {
  open: boolean;
  supportedBusinessTypeId: string;
  onClose: () => void;
  onSubmit: (values: LegalEntityInput) => void;
}

export function LegalEntityFormModal({
  open,
  supportedBusinessTypeId,
  onClose,
  onSubmit,
}: LegalEntityFormModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!open) return;
    setForm(EMPTY_FORM);
    setError("");
  }, [open]);

  const updateField = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Legal entity name is required.");
      return;
    }

    if (!form.code.trim()) {
      setError("Legal entity code is required.");
      return;
    }

    onSubmit({
      name: form.name.trim(),
      code: form.code.trim(),
      supportedBusinessTypeId,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="legal-entity-form-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="legal-entity-form-panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="legal-entity-form-title"
              className="pointer-events-auto w-full max-w-lg bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10">
                <h2
                  id="legal-entity-form-title"
                  className="text-lg font-black text-gray-900 dark:text-white font-heading"
                >
                  Add legal entity
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="size-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="legal-entity-name"
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Name
                  </label>
                  <input
                    id="legal-entity-name"
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Sole Proprietorship"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="legal-entity-code"
                    className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Code
                  </label>
                  <input
                    id="legal-entity-code"
                    type="text"
                    value={form.code}
                    onChange={(event) => updateField("code", event.target.value)}
                    placeholder="sole_proprietorship"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white rounded-xl text-sm font-black shadow-[0_4px_12px_rgba(229,38,41,0.25)] cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
