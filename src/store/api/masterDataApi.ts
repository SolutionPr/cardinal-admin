import { resolveApiMessage } from "@/lib/api";
import {
  normalizeCountriesResponse,
  normalizeCountryMutationResponse,
  toCountryPayload,
  type CountriesResponse,
  type Country,
  type CountryInput,
  type CountryMutationResponse,
} from "@/services/country.service";
import {
  normalizeCitiesPageResponse,
  normalizeCityMutationResponse,
  toCityPayload,
  type CitiesPageResult,
  type CitiesQueryParams,
  type CitiesResponse,
  type City,
  type CityInput,
  type CityMutationResponse,
} from "@/services/city.service";
import {
  normalizeBusinessTypesResponse,
  normalizeSupportedBusinessTypesResponse,
  type AttachBusinessTypeInput,
  type BusinessType,
  type BusinessTypesResponse,
  type SupportedBusinessType,
} from "@/services/business-type.service";
import {
  normalizeLegalEntitiesResponse,
  normalizeLegalEntityMutationResponse,
  toLegalEntityPayload,
  type LegalEntity,
  type LegalEntityInput,
  type LegalEntitiesResponse,
  type LegalEntityMutationResponse,
} from "@/services/legal-entity.service";
import {
  normalizePlansResponse,
  normalizePlanUpdateResponse,
  type PricingPlan,
  type PlansResponse,
  type UpdatePlanInput,
  type PlanUpdateResponse,
} from "@/services/plans.service";
import { baseApi } from "./baseApi";

const countriesTag = [{ type: "Countries" as const, id: "LIST" }];
const citiesTag = [{ type: "Cities" as const, id: "LIST" }];
const businessTypesTag = [{ type: "BusinessTypes" as const, id: "LIST" }];
const plansTag = [{ type: "Plans" as const, id: "LIST" }];

export const masterDataApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCountries: builder.query<Country[], void>({
      query: () => "/admin/countries",
      transformResponse: (response: CountriesResponse) =>
        normalizeCountriesResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to load countries.",
      providesTags: countriesTag,
    }),
    createCountry: builder.mutation<Country, CountryInput>({
      query: (body) => ({
        url: "/admin/country",
        method: "POST",
        body: toCountryPayload(body),
      }),
      transformResponse: (response: CountryMutationResponse) =>
        normalizeCountryMutationResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to create country.",
      invalidatesTags: countriesTag,
    }),
    updateCountry: builder.mutation<
      Country,
      { idOrCode: string; body: CountryInput }
    >({
      query: ({ idOrCode, body }) => ({
        url: `/admin/country/${encodeURIComponent(idOrCode)}`,
        method: "PATCH",
        body: toCountryPayload(body),
      }),
      transformResponse: (response: CountryMutationResponse) =>
        normalizeCountryMutationResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to update country.",
      invalidatesTags: countriesTag,
    }),
    deleteCountry: builder.mutation<{ message?: string }, string>({
      query: (idOrCode) => ({
        url: `/admin/country/${encodeURIComponent(idOrCode)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => ({
        message: resolveApiMessage(response) ?? undefined,
      }),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to delete country.",
      invalidatesTags: countriesTag,
    }),
    getCities: builder.query<CitiesPageResult, CitiesQueryParams>({
      query: ({ countryIdOrCode, page = 1, limit = 10, search }) => ({
        url: `/admin/country/${encodeURIComponent(countryIdOrCode)}/cities`,
        params: {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
        },
      }),
      transformResponse: (response: CitiesResponse, _meta, arg) =>
        normalizeCitiesPageResponse(response, arg),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to load cities.",
      providesTags: citiesTag,
    }),
    createCity: builder.mutation<City, CityInput>({
      query: (body) => ({
        url: "/admin/city",
        method: "POST",
        body: toCityPayload(body),
      }),
      transformResponse: (response: CityMutationResponse) =>
        normalizeCityMutationResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to create city.",
      invalidatesTags: citiesTag,
    }),
    updateCity: builder.mutation<City, { id: string; body: CityInput }>({
      query: ({ id, body }) => ({
        url: `/admin/city/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: toCityPayload(body),
      }),
      transformResponse: (response: CityMutationResponse) =>
        normalizeCityMutationResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to update city.",
      invalidatesTags: citiesTag,
    }),
    deleteCity: builder.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/admin/city/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => ({
        message: resolveApiMessage(response) ?? undefined,
      }),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to delete city.",
      invalidatesTags: citiesTag,
    }),
    getBusinessTypes: builder.query<BusinessType[], void>({
      query: () => "/admin/business-types",
      transformResponse: (response: BusinessTypesResponse) =>
        normalizeBusinessTypesResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to load business types.",
      providesTags: businessTypesTag,
    }),
    getCountryBusinessTypes: builder.query<SupportedBusinessType[], string>({
      query: (countryCode) =>
          `/admin/country/${encodeURIComponent(countryCode)}/business-types`,
      transformResponse: (response: BusinessTypesResponse) =>
        normalizeSupportedBusinessTypesResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ??
        "Unable to load business types for this country.",
      providesTags: (_result, _error, countryCode) => [
        { type: "BusinessTypes" as const, id: `country-${countryCode}` },
      ],
    }),
    attachBusinessTypeToCountry: builder.mutation<
      { message?: string },
      AttachBusinessTypeInput
    >({
      query: (body) => ({
        url: "/admin/country/business-type",
        method: "POST",
        body: {
          countryId: body.countryId,
          businessTypeId: body.businessTypeId,
        },
      }),
      transformResponse: (response: unknown) => ({
        message: resolveApiMessage(response) ?? undefined,
      }),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ??
        "Unable to attach business type to country.",
      invalidatesTags: [{ type: "BusinessTypes" as const }],
    }),
    detachBusinessTypeFromCountry: builder.mutation<
      { message?: string },
      AttachBusinessTypeInput
    >({
      query: ({ countryId, businessTypeId }) => ({
        url: `/admin/country/${encodeURIComponent(countryId)}/business-type/${encodeURIComponent(businessTypeId)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => ({
        message: resolveApiMessage(response) ?? undefined,
      }),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ??
        "Unable to detach business type from country.",
      invalidatesTags: [{ type: "BusinessTypes" as const }],
    }),
    getLegalEntities: builder.query<LegalEntity[], string>({
      query: (supportedBusinessTypeId) =>
        `/admin/business-type/${encodeURIComponent(supportedBusinessTypeId)}/legal-entities`,
      transformResponse: (response: LegalEntitiesResponse) =>
        normalizeLegalEntitiesResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ??
        "Unable to load legal entities for this business type.",
      providesTags: (_result, _error, supportedBusinessTypeId) => [
        {
          type: "LegalEntities" as const,
          id: `sbt-${supportedBusinessTypeId}`,
        },
      ],
    }),
    createLegalEntity: builder.mutation<LegalEntity, LegalEntityInput>({
      query: (body) => ({
        url: "/admin/legal-entity",
        method: "POST",
        body: toLegalEntityPayload(body),
      }),
      transformResponse: (response: LegalEntityMutationResponse) =>
        normalizeLegalEntityMutationResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to create legal entity.",
      invalidatesTags: [{ type: "LegalEntities" as const }],
    }),
    deleteLegalEntity: builder.mutation<{ message?: string }, string>({
      query: (id) => ({
        url: `/admin/legal-entity/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => ({
        message: resolveApiMessage(response) ?? undefined,
      }),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to delete legal entity.",
      invalidatesTags: [{ type: "LegalEntities" as const }],
    }),
    getPlans: builder.query<PricingPlan[], void>({
      query: () => "/admin/plans",
      transformResponse: (response: PlansResponse) =>
        normalizePlansResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to load pricing plans.",
      providesTags: plansTag,
    }),
    updatePlan: builder.mutation<PricingPlan, { id: string; body: UpdatePlanInput }>({
      query: ({ id, body }) => ({
        url: `/admin/plan/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: PlanUpdateResponse) =>
        normalizePlanUpdateResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to update pricing plan.",
      invalidatesTags: plansTag,
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
  useGetCitiesQuery,
  useCreateCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
  useGetBusinessTypesQuery,
  useGetCountryBusinessTypesQuery,
  useAttachBusinessTypeToCountryMutation,
  useDetachBusinessTypeFromCountryMutation,
  useGetLegalEntitiesQuery,
  useCreateLegalEntityMutation,
  useDeleteLegalEntityMutation,
  useGetPlansQuery,
  useUpdatePlanMutation,
} = masterDataApi;
