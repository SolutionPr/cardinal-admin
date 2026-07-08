"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Loader2, Pencil } from "lucide-react";
import {
  ConfirmActionInput,
  useConfirmActionEnabled,
  useConfirmActionInput,
} from "@/components/ui/ConfirmActionInput";

interface UpdateRecordConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  isLoading: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function UpdateRecordConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isLoading,
  error,
  onConfirm,
  onClose,
}: UpdateRecordConfirmDialogProps) {
  const { confirmInput, setConfirmInput } = useConfirmActionInput(open);
  const canConfirm = useConfirmActionEnabled("Update", confirmInput, isLoading);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="update-record-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            key="update-record-panel"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="update-record-title"
              className="pointer-events-auto w-full max-w-md bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-[#E52629]/10 flex items-center justify-center shrink-0">
                    <Pencil className="size-5 text-[#E52629]" />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="update-record-title"
                      className="text-lg font-black text-gray-900 dark:text-white font-heading"
                    >
                      {title}
                    </h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">
                      {description}
                    </div>
                  </div>
                </div>

                <ConfirmActionInput
                  action="Update"
                  value={confirmInput}
                  onChange={setConfirmInput}
                  disabled={isLoading}
                  inputId="update-record-confirm-input"
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
                    disabled={isLoading}
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
                    {isLoading && <Loader2 className="size-4 animate-spin" />}
                    {confirmLabel}
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
