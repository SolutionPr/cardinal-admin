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

export interface LegalEntityRaw {
  id?: string;
  _id?: string;
  legalEntityId?: string;
  name?: string;
  legalEntityName?: string;
  legal_entity_name?: string;
  code?: string;
  legalEntityCode?: string;
  legal_entity_code?: string;
  supportedTypeId?: string;
  supported_type_id?: string;
  supportedBusinessTypeId?: string;
  supported_business_type_id?: string;
}

export interface LegalEntity {
  id: string;
  name: string;
  code: string;
  supportedBusinessTypeId?: string;
}

export interface LegalEntityInput {
  name: string;
  code: string;
  supportedBusinessTypeId: string;
}

export interface LegalEntitiesResponse {
  success?: boolean;
  message?: string;
  data?:
    | LegalEntityRaw[]
    | {
        legalEntities?: LegalEntityRaw[];
        items?: LegalEntityRaw[];
        records?: LegalEntityRaw[];
        list?: LegalEntityRaw[];
      };
  legalEntities?: LegalEntityRaw[];
}

export interface LegalEntityMutationResponse {
  success?: boolean;
  message?: string;
  data?: LegalEntityRaw | LegalEntityRaw[] | Record<string, unknown>;
}

function extractLegalEntityList(response: LegalEntitiesResponse): LegalEntityRaw[] {
  if (Array.isArray(response)) {
    return response as LegalEntityRaw[];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && typeof response.data === "object") {
    const nested = response.data as {
      legalEntities?: LegalEntityRaw[];
      items?: LegalEntityRaw[];
      records?: LegalEntityRaw[];
      list?: LegalEntityRaw[];
    };

    if (Array.isArray(nested.legalEntities)) return nested.legalEntities;
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.records)) return nested.records;
    if (Array.isArray(nested.list)) return nested.list;
  }

  if (Array.isArray(response.legalEntities)) {
    return response.legalEntities;
  }

  return [];
}

function normalizeLegalEntity(raw: LegalEntityRaw): LegalEntity | null {
  const record = raw as LegalEntityRaw & Record<string, unknown>;
  const id =
    pickString(record, ["id", "_id", "legalEntityId", "legal_entity_id"]) ??
    raw.id?.trim();
  const name =
    pickString(record, ["name", "legalEntityName", "legal_entity_name"]) ??
    raw.name?.trim();
  const code =
    pickString(record, ["code", "legalEntityCode", "legal_entity_code"]) ??
    raw.code?.trim();
  const supportedBusinessTypeId = pickString(record, [
    "supportedTypeId",
    "supported_type_id",
    "supportedBusinessTypeId",
    "supported_business_type_id",
  ]);

  if (!id || !name || !code) return null;

  return {
    id: String(id),
    name,
    code,
    supportedBusinessTypeId,
  };
}

export function normalizeLegalEntitiesResponse(
  response: LegalEntitiesResponse,
): LegalEntity[] {
  return extractLegalEntityList(response)
    .map(normalizeLegalEntity)
    .filter((item): item is LegalEntity => item !== null);
}

export function normalizeLegalEntityMutationResponse(
  response: LegalEntityMutationResponse,
): LegalEntity {
  const raw =
    response.data && !Array.isArray(response.data)
      ? (response.data as LegalEntityRaw)
      : null;
  const normalized = raw ? normalizeLegalEntity(raw) : null;

  if (normalized) return normalized;

  throw new Error("Unable to parse legal entity response.");
}

export function toLegalEntityPayload(input: LegalEntityInput) {
  return {
    name: input.name.trim(),
    code: input.code.trim(),
    supportedTypeId: input.supportedBusinessTypeId,
  };
}
