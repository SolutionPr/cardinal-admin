"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Edit2,
  Layers,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { useGetPlansQuery, useUpdatePlanMutation } from "@/store/api/masterDataApi";
import type { PricingPlan, PricingPlanFeature } from "@/services/plans.service";

type SegmentType = "ENTERPRISE" | "COMPANY" | "FREELANCER";

export default function PlansPage() {
  const [selectedSegment, setSelectedSegment] = useState<SegmentType>("COMPANY");
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("0");
  const [formActive, setFormActive] = useState(true);
  const [formFeatures, setFormFeatures] = useState<PricingPlanFeature[]>([]);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    data: allPlans = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPlansQuery();

  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();

  const segments: { key: SegmentType; label: string }[] = [
    { key: "COMPANY", label: "Companies" },
    { key: "FREELANCER", label: "Freelancers" },
    { key: "ENTERPRISE", label: "Enterprise" },
  ];

  const filteredPlans = useMemo(() => {
    return allPlans.filter((plan) => plan.segment === selectedSegment);
  }, [allPlans, selectedSegment]);

  const handleEditClick = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormPrice(plan.monthlyPrice.toString());
    setFormActive(plan.isActive);
    setFormFeatures(JSON.parse(JSON.stringify(plan.features))); // Deep copy
    setUpdateError(null);
    setSuccessMessage(null);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const next = [...formFeatures];
    next[index] = { ...next[index], value: val };
    setFormFeatures(next);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setUpdateError(null);
    setSuccessMessage(null);

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum)) {
      setUpdateError("Price must be a valid number");
      return;
    }

    try {
      await updatePlan({
        id: editingPlan.id,
        body: {
          id: editingPlan.id,
          name: formName.trim(),
          code: editingPlan.code,
          segment: editingPlan.segment,
          monthlyPrice: priceNum, // Send as a parsed number to conform to backend constraints
          currency: editingPlan.currency,
          isActive: formActive,
          features: formFeatures.map((feat) => ({
            id: feat.id,
            planId: feat.planId,
            featureCode: feat.featureCode,
            name: feat.name,
            value: feat.value.trim(),
          })),
        },
      }).unwrap();

      setSuccessMessage("Plan updated successfully");
      setEditingPlan(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setUpdateError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-[#E52629]/10 flex items-center justify-center">
              <Layers className="size-5 text-[#E52629]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                Pricing Plans
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                Manage your application subscription packages and features.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={refetch}
          disabled={isLoading || isFetching}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-sm font-bold text-gray-700 dark:text-gray-200 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main error alerts */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm font-semibold">{getApiErrorMessage(error)}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400">
          <CheckCircle2 className="size-5 shrink-0" />
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-white/10">
        <div className="flex gap-6">
          {segments.map((seg) => (
            <button
              key={seg.key}
              onClick={() => setSelectedSegment(seg.key)}
              className={cn(
                "pb-4 text-sm font-extrabold transition-all relative cursor-pointer focus:outline-none",
                selectedSegment === seg.key
                  ? "text-[#E52629]"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {seg.label}
              {selectedSegment === seg.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E52629] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 text-[#E52629] animate-spin" />
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
            Loading pricing plans...
          </span>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
          <Sparkles className="size-10 text-gray-400 mb-3" />
          <span className="text-base font-bold text-gray-900 dark:text-white">
            No plans found
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            No plans registered in this segment segment.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-gray-200 dark:hover:border-white/10 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Top Accent Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E52629] to-red-500" />

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                      {plan.code}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                      plan.isActive
                        ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                    )}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 my-6">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {plan.monthlyPrice === 0 ? "Free" : `${plan.monthlyPrice}`}
                  </span>
                  {plan.monthlyPrice !== 0 && (
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                      {plan.currency} / month
                    </span>
                  )}
                </div>

                {/* Features */}
                <div className="border-t border-gray-100 dark:border-white/5 pt-4 mt-4 space-y-3">
                  <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Included Features
                  </h4>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat) => (
                      <li key={feat.id} className="flex justify-between items-start gap-4 text-sm py-0.5">
                        <span className="text-gray-500 dark:text-gray-400 font-medium text-left leading-tight">
                          {feat.name}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white text-right leading-tight break-words">
                          {feat.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 dark:border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => handleEditClick(plan)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-white/[0.04] hover:bg-[#E52629]/10 hover:text-[#E52629] dark:hover:bg-[#E52629]/15 transition-all text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <Edit2 className="size-4" />
                  <span>Edit Plan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Edit Plan: {editingPlan.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Modify base characteristics and feature values.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {updateError && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400">
                  <AlertCircle className="size-5 shrink-0" />
                  <p className="text-sm font-semibold">{updateError}</p>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#E52629] dark:focus:border-[#E52629] transition-all font-medium text-sm"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Monthly Price ({editingPlan.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    {editingPlan.currency === "EUR" ? "€" : editingPlan.currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#E52629] dark:focus:border-[#E52629] transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Active Status</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Toggle whether customers can subscribe to this plan.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="size-5 rounded border-gray-300 dark:border-white/10 accent-[#E52629] cursor-pointer"
                />
              </div>

              {/* Features Values */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Edit Feature Values
                </h4>

                <div className="space-y-4">
                  {formFeatures.map((feat, index) => (
                    <div key={feat.id || feat.featureCode} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {feat.name}
                      </span>
                      <input
                        type="text"
                        required
                        value={feat.value}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#E52629] dark:focus:border-[#E52629] transition-all font-medium text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  disabled={isUpdating}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-bold text-sm cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-[#E52629] hover:bg-red-600 text-white font-bold text-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdating && <Loader2 className="size-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
