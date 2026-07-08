"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Sun,
  Moon,
  Check,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getMfaPending } from "@/lib/mfa-pending";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login, isAuthenticated, isLoading: authLoading, isLoggingIn, loginError, clearLoginError } = useAuth();
  const { theme, mounted, toggleTheme } = useTheme();
  const router = useRouter();
  const isDark = mounted && theme === "dark";

  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    if (getMfaPending()) {
      router.replace("/login/mfa");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    clearLoginError();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    const result = await login(email.trim(), password);

    if (result.ok && result.mfaRequired) {
      router.push("/login/mfa");
    } else if (result.ok) {
      router.push("/dashboard");
    } else {
      setError(result.error ?? "Invalid email or password. Please try again.");
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0909]">
        <div className="size-10 border-2 border-[#E52629] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-6 bg-[#FAFAFA] dark:bg-[#0A0909] overflow-hidden">
      {/* Background accents — same palette as dashboard */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 size-96 bg-[#E52629]/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-96 bg-[#E52629]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-gradient-to-r from-[#E52629]/5 via-transparent to-[#E52629]/5 blur-2xl" />
      </div>

      {/* Theme toggle */}
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

      {/* Centered login card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-8 sm:p-10">
          {/* Brand */}
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
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
              Sign in
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="auth-input w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="auth-input w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <label
              htmlFor="rememberMe"
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <span
                aria-hidden
                className={cn(
                  "inline-flex items-center justify-center size-4 shrink-0 rounded border transition-colors",
                  rememberMe
                    ? "bg-[#E52629] border-[#E52629] text-white"
                    : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/15",
                )}
              >
                {rememberMe && <Check className="size-2.5" strokeWidth={3} />}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Remember me on this device
              </span>
            </label>

            {(error || loginError) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3"
              >
                <AlertCircle className="size-4 shrink-0" />
                {error || loginError}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoggingIn}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#E52629] to-[#B3191B] hover:from-[#C41E3A] hover:to-[#9B1517] text-white rounded-xl text-sm font-black shadow-[0_4px_12px_rgba(229,38,41,0.25)] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
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
                  Sign in
                  <ArrowRight className="size-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-gray-400 font-bold mt-8">
            Need access?{" "}
            <span className="text-[#E52629]">Contact your administrator</span>
          </p>
        </div>

        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
          © {new Date().getFullYear()} Cardinal CRM
        </p>
      </motion.div>
    </div>
  );
}
