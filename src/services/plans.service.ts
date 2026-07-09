export interface PlanFeatureRaw {
  id?: string;
  planId?: string;
  featureCode?: string;
  name?: string;
  value?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanRaw {
  id: string;
  name: string;
  code: string;
  segment: "ENTERPRISE" | "COMPANY" | "FREELANCER" | string;
  monthlyPrice: string | number;
  currency: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  features?: PlanFeatureRaw[];
}

export interface PlansResponse {
  success?: boolean;
  statusCode?: number;
  type?: string;
  message?: string;
  timestamp?: string;
  path?: string;
  data?: PlanRaw[];
}

export interface PlanUpdateResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  data?: PlanRaw;
}

export interface PricingPlanFeature {
  id: string;
  planId: string;
  featureCode: string;
  name: string;
  value: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  code: string;
  segment: "ENTERPRISE" | "COMPANY" | "FREELANCER" | string;
  monthlyPrice: number;
  currency: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  features: PricingPlanFeature[];
}

export interface UpdatePlanInput {
  id: string;
  name: string;
  code: string;
  segment: string;
  monthlyPrice: number;
  currency: string;
  isActive: boolean;
  features: Array<{
    id?: string;
    planId?: string;
    featureCode: string;
    name: string;
    value: string;
  }>;
}

export function normalizePlan(raw: PlanRaw): PricingPlan {
  return {
    id: raw.id,
    name: raw.name || "",
    code: raw.code || "",
    segment: raw.segment || "",
    monthlyPrice: typeof raw.monthlyPrice === "string" ? parseFloat(raw.monthlyPrice) || 0 : raw.monthlyPrice || 0,
    currency: raw.currency || "EUR",
    isActive: !!raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    features: (raw.features || []).map((feat) => ({
      id: feat.id || "",
      planId: feat.planId || raw.id,
      featureCode: feat.featureCode || "",
      name: feat.name || "",
      value: feat.value || "",
    })),
  };
}

export function normalizePlansResponse(response: PlansResponse): PricingPlan[] {
  if (Array.isArray(response.data)) {
    return response.data.map(normalizePlan);
  }
  if (Array.isArray(response)) {
    return (response as PlanRaw[]).map(normalizePlan);
  }
  return [];
}

export function normalizePlanUpdateResponse(response: PlanUpdateResponse): PricingPlan {
  if (response.data) {
    return normalizePlan(response.data);
  }
  throw new Error("Invalid plan update response structure");
}
