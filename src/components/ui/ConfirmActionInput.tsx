"use client";

import { useEffect, useState } from "react";

export type ConfirmActionType = "Delete" | "Update";

export function isConfirmActionValid(
  action: ConfirmActionType,
  value: string,
): boolean {
  return value.trim() === action;
}

interface ConfirmActionInputProps {
  action: ConfirmActionType;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputId?: string;
}

export function ConfirmActionInput({
  action,
  value,
  onChange,
  disabled,
  inputId = "confirm-action-input",
}: ConfirmActionInputProps) {
  return (
    <div className="mt-5 space-y-2">
      <label
        htmlFor={inputId}
        className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
      >
        Type{" "}
        <span className="text-gray-900 dark:text-white normal-case">{action}</span>{" "}
        to confirm
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={action}
        autoComplete="off"
        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all disabled:opacity-60"
      />
    </div>
  );
}

export function useConfirmActionInput(open: boolean) {
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfirmInput("");
    }
  }, [open]);

  return {
    confirmInput,
    setConfirmInput,
    resetConfirmInput: () => setConfirmInput(""),
  };
}

export function useConfirmActionEnabled(
  action: ConfirmActionType,
  confirmInput: string,
  isLoading: boolean,
): boolean {
  return isConfirmActionValid(action, confirmInput) && !isLoading;
}
