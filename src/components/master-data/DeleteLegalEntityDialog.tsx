"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Building, Loader2, Trash2 } from "lucide-react";
import {
  ConfirmActionInput,
  useConfirmActionEnabled,
  useConfirmActionInput,
} from "@/components/ui/ConfirmActionInput";
import type { LegalEntity } from "@/services/legal-entity.service";

interface DeleteLegalEntityDialogProps {
  legalEntity: LegalEntity | null;
  isDeleting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteLegalEntityDialog({
  legalEntity,
  isDeleting,
  error,
  onConfirm,
  onClose,
}: DeleteLegalEntityDialogProps) {
  const open = legalEntity !== null;
  const { confirmInput, setConfirmInput } = useConfirmActionInput(open);
  const canConfirm = useConfirmActionEnabled("Delete", confirmInput, isDeleting);

  return (
    <AnimatePresence>
      {open && legalEntity && (
        <>
          <motion.div
            key="delete-legal-entity-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="delete-legal-entity-panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-legal-entity-title"
              className="pointer-events-auto w-full max-w-md bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-red-50 dark:bg-[#E52629]/10 flex items-center justify-center shrink-0">
                    <Trash2 className="size-5 text-[#E52629]" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="delete-legal-entity-title"
                      className="text-lg font-black text-gray-900 dark:text-white font-heading"
                    >
                      Delete legal entity
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
                      Are you sure you want to delete{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {legalEntity.name}
                      </span>{" "}
                      ({legalEntity.code})? This action cannot be undone.
                    </p>
                  </div>
                </div>

                <ConfirmActionInput
                  action="Delete"
                  value={confirmInput}
                  onChange={setConfirmInput}
                  disabled={isDeleting}
                  inputId="delete-legal-entity-confirm-input"
                />

                {error && (
                  <div className="flex items-center gap-2 mt-5 text-xs font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isDeleting}
                    className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!canConfirm}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white rounded-xl text-sm font-black shadow-[0_4px_12px_rgba(229,38,41,0.25)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isDeleting && <Loader2 className="size-4 animate-spin" />}
                    Delete legal entity
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface CreateLegalEntityConfirmDialogProps {
  pending: { name: string; code: string } | null;
  businessTypeName: string;
  countryName: string;
  isCreating: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function CreateLegalEntityConfirmDialog({
  pending,
  businessTypeName,
  countryName,
  isCreating,
  error,
  onConfirm,
  onClose,
}: CreateLegalEntityConfirmDialogProps) {
  const open = pending !== null;

  return (
    <AnimatePresence>
      {open && pending && (
        <>
          <motion.div
            key="create-legal-entity-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="create-legal-entity-panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="create-legal-entity-title"
              className="pointer-events-auto w-full max-w-md bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-[#E52629]/10 flex items-center justify-center shrink-0">
                    <Building className="size-5 text-[#E52629]" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="create-legal-entity-title"
                      className="text-lg font-black text-gray-900 dark:text-white font-heading"
                    >
                      Create legal entity
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
                      Are you sure you want to create{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {pending.name}
                      </span>{" "}
                      ({pending.code}) for{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {businessTypeName}
                      </span>{" "}
                      in{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {countryName}
                      </span>
                      ?
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 mt-5 text-xs font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isCreating}
                    className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isCreating}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white rounded-xl text-sm font-black shadow-[0_4px_12px_rgba(229,38,41,0.25)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isCreating && <Loader2 className="size-4 animate-spin" />}
                    Create legal entity
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
