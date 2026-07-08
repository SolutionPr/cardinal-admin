import { resolveApiMessage } from "@/lib/api";
import { getRefreshToken } from "@/lib/auth";
import { clearMfaPending } from "@/lib/mfa-pending";
import { getDeviceId } from "@/lib/device";
import {
  normalizeLoginResponse,
  normalizeMfaActionResponse,
  normalizeMfaDisableInitResponse,
  normalizeMfaSetupResponse,
  normalizeProfileResponse,
  normalizeRefreshTokenResponse,
  type AdminProfile,
  type LoginOutcome,
  type LoginResponse,
  type LoginResult,
  type MfaActionResponse,
  type MfaActionResult,
  type MfaCodeRequest,
  type MfaDisableConfirmRequest,
  type MfaDisableInitRequest,
  type MfaDisableInitResponse,
  type MfaDisableInitResult,
  type MfaSetupResponse,
  type MfaSetupResult,
  type MfaVerifyRequest,
  type ProfileResponse,
  type RefreshTokenResponse,
  type RefreshTokenResult,
} from "@/services/auth.service";
import { setProfile, setSession, updateTokens } from "@/store/slices/authSlice";
import { baseApi } from "./baseApi";

export interface LoginCredentials {
  email: string;
  password: string;
}

const profileTag = [{ type: "Auth" as const, id: "Profile" }];

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginOutcome, LoginCredentials>({
      query: ({ email, password }) => ({
        url: "/admin/auth/login",
        method: "POST",
        body: {
          email: email.trim(),
          password,
          deviceId: getDeviceId(),
        },
      }),
      transformResponse: (response: LoginResponse, _meta, { email }) =>
        normalizeLoginResponse(response, email.trim()),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to sign in. Please try again.",
      invalidatesTags: profileTag,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status === "authenticated") {
            dispatch(setSession(data.session));
          }
        } catch {
          // Error state is handled by the mutation hook.
        }
      },
    }),
    verifyMfa: builder.mutation<LoginResult, MfaVerifyRequest>({
      query: ({ code, tempToken }) => ({
        url: "/admin/auth/mfa/verify",
        method: "POST",
        body: {
          code,
          tempToken,
          deviceId: getDeviceId(),
        },
      }),
      transformResponse: (response: LoginResponse, _meta, arg) => {
        const outcome = normalizeLoginResponse(response, arg.email ?? "");
        if (outcome.status !== "authenticated") {
          throw new Error("Invalid MFA verification response from server.");
        }
        return outcome.session;
      },
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ??
        "Invalid verification code. Please try again.",
      invalidatesTags: profileTag,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setSession(data));
          clearMfaPending();
        } catch {
          // Error state is handled by the mutation hook.
        }
      },
    }),
    getProfile: builder.query<AdminProfile, void>({
      query: () => "/admin/auth/profile",
      transformResponse: (response: ProfileResponse) =>
        normalizeProfileResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to load profile.",
      providesTags: profileTag,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setProfile(data));
        } catch {
          // Error state is handled by the query hook.
        }
      },
    }),
    setupMfa: builder.mutation<MfaSetupResult, void>({
      query: () => ({
        url: "/admin/auth/mfa/setup",
        method: "POST",
      }),
      transformResponse: (response: MfaSetupResponse) =>
        normalizeMfaSetupResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to start MFA setup.",
    }),
    enableMfa: builder.mutation<MfaActionResult, MfaCodeRequest>({
      query: (body) => ({
        url: "/admin/auth/mfa/enable",
        method: "POST",
        body,
      }),
      transformResponse: (response: MfaActionResponse) =>
        normalizeMfaActionResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to enable MFA.",
      invalidatesTags: profileTag,
    }),
    disableMfaInit: builder.mutation<MfaDisableInitResult, MfaDisableInitRequest>({
      query: (body) => ({
        url: "/admin/auth/mfa/disable",
        method: "POST",
        body,
      }),
      transformResponse: (response: MfaDisableInitResponse) =>
        normalizeMfaDisableInitResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to start MFA disable.",
    }),
    disableMfaConfirm: builder.mutation<MfaActionResult, MfaDisableConfirmRequest>({
      query: (body) => ({
        url: "/admin/auth/mfa/disable-confirm",
        method: "POST",
        body,
      }),
      transformResponse: (response: MfaActionResponse) =>
        normalizeMfaActionResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to disable MFA.",
      invalidatesTags: profileTag,
    }),
    logout: builder.mutation<MfaActionResult, void>({
      query: () => ({
        url: "/admin/auth/logout",
        method: "POST",
      }),
      transformResponse: (response: MfaActionResponse) =>
        normalizeMfaActionResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to sign out.",
    }),
    refreshToken: builder.mutation<RefreshTokenResult, void>({
      query: () => ({
        url: "/admin/auth/refresh",
        method: "POST",
        body: {
          refreshToken: getRefreshToken() ?? "",
          deviceId: getDeviceId(),
        },
      }),
      transformResponse: (response: RefreshTokenResponse) =>
        normalizeRefreshTokenResponse(response),
      transformErrorResponse: (response: unknown) =>
        resolveApiMessage(response) ?? "Unable to refresh session.",
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateTokens(data));
        } catch {
          // Error state is handled by the mutation hook.
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyMfaMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useSetupMfaMutation,
  useEnableMfaMutation,
  useDisableMfaInitMutation,
  useDisableMfaConfirmMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi;
