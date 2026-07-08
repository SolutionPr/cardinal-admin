"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import {
  clearMfaPending,
  getMfaPending,
  type MfaPendingSession,
} from "@/lib/mfa-pending";
import { useVerifyMfaMutation } from "@/store/api/authApi";

export default function MfaVerificationScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<MfaPendingSession | null>(null);

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme, mounted, toggleTheme } = useTheme();
  const router = useRouter();
  const [verifyMfa, { isLoading: isVerifying }] = useVerifyMfaMutation();

  const isDark = mounted && theme === "dark";

  useEffect(() => {
    const session = getMfaPending();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(session);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    if (!getMfaPending()) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pending?.tempToken) {
      setError("Your verification session expired. Please sign in again.");
      return;
    }

    if (code.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    try {
      await verifyMfa({
        code,
        tempToken: pending.tempToken,
        email: pending.email,
      }).unwrap();
      router.push("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleBackToLogin = () => {
    clearMfaPending();
    router.push("/login");
  };

  if (authLoading || isAuthenticated || !pending) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0909]">
        <div className="size-10 border-2 border-[#E52629] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-6 bg-[#FAFAFA] dark:bg-[#0A0909] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 size-96 bg-[#E52629]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-96 bg-[#E52629]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-gradient-to-r from-[#E52629]/5 via-transparent to-[#E52629]/5 blur-2xl" />
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-2.5 rounded-xl transition-colors z-10 cursor-pointer ${
          isDark
            ? "hover:bg-white/5 text-gray-400 hover:text-white"
            : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="size-5 text-amber-500" />
        ) : (
          <Moon className="size-5 text-indigo-600" />
        )}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <Image
              src="/icon.png"
              alt="Cardinal CRM"
              width={64}
              height={64}
              className="size-16 object-contain mb-4"
              priority
            />
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
              Cardinal CRM
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Admin Portal
            </p>
          </div>

          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#E52629]/10 mb-4">
              <ShieldCheck className="size-7 text-[#E52629]" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
              Two-factor verification
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Enter the 6-digit code from your authenticator app for{" "}
              <span className="text-gray-700 dark:text-gray-300 font-semibold">
                {pending.email}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <label
                htmlFor="mfa-code"
                className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Verification code
              </label>
              <input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="auth-input w-full px-4 py-3.5 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all tracking-[0.3em] text-center"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3"
              >
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isVerifying}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#E52629] to-[#B3191B] hover:from-[#C41E3A] hover:to-[#9B1517] text-white rounded-xl text-sm font-black shadow-[0_4px_12px_rgba(229,38,41,0.25)] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  Verify & continue
                  <ArrowRight className="size-4" />
                </>
              )}
            </motion.button>
          </form>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="mt-6 w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
          © {new Date().getFullYear()} Cardinal CRM
        </p>
      </motion.div>
    </div>
  );
}
