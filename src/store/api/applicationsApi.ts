import { baseApi } from "./baseApi";

export interface CompanyProfile {
  id: string;
  applicationId: string;
  countryId: string;
  legalFormId: string;
  entityTypeId: string;
  businessLegalName: string;
  currentStep: number;
  kycStatus: string;
  kycAttempts?: number;
  kycRejectionReason?: string | null;
  registrationNumber: string;
  registrationDate: string;
  vatNumber: string;
  website: string | null;
  brandName: string | null;
  registeredAddressId: string;
  operatingAddressId: string;
  createdAt: string;
  updatedAt: string;
  country: {
    id: string;
    isActive: boolean;
    code: string;
    name: string;
    phonePrefix: string;
    createdAt: string;
    isSupported: boolean;
  };
  legalForm: {
    id: string;
    businessTypeId: string;
    countryId: string;
    businessType: {
      id: string;
      name: string;
      description: string;
      isActive: boolean;
      createdAt: string;
    };
  };
  entityType: {
    id: string;
    name: string;
    code: string;
    supportedBusinessTypeId: string;
  };
  registeredAddress?: {
    id: string;
    countryId: string;
    cityId: string;
    postalCode: string;
    street: string;
    houseNumber: string;
    additionalInfo: string | null;
    createdAt: string;
    updatedAt: string;
    country: {
      id: string;
      isActive: boolean;
      code: string;
      name: string;
      phonePrefix: string;
      createdAt: string;
      isSupported: boolean;
    };
    city: {
      id: string;
      name: string;
      stateCode: string;
      latitude: string;
      longitude: string;
      countryId: string;
      createdAt: string;
    };
  };
  operatingAddress?: {
    id: string;
    countryId: string;
    cityId: string;
    postalCode: string;
    street: string;
    houseNumber: string;
    additionalInfo: string | null;
    createdAt: string;
    updatedAt: string;
    country: {
      id: string;
      isActive: boolean;
      code: string;
      name: string;
      phonePrefix: string;
      createdAt: string;
      isSupported: boolean;
    };
    city: {
      id: string;
      name: string;
      stateCode: string;
      latitude: string;
      longitude: string;
      countryId: string;
      createdAt: string;
    };
  };
  application?: {
    applicantId: string;
  };
  businessDetail?: any;
  persons?: any[];
  businessDetailCountries?: any[];
  businessFundCountries?: any[];
  completionPercentage?: number;
}

export interface CompanyProfilesResponse {
  success: boolean;
  statusCode: number;
  type: string;
  message: string;
  data: {
    profiles: CompanyProfile[];
    page: number;
    total: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleCompanyProfileResponse {
  success: boolean;
  statusCode: number;
  type: string;
  message: string;
  data: CompanyProfile;
}

export interface AssociatedPerson {
  id: string;
  applicationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  ownershipPercentage: string | null;
  dateOfBirth: string | null;
  countryOfBirthId: string | null;
  countryOfCitizenshipId: string | null;
  residenceCountryId: string | null;
  cityOfResidenceId: string | null;
  postalCode: string | null;
  street: string | null;
  houseNumber: string | null;
  additionalInfo: string | null;
  kycStatus: string;
  kycAttempts: number;
  kycRejectionReason: string | null;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  countryOfBirth?: {
    id: string;
    isActive: boolean;
    code: string;
    name: string;
    phonePrefix: string;
    isSupported: boolean;
  } | null;
  countryOfCitizenship?: {
    id: string;
    isActive: boolean;
    code: string;
    name: string;
    phonePrefix: string;
    isSupported: boolean;
  } | null;
  residenceCountry?: {
    id: string;
    isActive: boolean;
    code: string;
    name: string;
    phonePrefix: string;
    isSupported: boolean;
  } | null;
  cityOfResidence?: {
    id: string;
    name: string;
    stateCode: string;
    latitude: string;
    longitude: string;
    countryId: string;
  } | null;
  roles: Array<{
    id: string;
    role: string;
  }>;
}

export interface AssociatedPersonsData {
  directors: AssociatedPerson[];
  shareHolders: AssociatedPerson[];
  partner: AssociatedPerson[];
  applicant: AssociatedPerson[];
  owner: AssociatedPerson[];
}

export interface AssociatedPersonsResponse {
  success: boolean;
  statusCode: number;
  type: string;
  message: string;
  data: AssociatedPersonsData;
}

export interface OnboardingHistoryItem {
  title: string;
  step: number;
  completedAt: string | null;
}

export interface OnboardingHistoryResponse {
  success: boolean;
  statusCode: number;
  type: string;
  message: string;
  data: OnboardingHistoryItem[];
}

export interface PersonalApplication {
  id: string;
  phoneNumber: string;
  countryId: string;
  firstname: string;
  lastname: string;
  dob: string;
  homeAddressId: string;
  occupation: string;
  kycStatus: string;
  kycAttempts?: number;
  kycRejectionReason?: string | null;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  country: {
    id: string;
    isActive: boolean;
    code: string;
    name: string;
    phonePrefix: string;
    createdAt: string;
    isSupported: boolean;
  };
  homeAddress?: {
    id: string;
    countryId: string;
    cityId: string;
    postalCode: string;
    street: string;
    houseNumber: string;
    additionalInfo: string | null;
    createdAt: string;
    updatedAt: string;
    country: {
      id: string;
      isActive: boolean;
      code: string;
      name: string;
      phonePrefix: string;
      createdAt: string;
      isSupported: boolean;
    };
    city: {
      id: string;
      name: string;
      stateCode: string;
      latitude: string;
      longitude: string;
      countryId: string;
      createdAt: string;
    };
  };
  completionPercentage?: number;
}

export interface PersonalApplicationsResponse {
  success: boolean;
  statusCode: number;
  type: string;
  message: string;
  data: {
    applications: PersonalApplication[];
    page: number;
    total: number;
    limit: number;
    totalPages: number;
  };
}

export interface SinglePersonalApplicationResponse {
  success: boolean;
  statusCode: number;
  type: string;
  message: string;
  data: PersonalApplication;
}

export const applicationsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCompanyProfiles: builder.query<
      CompanyProfilesResponse["data"],
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search }) => ({
        url: "/admin/company-profiles",
        params: { page, limit, search: search || undefined },
      }),
      transformResponse: (response: CompanyProfilesResponse) => response.data,
      providesTags: [{ type: "CompanyProfiles" as const, id: "LIST" }],
    }),
    getCompanyProfile: builder.query<CompanyProfile, string>({
      query: (id) => `/admin/company-profile/${id}`,
      transformResponse: (response: SingleCompanyProfileResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "CompanyProfiles" as const, id }],
    }),
    getPersonalApplications: builder.query<
      PersonalApplicationsResponse["data"],
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search }) => ({
        url: "/admin/personal-applications",
        params: { page, limit, search: search || undefined },
      }),
      transformResponse: (response: PersonalApplicationsResponse) => response.data,
      providesTags: [{ type: "PersonalApplications" as const, id: "LIST" }],
    }),
    getPersonalApplication: builder.query<PersonalApplication, string>({
      query: (id) => `/admin/personal-application/${id}`,
      transformResponse: (response: SinglePersonalApplicationResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "PersonalApplications" as const, id }],
    }),
    getAssociatedPersons: builder.query<AssociatedPersonsData, string>({
      query: (id) => `/admin/company-profile/${id}/associated-persons`,
      transformResponse: (response: AssociatedPersonsResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "CompanyProfiles" as const, id: `${id}-associated-persons` }],
    }),
    getCompanyOnboardingHistory: builder.query<OnboardingHistoryItem[], string>({
      query: (id) => `/admin/company-profile/${id}/onboarding-history`,
      transformResponse: (response: OnboardingHistoryResponse) => response.data,
      providesTags: (result, error, id) => [{ type: "CompanyProfiles" as const, id: `${id}-onboarding-history` }],
    }),
    deleteAssociatedPerson: builder.mutation<
      { success: boolean; message: string },
      { companyProfileId: string; personId: string; applicationId: string; role: string }
    >({
      query: (body) => ({
        url: "/onboarding/person",
        method: "DELETE",
        body,
      }),
      invalidatesTags: (result, error, { companyProfileId }) => [
        { type: "CompanyProfiles" as const, id: companyProfileId },
        { type: "CompanyProfiles" as const, id: `${companyProfileId}-associated-persons` },
      ],
    }),
  }),
});

export const {
  useGetCompanyProfilesQuery,
  useGetCompanyProfileQuery,
  useGetPersonalApplicationsQuery,
  useGetPersonalApplicationQuery,
  useGetAssociatedPersonsQuery,
  useGetCompanyOnboardingHistoryQuery,
  useDeleteAssociatedPersonMutation,
} = applicationsApi;
