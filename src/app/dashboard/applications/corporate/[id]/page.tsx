"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Building,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Search,
  Loader2,
  AlertCircle,
  Globe,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useGetCompanyProfileQuery, useGetAssociatedPersonsQuery, useGetCompanyOnboardingHistoryQuery } from "@/store/api/applicationsApi";
import { getApiErrorMessage } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Mock directors list to show placeholder details as requested
const MOCK_DIRECTORS = [
  {
    name: "Lars Johansson",
    role: "Managing Director / CEO",
    ownership: "45%",
    status: "Verified",
    email: "lars.johansson@swedtech.se",
    phone: "+46 8 123 45 67",
    dob: "1978-04-12",
  },
  {
    name: "Emma Lindqvist",
    role: "Board Member / Chairman",
    ownership: "30%",
    status: "Verified",
    email: "emma.l@swedtech.se",
    phone: "+46 8 987 65 43",
    dob: "1983-09-24",
  },
  {
    name: "Sven-Erik Bergman",
    role: "Ultimate Beneficial Owner (UBO)",
    ownership: "25%",
    status: "Pending Verification",
    email: "sven.bergman@swedtech.se",
    phone: "+46 70 555 12 34",
    dob: "1965-11-02",
  },
];

export default function CorporateDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Fetch details for the corporate application
  const { data: detailedApp, isLoading, error } = useGetCompanyProfileQuery(id);
  const { data: assocPersonsData, isLoading: isAssocLoading } = useGetAssociatedPersonsQuery(id);
  const { data: onboardingHistory, isLoading: isHistoryLoading } = useGetCompanyOnboardingHistoryQuery(id);

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESSFUL":
      case "APPROVED":
        return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200/50 dark:border-green-500/20";
      case "PENDING":
      case "NOT_STARTED":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20";
      case "REJECTED":
      case "FAILED":
        return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20";
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20";
    }
  };

  const getKycIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESSFUL":
      case "APPROVED":
        return <ShieldCheck className="size-5 text-green-600 dark:text-green-400" />;
      case "REJECTED":
      case "FAILED":
        return <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />;
      default:
        return <ShieldQuestion className="size-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const formatKycStatus = (status: string) => {
    if (!status) return "N/A";
    return status
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
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
          Failed to load corporate application
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {getApiErrorMessage(error)}
        </p>
        <button
          onClick={() => router.push("/dashboard/applications/corporate")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Applications</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/dashboard/applications/corporate")}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#E52629] transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Corporate Applications</span>
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
      <div className="relative overflow-hidden bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-[#E52629]/10 flex items-center justify-center shrink-0">
            <Building2 className="size-8 text-[#E52629]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {detailedApp.businessLegalName || "Tricky Web Solutions"}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  getStatusClass(detailedApp.kycStatus)
                )}
              >
                {getKycIcon(detailedApp.kycStatus)}
                {formatKycStatus(detailedApp.kycStatus)}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-1">
              ID: {detailedApp.id}
            </p>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="w-full md:w-60 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-400 uppercase tracking-wider">Completion Status</span>
            <span className="text-gray-900 dark:text-white">
              {detailedApp.completionPercentage !== undefined ? `${detailedApp.completionPercentage}%` : "N/A"}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${detailedApp.completionPercentage ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Main corporate details */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Company Details Section */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
              Company Profile Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Legal Name</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.businessLegalName || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Brand Name</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.brandName || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Entity Type</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.entityType?.name || "N/A"} (Code: {detailedApp.entityType?.code || "N/A"})
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Business Type</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.legalForm?.businessType?.description || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Registration Number</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  {detailedApp.registrationNumber || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">VAT Number</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  {detailedApp.vatNumber || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Registration Date</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.registrationDate
                    ? new Date(detailedApp.registrationDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Website</span>
                <p className="text-sm font-bold text-[#E52629] truncate">
                  {detailedApp.website ? (
                    <a href={detailedApp.website} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                      <Globe className="size-3.5" />
                      {detailedApp.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Directors & Key Individuals Section */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-3">
              <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest">
                Directors & Associated Persons
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-full font-bold">
                {isAssocLoading ? "Loading..." : `${
                  Array.from(new Map(([
                    ...(assocPersonsData?.directors || []),
                    ...(assocPersonsData?.owner || []),
                    ...(assocPersonsData?.shareHolders || []),
                    ...(assocPersonsData?.partner || []),
                    ...(assocPersonsData?.applicant || [])
                  ]).map(p => [p.id, p])).values()
                ).length} Listed`}
              </span>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {isAssocLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="size-6 animate-spin text-[#E52629] mx-auto" />
                </div>
              ) : !assocPersonsData || (
                (assocPersonsData.directors || []).length === 0 &&
                (assocPersonsData.owner || []).length === 0 &&
                (assocPersonsData.shareHolders || []).length === 0 &&
                (assocPersonsData.partner || []).length === 0 &&
                (assocPersonsData.applicant || []).length === 0
              ) ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">No associated persons found.</p>
              ) : (
                Array.from(new Map(([
                  ...(assocPersonsData.directors || []),
                  ...(assocPersonsData.owner || []),
                  ...(assocPersonsData.shareHolders || []),
                  ...(assocPersonsData.partner || []),
                  ...(assocPersonsData.applicant || [])
                ]).map(p => [p.id, p])).values()).map((person) => (
                  <div
                    key={person.id}
                    onClick={() => router.push(`/dashboard/applications/corporate/${id}/associated-person/${person.id}`)}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.01] px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="size-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="size-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-gray-950 dark:text-white">
                            {person.firstName} {person.lastName}
                          </h4>
                          {person.ownershipPercentage && person.ownershipPercentage !== "0" && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-red-50 text-[#E52629] dark:bg-[#E52629]/10 rounded font-black uppercase tracking-wider">
                              {person.ownershipPercentage}% Owner
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          {(person.roles || []).map((r, rIdx) => (
                            <span key={`role-${r.id || rIdx}`} className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded font-bold uppercase tracking-wider">
                              {r.role}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-1 flex-wrap font-mono">
                          {person.dateOfBirth && (
                            <span>DOB: {new Date(person.dateOfBirth).toLocaleDateString()}</span>
                          )}
                          {person.email && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="lowercase">{person.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider",
                        getStatusClass(person.kycStatus)
                      )}>
                        {formatKycStatus(person.kycStatus)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Placeholder Additional Details */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
              Financial & Operations Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <TrendingUp className="size-3 text-gray-400" />
                  Estimated Annual Turnover
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  €2,500,000 - €5,000,000
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <DollarSign className="size-3 text-gray-400" />
                  Monthly Tx Volume
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  ~ €350,000
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <FileText className="size-3 text-gray-400" />
                  Source of Funds
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Corporate Revenue
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column - Status & Addresses */}
        <div className="space-y-8">
          
          {/* Onboarding Status / Process Metadata */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
              Onboarding Info
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Current Step</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">
                  {detailedApp.currentStep} / 7
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">KYC Attempts</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  {detailedApp.kycAttempts ?? 1}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Applicant Country</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {detailedApp.country?.name || "N/A"} ({detailedApp.country?.code || "N/A"})
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

          {/* Onboarding Timeline History Card */}
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
              <div className="relative border-l border-gray-150 dark:border-white/5 ml-3 pl-6 space-y-6">
                {onboardingHistory.map((item, index) => {
                  const isCompleted = !!item.completedAt;
                  const isActive = !isCompleted && item.step === (detailedApp.currentStep ?? 1);
                  return (
                    <div key={`history-step-${item.step || index}`} className="relative">
                      {/* Timeline Dot Indicator */}
                      <span className={cn(
                        "absolute -left-[31px] top-0.5 size-3.5 rounded-full border-2 flex items-center justify-center transition-all",
                        isCompleted
                          ? "bg-green-500 border-green-500 shadow-sm shadow-green-500/20"
                          : isActive
                          ? "bg-[#E52629] border-[#E52629] animate-pulse"
                          : "bg-white dark:bg-[#111111] border-gray-200 dark:border-white/10"
                      )}>
                        {isCompleted && (
                          <span className="size-1 bg-white rounded-full" />
                        )}
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={cn(
                            "text-xs font-bold transition-colors",
                            isCompleted ? "text-gray-900 dark:text-white" : "text-gray-400"
                          )}>
                            {item.title}
                          </h4>
                        </div>
                        {item.completedAt && (
                          <p className="text-[10px] text-gray-400 font-medium font-mono">
                            {new Date(item.completedAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
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

          {/* Registered Address */}
          {detailedApp.registeredAddress && (
            <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2.5">
                <MapPin className="size-4 text-[#E52629]" />
                <span>Registered Address</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Street / House No</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                    {detailedApp.registeredAddress.street} {detailedApp.registeredAddress.houseNumber}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">City & Postal Code</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
                    {detailedApp.registeredAddress.city?.name || "N/A"}, {detailedApp.registeredAddress.postalCode}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Country</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                    {detailedApp.registeredAddress.country?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Operating Address */}
          {detailedApp.operatingAddress && (
            <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2.5">
                <Building className="size-4 text-[#E52629]" />
                <span>Operating Address</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Street / House No</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                    {detailedApp.operatingAddress.street} {detailedApp.operatingAddress.houseNumber}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">City & Postal Code</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
                    {detailedApp.operatingAddress.city?.name || "N/A"}, {detailedApp.operatingAddress.postalCode}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Country</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                    {detailedApp.operatingAddress.country?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
