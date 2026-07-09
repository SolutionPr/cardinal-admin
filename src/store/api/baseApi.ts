import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { env } from "@/config/env";
import { getAccessToken, getRefreshToken } from "@/lib/auth";
import { getDeviceId } from "@/lib/device";
import { normalizeRefreshTokenResponse } from "@/services/auth.service";
import { logout, updateTokens } from "@/store/slices/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const AUTH_SKIP_REFRESH_PATHS = [
  "/admin/auth/login",
  "/admin/auth/refresh",
  "/admin/auth/mfa/verify",
  "/admin/auth/logout",
];

function getRequestUrl(args: string | FetchArgs): string {
  return typeof args === "string" ? args : args.url;
}

function shouldSkipRefresh(args: string | FetchArgs): boolean {
  const url = getRequestUrl(args);
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (!env.apiBaseUrl) {
    return {
      error: {
        status: 0,
        data: "API URL is not configured. Set NEXT_PUBLIC_API_URL in your environment.",
      },
    };
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    !shouldSkipRefresh(args)
  ) {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: "/admin/auth/refresh",
        method: "POST",
        body: {
          refreshToken,
          deviceId: getDeviceId(),
        },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      try {
        const tokens = normalizeRefreshTokenResponse(refreshResult.data);
        api.dispatch(updateTokens(tokens));
        result = await rawBaseQuery(args, api, extraOptions);
      } catch {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["Auth", "Countries", "Cities", "BusinessTypes", "LegalEntities", "CompanyProfiles", "PersonalApplications", "Plans"],
  endpoints: () => ({}),
});
