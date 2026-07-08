"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  ShieldOff,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { MfaSetupResult } from "@/services/auth.service";
import {
  useDisableMfaConfirmMutation,
  useDisableMfaInitMutation,
  useEnableMfaMutation,
  useSetupMfaMutation,
} from "@/store/api/authApi";

function qrCodeSrc(qrCode?: string): string | null {
  if (!qrCode) return null;
  if (qrCode.startsWith("data:")) return qrCode;
  return `data:image/png;base64,${qrCode}`;
}

function ProfileField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-gray-400 shrink-0" />
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatSecretKey(key: string): string[] {
  const clean = key.replace(/\s/g, "").toUpperCase();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    chunks.push(clean.slice(i, i + 4));
  }
  return chunks;
}

function StepHeader({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="inline-flex items-center justify-center size-7 rounded-lg bg-[#E52629]/10 text-[#E52629] text-xs font-black shrink-0">
        {step}
      </span>
      <div>
        <h3 className="text-sm font-black text-gray-900 dark:text-white font-heading">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function OtpPinInput({
  value,
  onChange,
  disabled,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id: string;
}) {
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  const updateAtIndex = (index: number, nextChar: string) => {
    const chars = value.padEnd(6, " ").split("");
    chars[index] = nextChar;
    onChange(chars.join("").replace(/\s/g, "").slice(0, 6));
  };

  const handleChange = (index: number, input: string) => {
    const numeric = input.replace(/\D/g, "");
    if (!numeric) {
      updateAtIndex(index, "");
      return;
    }

    if (numeric.length > 1) {
      const merged = `${value.slice(0, index)}${numeric}`.slice(0, 6);
      onChange(merged);
      const nextIndex = Math.min(index + numeric.length, 5);
      document.getElementById(`${id}-${nextIndex}`)?.focus();
      return;
    }

    updateAtIndex(index, numeric);
    if (index < 5) {
      document.getElementById(`${id}-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      document.getElementById(`${id}-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={`${id}-${index}`}
          id={`${id}-${index}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className={cn(
            "size-11 sm:size-12 text-center text-lg font-black rounded-xl border outline-none transition-all",
            "bg-gray-50 dark:bg-[#151515] border-gray-200 dark:border-white/10",
            "text-gray-900 dark:text-white",
            "focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        />
      ))}
    </div>
  );
}

function MfaSection() {
  const { profile, refetchProfile } = useAuth();
  const [setupMfa, { isLoading: isSettingUp }] = useSetupMfaMutation();
  const [enableMfa, { isLoading: isEnabling }] = useEnableMfaMutation();
  const [disableMfaInit, { isLoading: isDisableInitiating }] =
    useDisableMfaInitMutation();
  const [disableMfaConfirm, { isLoading: isDisableConfirming }] =
    useDisableMfaConfirmMutation();

  const [setupData, setSetupData] = useState<MfaSetupResult | null>(null);
  const [enableCode, setEnableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disableMfaTicket, setDisableMfaTicket] = useState<string | null>(null);
  const [showDisableFlow, setShowDisableFlow] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSetupKey, setShowSetupKey] = useState(false);

  const mfaEnabled = profile?.mfaEnabled === true;
  const isBusy =
    isSettingUp ||
    isEnabling ||
    isDisableInitiating ||
    isDisableConfirming;
  const qrSrc = qrCodeSrc(setupData?.qrCode);

  const handleStartSetup = async () => {
    setError("");
    setSuccess("");
    setSetupData(null);
    setEnableCode("");
    setShowSetupKey(false);

    try {
      const data = await setupMfa().unwrap();
      setSetupData(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleEnable = async () => {
    if (enableCode.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const result = await enableMfa({ code: enableCode }).unwrap();
      setSuccess(result.message);
      setSetupData(null);
      setEnableCode("");
      refetchProfile();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDisablePassword = async () => {
    if (!disablePassword.trim()) {
      setError("Enter your current password to continue.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const result = await disableMfaInit({
        password: disablePassword,
      }).unwrap();
      setDisableMfaTicket(result.mfaTicket);
      setDisablePassword("");
      if (result.message) {
        setSuccess(result.message);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleDisableConfirm = async () => {
    if (!disableMfaTicket) {
      setError("Your disable session expired. Please start again.");
      return;
    }

    if (disableCode.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const result = await disableMfaConfirm({
        mfaTicket: disableMfaTicket,
        code: disableCode,
      }).unwrap();
      setSuccess(result.message);
      resetDisableFlow();
      refetchProfile();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const resetDisableFlow = () => {
    setShowDisableFlow(false);
    setDisablePassword("");
    setDisableCode("");
    setDisableMfaTicket(null);
  };

  const cancelDisableFlow = () => {
    resetDisableFlow();
    setError("");
    setSuccess("");
  };

  const handleCopySecret = async () => {
    if (!setupData?.manualEntryKey) return;
    await navigator.clipboard.writeText(setupData.manualEntryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cancelSetup = () => {
    setSetupData(null);
    setEnableCode("");
    setShowSetupKey(false);
    setError("");
  };

  return (
    <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-[#E52629]/10 flex items-center justify-center shrink-0">
              <Shield className="size-6 text-[#E52629]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white font-heading">
                Two-factor authentication
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Add an extra layer of security with an authenticator app.
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0",
              mfaEnabled
                ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400",
            )}
          >
            {mfaEnabled ? (
              <>
                <ShieldCheck className="size-3.5" />
                Enabled
              </>
            ) : (
              <>
                <ShieldOff className="size-3.5" />
                Disabled
              </>
            )}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl px-4 py-3">
            <CheckCircle2 className="size-4 shrink-0" />
            {success}
          </div>
        )}

        {!mfaEnabled && !setupData && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Protect your admin account by requiring a verification code from
              Google Authenticator, Authy, or a similar app when signing in.
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isBusy}
              onClick={handleStartSetup}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#E52629] to-[#B3191B] hover:from-[#C41E3A] hover:to-[#9B1517] text-white rounded-xl text-sm font-black shadow-[0_4px_12px_rgba(229,38,41,0.25)] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSettingUp ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              Enable two-factor authentication
            </motion.button>
          </div>
        )}

        {!mfaEnabled && setupData && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
              <div className="px-5 sm:px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02]">
                <StepHeader
                  step={1}
                  title="Link your authenticator app"
                  description="Scan the QR code with Google Authenticator, Authy, or a similar app."
                />
              </div>

              <div className="px-5 sm:px-6 py-6 sm:py-8 space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-white dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm">
                    {qrSrc ? (
                      <Image
                        src={qrSrc}
                        alt="MFA QR code"
                        width={200}
                        height={200}
                        unoptimized
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="size-[200px] flex flex-col items-center justify-center text-center px-4">
                        <Shield className="size-10 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                          QR code unavailable. Use the setup key instead.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowSetupKey((prev) => !prev)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#E52629] dark:hover:text-[#E52629] transition-colors cursor-pointer"
                  >
                    {showSetupKey ? (
                      <>
                        <EyeOff className="size-3.5" />
                        Hide setup key
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" />
                        Can&apos;t scan? Show setup key
                      </>
                    )}
                  </button>
                </div>

                {showSetupKey && (
                  <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-[#151515] px-4 sm:px-5 py-5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-4">
                      Setup key
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
                      {formatSecretKey(
                        setupData.manualEntryKey ?? setupData.secret,
                      ).map((chunk, index) => (
                        <span
                          key={`${chunk}-${index}`}
                          className="font-mono text-sm sm:text-base font-bold tracking-wider text-gray-900 dark:text-white"
                        >
                          {chunk}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex justify-center">
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#E52629] bg-[#E52629]/10 hover:bg-[#E52629]/15 transition-colors cursor-pointer"
                      >
                        <Copy className="size-3.5" />
                        {copied ? "Copied to clipboard" : "Copy setup key"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
              <div className="px-5 sm:px-6 py-5 border-b border-gray-100 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02]">
                <StepHeader
                  step={2}
                  title="Verify your setup"
                  description="Enter the 6-digit code generated by your authenticator app to finish enabling MFA."
                />
              </div>

              <div className="px-5 sm:px-6 py-6 sm:py-8 space-y-6">
                <OtpPinInput
                  id="enable-mfa-code"
                  value={enableCode}
                  onChange={setEnableCode}
                  disabled={isBusy}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={cancelSetup}
                    className="sm:mr-auto px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isBusy || enableCode.length !== 6}
                    onClick={handleEnable}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white rounded-xl text-sm font-black shadow-[0_4px_12px_rgba(229,38,41,0.25)] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isEnabling ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    Confirm & enable
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mfaEnabled && !showDisableFlow && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Two-factor authentication is active on your account.
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isBusy}
              onClick={() => {
                setError("");
                setSuccess("");
                setShowDisableFlow(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#151515] border border-red-200 dark:border-[#E52629]/30 text-[#E52629] rounded-xl text-sm font-black hover:bg-red-50 dark:hover:bg-[#E52629]/10 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <ShieldOff className="size-4" />
              Disable two-factor authentication
            </motion.button>
          </div>
        )}

        {mfaEnabled && showDisableFlow && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              {disableMfaTicket
                ? "Enter the 6-digit code from your authenticator app to confirm disabling MFA."
                : "Confirm your password to start disabling two-factor authentication."}
            </p>

            {!disableMfaTicket ? (
              <div className="space-y-3 max-w-sm">
                <label
                  htmlFor="disable-mfa-password"
                  className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Current password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <input
                    id="disable-mfa-password"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    disabled={isBusy}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#151515] border border-gray-100 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#E52629] focus:ring-2 focus:ring-[#E52629]/20 transition-all"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <label
                  htmlFor="disable-mfa-code-0"
                  className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Authenticator code
                </label>
                <OtpPinInput
                  id="disable-mfa-code"
                  value={disableCode}
                  onChange={setDisableCode}
                  disabled={isBusy}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {!disableMfaTicket ? (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isBusy}
                  onClick={handleDisablePassword}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white rounded-xl text-sm font-black cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDisableInitiating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldOff className="size-4" />
                  )}
                  Continue
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isBusy}
                  onClick={handleDisableConfirm}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#E52629] to-[#B3191B] text-white rounded-xl text-sm font-black cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDisableConfirming ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldOff className="size-4" />
                  )}
                  Confirm disable
                </motion.button>
              )}
              <button
                type="button"
                disabled={isBusy}
                onClick={cancelDisableFlow}
                className="px-5 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile, initials, isProfileLoading, profileError } = useAuth();

  if (isProfileLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="size-10 border-2 border-[#E52629] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight font-heading">
          Profile
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
          Manage your account details and security settings.
        </p>
      </div>

      {profileError && (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E52629] bg-red-50 dark:bg-[#E52629]/10 border border-red-100 dark:border-[#E52629]/20 rounded-xl px-4 py-3">
          <AlertCircle className="size-4 shrink-0" />
          {profileError}
        </div>
      )}

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-gray-100 dark:border-white/10">
          <div className="size-20 bg-gradient-to-br from-[#E52629] to-[#C41E3A] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#E52629]/20 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-gray-900 dark:text-white font-heading truncate">
              {profile?.name ?? user?.name ?? "Admin User"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 truncate">
              {profile?.role ?? "Administrator"}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
          <ProfileField
            label="Full name"
            value={profile?.name ?? user?.name ?? "—"}
            icon={User}
          />
          <ProfileField
            label="Email"
            value={profile?.email ?? user?.email ?? "—"}
            icon={Mail}
          />
          <ProfileField
            label="Phone"
            value={profile?.phone ?? "Not provided"}
            icon={Phone}
          />
          <ProfileField
            label="Role"
            value={profile?.role ?? "Administrator"}
            icon={Shield}
          />
        </div>
      </div>

      <MfaSection />
    </div>
  );
}
