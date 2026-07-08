"use client";

import { use } from "react";
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
  Mail,
  Calendar,
  Globe,
  Percent,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useGetAssociatedPersonsQuery, useDeleteAssociatedPersonMutation } from "@/store/api/applicationsApi";
import { getApiErrorMessage } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string; personId: string }>;
}

export default function AssociatedPersonDetailPage({ params }: PageProps) {
  const { id, personId } = use(params);
  const router = useRouter();

  // Fetch all associated persons for the company profile
  const { data: assocPersonsData, isLoading, error } = useGetAssociatedPersonsQuery(id);
  const [deletePerson, { isLoading: isDeleting }] = useDeleteAssociatedPersonMutation();

  // Find the specific associated person matching personId in any of the arrays
  const person = (() => {
    if (!assocPersonsData) return null;
    const allPersons = [
      ...(assocPersonsData.directors || []),
      ...(assocPersonsData.owner || []),
      ...(assocPersonsData.shareHolders || []),
      ...(assocPersonsData.partner || []),
      ...(assocPersonsData.applicant || []),
    ];
    return allPersons.find((p) => p.id === personId);
  })();

  const handleDelete = async () => {
    if (!person) return;
    if (!confirm("Are you sure you want to delete this associated person?")) return;
    try {
      await deletePerson({
        companyProfileId: id,
        personId: person.id,
        applicationId: person.applicationId,
        role: person.roles[0]?.role || "DIRECTOR",
      }).unwrap();
      router.push(`/dashboard/applications/corporate/${id}`);
    } catch (err) {
      alert("Failed to delete associated person: " + getApiErrorMessage(err));
    }
  };

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESSFUL":
      case "APPROVED":
        return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200/50 dark:border-green-500/20";
      case "PENDING":
      case "INPROGRESS":
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
    if (status === "INPROGRESS") return "In Progress";
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
          Loading Person Details...
        </p>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="py-24 px-6 text-center max-w-lg mx-auto space-y-4">
        <AlertCircle className="size-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-black text-gray-900 dark:text-white">
          Failed to load associated person details
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {error ? getApiErrorMessage(error) : "Associated person not found."}
        </p>
        <button
          onClick={() => router.push(`/dashboard/applications/corporate/${id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Company Profile</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/applications/corporate/${id}`)}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#E52629] transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Company Application Details</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
          <Clock className="size-3.5" />
          <span>
            Updated:{" "}
            {person.updatedAt ? new Date(person.updatedAt).toLocaleDateString() : "N/A"}
          </span>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="relative overflow-hidden bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-[#E52629]/10 flex items-center justify-center shrink-0">
            <User className="size-8 text-[#E52629]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {person.firstName} {person.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {(person.roles || []).map((r, rIdx) => (
                <span
                  key={`role-${r.id || rIdx}`}
                  className="text-[9px] px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded font-black uppercase tracking-wider"
                >
                  {r.role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* KYC Status Badge */}
        <div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider",
              getStatusClass(person.kycStatus)
            )}
          >
            {getKycIcon(person.kycStatus)}
            {formatKycStatus(person.kycStatus)}
          </span>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Person Profile */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Identity & Registry Info */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
              Identity & Citizenship Info
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Mail className="size-3.5 text-gray-400" />
                  Email Address
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono truncate">
                  {person.email || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Calendar className="size-3.5 text-gray-400" />
                  Date of Birth
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {person.dateOfBirth
                    ? new Date(person.dateOfBirth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Country of Birth</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {person.countryOfBirth?.name || "N/A"} ({person.countryOfBirth?.code || "N/A"})
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Country of Citizenship</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {person.countryOfCitizenship?.name || "N/A"} ({person.countryOfCitizenship?.code || "N/A"})
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Residence Country</span>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {person.residenceCountry?.name || "N/A"} ({person.residenceCountry?.code || "N/A"})
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Percent className="size-3.5 text-gray-400" />
                  Ownership Percentage
                </span>
                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  {person.ownershipPercentage && person.ownershipPercentage !== "0" ? `${person.ownershipPercentage}%` : "0% / Non-equity"}
                </p>
              </div>

            </div>
          </div>

          {/* Residence Address Registry */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 dark:border-white/5 pb-2.5">
              <MapPin className="size-4 text-[#E52629]" />
              <span>Residential Address Details</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Street & House Number</span>
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                  {person.street || "N/A"} {person.houseNumber || ""}
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">City & State</span>
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                  {person.cityOfResidence?.name || "N/A"} {person.cityOfResidence?.stateCode ? `(${person.cityOfResidence.stateCode})` : ""}
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Postal Code</span>
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
                  {person.postalCode || "N/A"}
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Country</span>
                <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                  {person.residenceCountry?.name || "N/A"}
                </p>
              </div>

              {person.additionalInfo && (
                <div className="sm:col-span-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Additional Address Info</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                    {person.additionalInfo}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column - Status & Compliance */}
        <div className="space-y-8">
          
          {/* Compliance & KYC Timeline Profile */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-widest border-b border-gray-100 dark:border-white/5 pb-3">
              Compliance Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Current Step</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">
                  Step {person.currentStep ?? 1}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">KYC Attempts</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  {person.kycAttempts ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Registry Date</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {person.createdAt ? new Date(person.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>

              {person.kycRejectionReason && (
                <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-2xl border border-red-200/50 dark:border-red-500/20 text-xs">
                  <span className="font-bold text-red-700 dark:text-red-400 block mb-1">Compliance Check Rejection:</span>
                  <p className="text-red-600 dark:text-red-300 font-medium">{person.kycRejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
