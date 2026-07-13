export interface BusinessTypeRaw {
  id?: string;
  _id?: string;
  businessTypeId?: string;
  name?: string;
  businessTypeName?: string;
  business_type_name?: string;
  description?: string;
  label?: string;
  code?: string;
}

export interface BusinessType {
  id: string;
  name: string;
  description?: string;
}

export interface SupportedBusinessType {
  supportedBusinessTypeId: string;
  businessTypeId: string;
  name: string;
  description?: string;
}

export interface BusinessTypesResponse {
  success?: boolean;
  message?: string;
  data?:
    | BusinessTypeRaw[]
    | {
        businessTypes?: BusinessTypeRaw[];
        items?: BusinessTypeRaw[];
        records?: BusinessTypeRaw[];
        list?: BusinessTypeRaw[];
      };
  businessTypes?: BusinessTypeRaw[];
}

export interface AttachBusinessTypeInput {
  countryId: string;
  businessTypeId: string;
}

function pickString(
  source: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

function extractBusinessTypeList(response: BusinessTypesResponse): BusinessTypeRaw[] {
  if (Array.isArray(response)) {
    return response as BusinessTypeRaw[];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && typeof response.data === "object") {
    const nested = response.data as {
      businessTypes?: BusinessTypeRaw[];
      items?: BusinessTypeRaw[];
      records?: BusinessTypeRaw[];
      list?: BusinessTypeRaw[];
    };

    if (Array.isArray(nested.businessTypes)) return nested.businessTypes;
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.records)) return nested.records;
    if (Array.isArray(nested.list)) return nested.list;
  }

  if (Array.isArray(response.businessTypes)) {
    return response.businessTypes;
  }

  return [];
}

function normalizeBusinessType(raw: BusinessTypeRaw): BusinessType | null {
  const record = raw as BusinessTypeRaw & Record<string, unknown>;
  const name =
    pickString(record, ["name", "businessTypeName", "business_type_name", "label"]) ??
    raw.name?.trim();

  const id =
    pickString(record, ["id", "_id", "businessTypeId", "business_type_id"]) ?? name;

  if (!id || !name) return null;

  const description =
    pickString(record, ["description", "details", "summary"]) ?? raw.description;

  return {
    id: String(id),
    name,
    description,
  };
}

export function normalizeBusinessTypesResponse(
  response: BusinessTypesResponse,
): BusinessType[] {
  return extractBusinessTypeList(response)
    .map(normalizeBusinessType)
    .filter((item): item is BusinessType => item !== null);
}

function normalizeSupportedBusinessType(
  raw: BusinessTypeRaw,
): SupportedBusinessType | null {
  const record = raw as BusinessTypeRaw & Record<string, unknown>;
  const nested =
    record.businessType && typeof record.businessType === "object"
      ? (record.businessType as BusinessTypeRaw & Record<string, unknown>)
      : record.business_type && typeof record.business_type === "object"
        ? (record.business_type as BusinessTypeRaw & Record<string, unknown>)
        : null;

  const hasSupportedIdAtRoot = Boolean(
    record.supportedTypeId ||
    record.supported_type_id ||
    record.supportedBusinessTypeId ||
    record.supported_business_type_id ||
    record.countryBusinessTypeId ||
    record.country_business_type_id
  );

  const supportedBusinessTypeId =
    pickString(record, [
      "supportedTypeId",
      "supported_type_id",
      "supportedBusinessTypeId",
      "supported_business_type_id",
      "countryBusinessTypeId",
      "country_business_type_id",
    ]) ??
    pickString(record, ["id", "_id"]) ??
    undefined;

  const businessTypeId =
    pickString(record, ["businessTypeId", "business_type_id"]) ??
    (nested
      ? pickString(nested, ["id", "_id", "businessTypeId", "business_type_id"])
      : undefined) ??
    (hasSupportedIdAtRoot ? pickString(record, ["id", "_id"]) : undefined) ??
    supportedBusinessTypeId;

  const name =
    (nested
      ? pickString(nested, [
          "name",
          "businessTypeName",
          "business_type_name",
          "label",
        ])
      : undefined) ??
    pickString(record, ["name", "businessTypeName", "business_type_name", "label"]) ??
    raw.name?.trim();

  if (!supportedBusinessTypeId || !businessTypeId || !name) return null;

  const description =
    (nested ? pickString(nested, ["description", "details", "summary"]) : undefined) ??
    pickString(record, ["description", "details", "summary"]) ??
    raw.description;

  return {
    supportedBusinessTypeId: String(supportedBusinessTypeId),
    businessTypeId: String(businessTypeId),
    name,
    description,
  };
}

export function normalizeSupportedBusinessTypesResponse(
  response: BusinessTypesResponse,
): SupportedBusinessType[] {
  return extractBusinessTypeList(response)
    .map(normalizeSupportedBusinessType)
    .filter((item): item is SupportedBusinessType => item !== null);
}
