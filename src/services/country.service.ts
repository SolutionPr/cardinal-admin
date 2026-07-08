import {
  buildPaginationMeta,
  extractPaginationMeta,
  paginateItems,
  type PaginatedResult,
} from "@/lib/pagination";

export interface CountryRaw {
  id?: string;
  _id?: string;
  countryId?: string;
  name?: string;
  countryName?: string;
  code?: string;
  countryCode?: string;
  isoCode?: string;
  iso2?: string;
  iso3?: string;
  currencyCode?: string;
  currency?: string;
  phoneCode?: string;
  phonePrefix?: string;
  phone_prefix?: string;
  dialCode?: string;
  dial_code?: string;
  prefix?: string;
  isActive?: boolean;
  isSupported?: boolean;
  is_supported?: boolean;
  supported?: boolean;
  status?: string;
  enabled?: boolean;
  configuration?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface CountriesQueryParams {
  page?: number;
  limit?: number;
}

export interface Country {
  id: string;
  name: string;
  code?: string;
  phonePrefix?: string;
  isActive?: boolean;
  isSupported?: boolean;
}

export interface CountryInput {
  code: string;
  name: string;
  phonePrefix: string;
  isActive: boolean;
  isSupported: boolean;
}

export interface CountryMutationResponse {
  success?: boolean;
  message?: string;
  data?: CountryRaw | CountryRaw[];
}

export type CountriesPageResult = PaginatedResult<Country>;

export interface CountriesResponse {
  success?: boolean;
  message?: string;
  data?:
    | CountryRaw[]
    | {
        countries?: CountryRaw[];
        items?: CountryRaw[];
        records?: CountryRaw[];
        list?: CountryRaw[];
      };
  countries?: CountryRaw[];
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

function pickBoolean(
  source: Record<string, unknown>,
  keys: string[],
): boolean | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1" || value === "true") return true;
    if (value === 0 || value === "0" || value === "false") return false;
  }
  return undefined;
}

function extractIsSupported(raw: CountryRaw): boolean | undefined {
  const record = raw as CountryRaw & Record<string, unknown>;
  const nestedSources = [raw.configuration, raw.config].filter(
    (value): value is Record<string, unknown> =>
      Boolean(value) && typeof value === "object",
  );

  const keys = ["isSupported", "is_supported", "supported"];

  for (const source of [record, ...nestedSources]) {
    const value = pickBoolean(source, keys);
    if (value !== undefined) return value;
  }

  if (typeof raw.isSupported === "boolean") return raw.isSupported;
  if (typeof raw.is_supported === "boolean") return raw.is_supported;
  if (typeof raw.supported === "boolean") return raw.supported;

  return undefined;
}

function formatPhonePrefix(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

function extractPhonePrefix(raw: CountryRaw): string | undefined {
  const record = raw as CountryRaw & Record<string, unknown>;
  const nestedSources = [raw.configuration, raw.config].filter(
    (value): value is Record<string, unknown> =>
      Boolean(value) && typeof value === "object",
  );

  const sources = [record, ...nestedSources];
  const keys = [
    "phonePrefix",
    "phone_prefix",
    "phoneCode",
    "phone_code",
    "dialCode",
    "dial_code",
    "prefix",
    "callingCode",
    "calling_code",
  ];

  for (const source of sources) {
    const value = pickString(source, keys);
    if (value) return formatPhonePrefix(value);
  }

  return undefined;
}

function extractCountryList(response: CountriesResponse): CountryRaw[] {
  if (Array.isArray(response)) {
    return response as CountryRaw[];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && typeof response.data === "object") {
    const nested = response.data as {
      countries?: CountryRaw[];
      items?: CountryRaw[];
      records?: CountryRaw[];
      list?: CountryRaw[];
    };

    if (Array.isArray(nested.countries)) return nested.countries;
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.records)) return nested.records;
    if (Array.isArray(nested.list)) return nested.list;
  }

  if (Array.isArray(response.countries)) {
    return response.countries;
  }

  return [];
}

function normalizeCountry(raw: CountryRaw): Country | null {
  const record = raw as CountryRaw & Record<string, unknown>;
  const name =
    pickString(record, ["name", "countryName", "country_name"]) ??
    raw.name?.trim() ??
    raw.countryName?.trim();

  const id =
    pickString(record, ["id", "_id", "countryId", "country_id"]) ?? name;

  if (!id || !name) return null;

  const isActive =
    raw.isActive ??
    raw.enabled ??
    (typeof raw.status === "string"
      ? raw.status.toLowerCase() === "active"
      : undefined);

  const code =
    pickString(record, ["code", "countryCode", "country_code", "iso2", "isoCode", "iso_code"]) ??
    raw.code ??
    raw.iso2 ??
    raw.isoCode;

  return {
    id: String(id),
    name,
    code,
    phonePrefix: extractPhonePrefix(raw),
    isActive,
    isSupported: extractIsSupported(raw),
  };
}

export function normalizeCountriesResponse(
  response: CountriesResponse,
): Country[] {
  return extractCountryList(response)
    .map(normalizeCountry)
    .filter((country): country is Country => country !== null);
}

export function normalizeCountryMutationResponse(
  response: CountryMutationResponse,
): Country {
  const raw = Array.isArray(response.data)
    ? response.data[0]
    : response.data;

  if (!raw) {
    throw new Error("Invalid country response.");
  }

  const country = normalizeCountry(raw);
  if (!country) {
    throw new Error("Invalid country response.");
  }

  return country;
}

export function toCountryPayload(input: CountryInput): CountryInput {
  const code = input.code.trim().toUpperCase();
  const phonePrefix = formatPhonePrefix(input.phonePrefix.trim()) ?? input.phonePrefix.trim();

  return {
    code,
    name: input.name.trim(),
    phonePrefix,
    isActive: input.isActive,
    isSupported: input.isSupported,
  };
}

export function countryToFormValues(country: Country): CountryInput {
  return {
    code: country.code ?? "",
    name: country.name,
    phonePrefix: country.phonePrefix ?? "",
    isActive: country.isActive ?? true,
    isSupported: country.isSupported ?? true,
  };
}

export function normalizeCountriesPageResponse(
  response: CountriesResponse,
  params: CountriesQueryParams = {},
): CountriesPageResult {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const countries = normalizeCountriesResponse(response);
  const fallbackPagination = buildPaginationMeta(page, limit, countries.length);
  const pagination = extractPaginationMeta(response, fallbackPagination);

  const hasServerMeta =
    pagination.total !== countries.length ||
    (pagination.total > limit && countries.length <= limit);

  if (hasServerMeta && pagination.total >= countries.length) {
    return { items: countries, pagination };
  }

  return paginateItems(countries, page, limit);
}
