import { nameFromEmail, type AuthUser } from "@/lib/auth";

export interface AdminProfileRaw {
  id?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  mfaEnabled?: boolean;
  isMfaEnabled?: boolean;
  twoFactorEnabled?: boolean;
}

export interface AdminProfile {
  id?: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  mfaEnabled?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId: string;
}

interface LoginPayload {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  tempToken?: string;
  mfaToken?: string;
  requiresMfa?: boolean;
  mfaRequired?: boolean;
  methods?: string[];
  admin?: AdminProfileRaw;
  user?: AdminProfileRaw;
}

export interface LoginResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  tempToken?: string;
  mfaToken?: string;
  requiresMfa?: boolean;
  mfaRequired?: boolean;
  admin?: AdminProfileRaw;
  user?: AdminProfileRaw;
  data?: LoginPayload;
}

export interface ProfileResponse {
  admin?: AdminProfileRaw;
  user?: AdminProfileRaw;
  data?:
    | AdminProfileRaw
    | {
        admin?: AdminProfileRaw;
        user?: AdminProfileRaw;
      };
}

export interface MfaSetupResponse {
  secret?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  otpauthUrl?: string;
  manualEntryKey?: string;
  data?: MfaSetupResponse;
}

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export interface MfaRequiredResult {
  tempToken: string;
  email: string;
  methods?: string[];
}

export type LoginOutcome =
  | { status: "authenticated"; session: LoginResult }
  | { status: "mfa_required"; pending: MfaRequiredResult };

export interface MfaVerifyRequest {
  code: string;
  tempToken: string;
  email?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId: string;
}

export interface RefreshTokenResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    token?: string;
  };
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken?: string;
}

export interface MfaSetupResult {
  secret: string;
  qrCode?: string;
  otpauthUrl?: string;
  manualEntryKey?: string;
}

export interface MfaCodeRequest {
  code: string;
}

export interface MfaDisableInitRequest {
  password: string;
}

export interface MfaDisableInitResponse {
  message?: string;
  mfaTicket?: string;
  data?: {
    message?: string;
    mfaTicket?: string;
  };
}

export interface MfaDisableInitResult {
  mfaTicket: string;
  message?: string;
}

export interface MfaDisableConfirmRequest {
  mfaTicket: string;
  code: string;
}

export interface MfaActionResponse {
  message?: string;
  success?: boolean;
  data?: MfaActionResponse;
}

export interface MfaActionResult {
  message: string;
}

function profileName(
  profile: AdminProfileRaw | undefined,
  email: string,
): string {
  if (profile?.name?.trim()) return profile.name.trim();

  const fromParts = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fromParts || nameFromEmail(email);
}

function extractProfileRaw(
  response: ProfileResponse | AdminProfileRaw,
): AdminProfileRaw | undefined {
  if ("email" in response || "id" in response || "firstName" in response) {
    return response as AdminProfileRaw;
  }

  const wrapped = response as ProfileResponse;
  const data = wrapped.data;

  if (data && typeof data === "object" && ("admin" in data || "user" in data)) {
    const nested = data as { admin?: AdminProfileRaw; user?: AdminProfileRaw };
    return nested.admin ?? nested.user;
  }

  if (data && typeof data === "object") {
    return data as AdminProfileRaw;
  }

  return wrapped.admin ?? wrapped.user;
}

export function normalizeAdminProfile(
  raw: AdminProfileRaw | undefined,
  fallbackEmail = "",
): AdminProfile | null {
  const email = raw?.email?.trim() || fallbackEmail.trim();
  if (!email) return null;

  return {
    id: raw?.id,
    email,
    name: profileName(raw, email),
    firstName: raw?.firstName,
    lastName: raw?.lastName,
    phone: raw?.phone,
    role: raw?.role,
    mfaEnabled:
      raw?.mfaEnabled ?? raw?.isMfaEnabled ?? raw?.twoFactorEnabled,
  };
}

function extractLoginPayload(response: LoginResponse): LoginPayload {
  if (response.data && typeof response.data === "object") {
    return response.data;
  }

  return response;
}

export function normalizeLoginResponse(
  response: LoginResponse,
  fallbackEmail: string,
): LoginOutcome {
  const payload = extractLoginPayload(response);
  const profile = payload.admin ?? payload.user;
  const email = profile?.email?.trim() || fallbackEmail.trim();

  const tempToken =
    payload.tempToken ?? payload.mfaToken ?? response.tempToken ?? response.mfaToken;

  const mfaRequired =
    payload.mfaRequired === true ||
    payload.requiresMfa === true ||
    response.mfaRequired === true ||
    response.requiresMfa === true;

  const accessToken =
    payload.accessToken ?? payload.token ?? response.accessToken ?? response.token;

  if (mfaRequired && tempToken) {
    return {
      status: "mfa_required",
      pending: {
        tempToken,
        email,
        methods: payload.methods,
      },
    };
  }

  if (!accessToken) {
    throw new Error("Invalid login response from server.");
  }

  return {
    status: "authenticated",
    session: {
      accessToken,
      refreshToken: payload.refreshToken ?? response.refreshToken,
      user: {
        id: profile?.id,
        email,
        name: profileName(profile, email),
      },
    },
  };
}

export function normalizeRefreshTokenResponse(
  response: RefreshTokenResponse,
): RefreshTokenResult {
  const payload = response.data ?? response;
  const accessToken =
    payload.accessToken ?? payload.token ?? response.accessToken ?? response.token;

  if (!accessToken) {
    throw new Error("Invalid refresh token response from server.");
  }

  return {
    accessToken,
    refreshToken: payload.refreshToken ?? response.refreshToken,
  };
}

export function normalizeProfileResponse(
  response: ProfileResponse,
): AdminProfile {
  const profile = normalizeAdminProfile(extractProfileRaw(response));
  if (!profile) {
    throw new Error("Invalid profile response from server.");
  }
  return profile;
}

export function normalizeMfaSetupResponse(
  response: MfaSetupResponse,
): MfaSetupResult {
  const payload = response.data ?? response;
  const secret = payload.secret ?? payload.manualEntryKey;

  if (!secret) {
    throw new Error("Invalid MFA setup response from server.");
  }

  return {
    secret,
    qrCode: payload.qrCode ?? payload.qrCodeUrl,
    otpauthUrl: payload.otpauthUrl,
    manualEntryKey: payload.manualEntryKey ?? secret,
  };
}

export function normalizeMfaActionResponse(
  response: MfaActionResponse,
): MfaActionResult {
  const payload = response.data ?? response;
  return {
    message:
      payload.message ??
      (payload.success === false
        ? "MFA action failed."
        : "MFA updated successfully."),
  };
}

export function normalizeMfaDisableInitResponse(
  response: MfaDisableInitResponse,
): MfaDisableInitResult {
  const payload = response.data ?? response;
  const mfaTicket = payload.mfaTicket;

  if (!mfaTicket) {
    throw new Error("Invalid MFA disable response from server.");
  }

  return {
    mfaTicket,
    message: payload.message ?? response.message,
  };
}
