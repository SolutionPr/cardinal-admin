"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Loader2,
  AlertCircle,
  Phone,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Circle,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useGetPersonalApplicationQuery, useGetPersonalOnboardingHistoryQuery, useGetKycDetailsQuery, useUpdatePersonalApplicationStatusMutation } from "@/store/api/applicationsApi";
import { getApiErrorMessage } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PersonalDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Fetch details for the personal application
  const { data: detailedApp, isLoading, error } = useGetPersonalApplicationQuery(id);
  const { data: onboardingHistory, isLoading: isHistoryLoading } = useGetPersonalOnboardingHistoryQuery(id);
  const { data: kycDetails, isLoading: isKycLoading } = useGetKycDetailsQuery(id);
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdatePersonalApplicationStatusMutation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<"PENDING" | "INREVIEW" | "APPROVED" | "REJECTED" | null>(null);

  const handleUpdateStatus = async (status: "PENDING" | "INREVIEW" | "APPROVED" | "REJECTED") => {
    try {
      await updateStatus({ id, status }).unwrap();
    } catch (err) {
      alert("Failed to update status: " + getApiErrorMessage(err));
    }
  };

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "VERIFIED":
      case "APPROVED":
        return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200/50 dark:border-green-500/20";
      case "INPROGRESS":
      case "PENDING":
      case "NOT_STARTED":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20";
      case "FAILED":
      case "REJECTED":
        return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20";
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20";
    }
  };

  const getKycIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "VERIFIED":
      case "APPROVED":
        return <ShieldCheck className="size-5 text-green-600 dark:text-green-400" />;
      case "FAILED":
      case "REJECTED":
        return <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />;
      default:
        return <ShieldQuestion className="size-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const formatKycStatus = (status: string) => {
    if (!status) return "N/A";
    if (status === "INPROGRESS") return "In Progress";
    return status
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const formatOccupation = (occupation: string) => {
    if (!occupation) return "N/A";
    return occupation
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const getCompletionPercentage = (app: typeof detailedApp) => {
    if (!app) return 0;
    if (app?.completionPercentage !== undefined && app?.completionPercentage !== null) {
      return app.completionPercentage;
    }
    const step = app?.currentStep || 0;
    if (step === 0) return 0;
    if (step >= 4) {
      const kyc = app?.kycStatus?.toUpperCase();
      if (kyc === "VERIFIED" || kyc === "APPROVED" || kyc === "SUCCESSFUL") {
        return 100;
      }
      return 90;
    }
    return Math.min(Math.round((step / 4) * 100), 100);
  };

  if (isLoading) {
    return (
      <div className="py-32 text-center space-y-4">
        <Loader2 className="size-10 animate-spin text-[#E52629] mx-auto" />
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
          Loading Application Details...
        </p>
      </div>
    );
  }

  if (error || !detailedApp) {
    return (
      <div className="py-24 px-6 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="size-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-gray-900 dark:text-white">
          Failed to load personal application
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {getApiErrorMessage(error)}
        </p>
        <button
          onClick={() => router.push("/dashboard/applications/personal")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Applications</span>
        </button>
      </div>
    );
  }

  const completionPercent = getCompletionPercentage(detailedApp);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/dashboard/applications/personal")}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#E52629] transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Personal Applications</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
          <Clock className="size-3.5" />
          <span>
            Last Updated:{" "}
            {detailedApp.updatedAt ? new Date(detailedApp.updatedAt).toLocaleDateString() : "N/A"}
          </span>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="relative bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-[#E52629]/10 flex items-center justify-center shrink-0">
            <User className="size-8 text-[#E52629]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">
                {detailedApp.firstname} {detailedApp.lastname}
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1">
              ID: {detailedApp.id}
            </p>
          </div>
        </div>

        {/* Custom Status Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status:</span>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isUpdatingStatus}
              className={cn(
                "text-[11px] px-6 py-2 rounded-full font-black uppercase tracking-widest border cursor-pointer outline-none transition-all flex items-center gap-2",
                detailedApp.status === "APPROVED"
                  ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-200/50 dark:border-green-500/20"
                  : detailedApp.status === "REJECTED"
                  ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200/50 dark:border-red-500/20"
                  : detailedApp.status === "INREVIEW"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-500/20"
              )}
            >
              <span>{detailedApp.status || "PENDING"}</span>
              <ChevronDown className="size-3 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-[#181818] border border-gray-100 dark:border-white/10 shadow-xl py-1.5 z-[99] animate-fade-in space-y-1">
                  {[
                    { value: "PENDING", label: "Pending" },
                    { value: "INREVIEW", label: "In Review" },
                    { value: "APPROVED", label: "Approved" },
                    { value: "REJECTED", label: "Rejected" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setPendingStatusChange(option.value as any);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <span className={cn("size-2 rounded-full", 
                        option.value === "APPROVED" ? "bg-green-500" :
                        option.value === "REJECTED" ? "bg-red-500" :
                        option.value === "INREVIEW" ? "bg-blue-500" : "bg-amber-500"
                      )} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Profile Details Section */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
              Personal Profile Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">First Name</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.firstname || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Last Name</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.lastname || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Phone className="size-3 text-gray-400" />
                  Phone Number
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  {detailedApp.phoneNumber || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Briefcase className="size-3 text-gray-400" />
                  Occupation
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatOccupation(detailedApp.occupation)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Date of Birth</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.dob
                    ? new Date(detailedApp.dob).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Registration Country</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.country?.name || "N/A"} ({detailedApp.country?.code || "N/A"})
                </p>
              </div>
            </div>
          </div>

          {/* Stepper Timeline Onboarding History */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
              Onboarding History
            </h2>
            {isHistoryLoading ? (
              <div className="py-4 text-center">
                <Loader2 className="size-5 animate-spin text-[#E52629] mx-auto" />
              </div>
            ) : !onboardingHistory || onboardingHistory.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center">No onboarding history available.</p>
            ) : (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-white/5">
                {onboardingHistory.map((step, idx) => {
                  const isCompleted = !!step.completedAt;
                  const isActive = !isCompleted && step.step === (detailedApp.currentStep ?? 1);

                  return (
                    <div key={`step-timeline-${idx}`} className="relative flex gap-4">
                      {/* Dot / Indicator */}
                      <div
                        className={cn(
                          "absolute -left-6 top-1 size-5.5 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300",
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isActive
                            ? "bg-white dark:bg-[#111111] border-[#E52629] text-[#E52629] shadow-lg shadow-[#E52629]/20"
                            : "bg-white dark:bg-[#111111] border-gray-200 dark:border-white/10 text-gray-300 dark:text-gray-600"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : isActive ? (
                          <span className="size-2 rounded-full bg-[#E52629] animate-pulse" />
                        ) : (
                          <Circle className="size-2.5 fill-current text-gray-200 dark:text-gray-700" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={cn(
                            "text-sm font-bold tracking-tight",
                            isCompleted
                              ? "text-gray-900 dark:text-white"
                              : isActive
                              ? "text-[#E52629]"
                              : "text-gray-400 dark:text-gray-500"
                          )}
                        >
                          {step.title}
                        </h4>
                        {step.completedAt && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-mono font-bold bg-gray-50 dark:bg-white/[0.01] px-2 py-1 rounded border border-gray-100/50 dark:border-white/5 truncate">
                            Completed: {new Date(step.completedAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* KYC Verification Details Card */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
              <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="size-4 text-green-500" />
                <span>KYC Verification Details</span>
              </h2>
              <span className={cn(
                "text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider",
                getStatusClass(detailedApp.kycStatus)
              )}>
                {formatKycStatus(detailedApp.kycStatus)}
              </span>
            </div>

            {isKycLoading ? (
              <div className="py-4 text-center">
                <Loader2 className="size-5 animate-spin text-[#E52629] mx-auto" />
              </div>
            ) : !kycDetails || !kycDetails.fullName ? (
              <div className="py-6 text-center space-y-2">
                <ShieldQuestion className="size-8 text-amber-500 mx-auto animate-pulse" />
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  KYC Verification Pending
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  This user has not completed the identity verification process yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {kycDetails.portraitImageUrl && (
                  <div className="relative size-24 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 bg-gray-50 dark:bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={kycDetails.portraitImageUrl}
                      alt="KYC Portrait"
                      className="size-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Verified Full Name</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                        {kycDetails.fullName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Date of Birth</span>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                        {kycDetails.dateOfBirth
                          ? new Date(kycDetails.dateOfBirth).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Issuing State</span>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 font-mono uppercase bg-gray-50 dark:bg-white/5 px-2 py-1 rounded inline-block">
                        {kycDetails.issuingState || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Status & Address */}
        <div className="space-y-8">
          
          {/* Onboarding Status / Process Metadata */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
              Onboarding Info
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Current Phase</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">
                  Step {detailedApp.currentStep ?? 1} / 4
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">KYC Attempts</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  {detailedApp.kycAttempts ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Submitted Date</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.createdAt ? new Date(detailedApp.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>

              {detailedApp.kycRejectionReason && (
                <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-2xl border border-red-200/50 dark:border-red-500/20 text-xs">
                  <span className="font-bold text-red-700 dark:text-red-400 block mb-1">Rejection Reason:</span>
                  <p className="text-red-600 dark:text-red-300 font-medium">{detailedApp.kycRejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Home Address Section */}
          {detailedApp.homeAddress && (
            <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2.5">
                <MapPin className="size-4 text-[#E52629]" />
                <span>Home Address</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Street / House No</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                    {detailedApp.homeAddress.street} {detailedApp.homeAddress.houseNumber}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">City & Postal Code</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
                    {detailedApp.homeAddress.city?.name || "N/A"}, {detailedApp.homeAddress.postalCode}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Country</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                    {detailedApp.homeAddress.country?.name || "N/A"}
                  </p>
                </div>
                {detailedApp.homeAddress.additionalInfo && (
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Additional Info</span>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                      {detailedApp.homeAddress.additionalInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingStatusChange && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#181818] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl max-w-sm w-full mx-4 space-y-6 text-center animate-scale-up">
            <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-black text-gray-950 dark:text-white tracking-tight">Confirm Status Change</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Are you sure you want to change the application status to <span className="font-bold text-[#E52629] dark:text-[#E52629]">{pendingStatusChange}</span>?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingStatusChange(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const status = pendingStatusChange;
                  setPendingStatusChange(null);
                  handleUpdateStatus(status);
                }}
                className="flex-1 py-2.5 bg-[#E52629] hover:bg-[#c41e21] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
