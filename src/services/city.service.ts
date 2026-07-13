import {
  buildPaginationMeta,
  extractPaginationMeta,
  paginateItems,
  type PaginatedResult,
} from "@/lib/pagination";

export interface CityRaw {
  id?: string;
  _id?: string;
  cityId?: string;
  name?: string;
  cityName?: string;
  city_name?: string;
  code?: string;
  cityCode?: string;
  city_code?: string;
  state?: string | Record<string, unknown>;
  stateCode?: string;
  state_code?: string;
  stateName?: string;
  state_name?: string;
  province?: string;
  provinceCode?: string;
  province_code?: string;
  region?: string;
  regionCode?: string;
  region_code?: string;
  configuration?: Record<string, unknown>;
  config?: Record<string, unknown>;
  countryId?: string;
  country_id?: string;
  countryIdOrCode?: string;
  country_id_or_code?: string;
  latitude?: string | number;
  longitude?: string | number;
  isActive?: boolean;
  is_active?: boolean;
  status?: string;
  enabled?: boolean;
}

export interface CitiesQueryParams {
  countryIdOrCode: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface City {
  id: string;
  name: string;
  stateCode?: string;
  latitude?: string;
  longitude?: string;
  countryIdOrCode?: string;
}

export interface CityInput {
  name: string;
  stateCode: string;
  latitude: string;
  longitude: string;
  countryIdOrCode: string;
}

export interface CityMutationResponse {
  success?: boolean;
  message?: string;
  data?: CityRaw | CityRaw[];
}

export type CitiesPageResult = PaginatedResult<City>;

export interface CitiesResponse {
  success?: boolean;
  message?: string;
  data?:
    | CityRaw[]
    | {
        cities?: CityRaw[];
        items?: CityRaw[];
        records?: CityRaw[];
        list?: CityRaw[];
      };
  cities?: CityRaw[];
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

function extractCityList(response: CitiesResponse): CityRaw[] {
  if (Array.isArray(response)) {
    return response as CityRaw[];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && typeof response.data === "object") {
    const nested = response.data as {
      cities?: CityRaw[];
      items?: CityRaw[];
      records?: CityRaw[];
      list?: CityRaw[];
    };

    if (Array.isArray(nested.cities)) return nested.cities;
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.records)) return nested.records;
    if (Array.isArray(nested.list)) return nested.list;
  }

  if (Array.isArray(response.cities)) {
    return response.cities;
  }

  return [];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function extractStateCode(raw: CityRaw): string | undefined {
  const record = raw as CityRaw & Record<string, unknown>;
  const nestedState = asRecord(raw.state);
  const nestedSources = [raw.configuration, raw.config, nestedState].filter(
    (value): value is Record<string, unknown> =>
      Boolean(value) && typeof value === "object",
  );

  const keys = [
    "stateCode",
    "state_code",
    "stateAbbreviation",
    "state_abbreviation",
    "provinceCode",
    "province_code",
    "regionCode",
    "region_code",
    "abbreviation",
    "isoCode",
    "iso_code",
    "code",
  ];

  for (const source of [record, ...nestedSources]) {
    const value = pickString(source, keys);
    if (value) return value.toUpperCase();
  }

  if (typeof raw.stateCode === "string" && raw.stateCode.trim()) {
    return raw.stateCode.trim().toUpperCase();
  }

  if (typeof raw.state_code === "string" && raw.state_code.trim()) {
    return raw.state_code.trim().toUpperCase();
  }

  if (typeof raw.state === "string") {
    const trimmed = raw.state.trim();
    if (trimmed.length > 0 && trimmed.length <= 4) {
      return trimmed.toUpperCase();
    }
  }

  return undefined;
}

function normalizeCity(raw: CityRaw): City | null {
  const record = raw as CityRaw & Record<string, unknown>;
  const name =
    pickString(record, ["name", "cityName", "city_name"]) ??
    raw.name?.trim() ??
    raw.cityName?.trim();

  const id =
    pickString(record, ["id", "_id", "cityId", "city_id"]) ?? name;

  if (!id || !name) return null;

  const stateCode = extractStateCode(raw);
  const latitude = pickString(record, ["latitude", "lat"]);
  const longitude = pickString(record, ["longitude", "lng", "lon"]);
  const countryIdOrCode = pickString(record, [
    "countryIdOrCode",
    "country_id_or_code",
    "countryId",
    "country_id",
    "countryCode",
    "country_code",
  ]);

  return {
    id: String(id),
    name,
    stateCode,
    latitude,
    longitude,
    countryIdOrCode,
  };
}

export function normalizeCitiesResponse(response: CitiesResponse): City[] {
  return extractCityList(response)
    .map(normalizeCity)
    .filter((city): city is City => city !== null);
}

export function normalizeCitiesPageResponse(
  response: CitiesResponse,
  params: CitiesQueryParams,
): CitiesPageResult {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  let cities = normalizeCitiesResponse(response);

  // If a search query is provided, we filter the cities locally and paginate locally.
  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    cities = cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.stateCode?.toLowerCase().includes(q)
    );
    return paginateItems(cities, page, limit);
  }

  const fallbackPagination = buildPaginationMeta(page, limit, cities.length);
  const pagination = extractPaginationMeta(response, fallbackPagination);

  const hasServerMeta =
    pagination.total !== cities.length ||
    (pagination.total > limit && cities.length <= limit);

  if (hasServerMeta && pagination.total >= cities.length) {
    return { items: cities, pagination };
  }

  return paginateItems(cities, page, limit);
}

export function normalizeCityMutationResponse(
  response: CityMutationResponse,
): City {
  const raw = Array.isArray(response.data) ? response.data[0] : response.data;

  if (!raw) {
    throw new Error("Invalid city response.");
  }

  const city = normalizeCity(raw);
  if (!city) {
    throw new Error("Invalid city response.");
  }

  return city;
}

export function toCityPayload(input: CityInput): CityInput {
  return {
    name: input.name.trim(),
    stateCode: input.stateCode.trim().toUpperCase(),
    latitude: input.latitude.trim(),
    longitude: input.longitude.trim(),
    countryIdOrCode: input.countryIdOrCode.trim(),
  };
}

export function cityToFormValues(
  city: City,
  fallbackCountryIdOrCode: string,
): CityInput {
  return {
    name: city.name,
    stateCode: city.stateCode ?? "",
    latitude: city.latitude ?? "",
    longitude: city.longitude ?? "",
    countryIdOrCode: city.countryIdOrCode ?? fallbackCountryIdOrCode,
  };
}
