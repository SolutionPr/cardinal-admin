export const AUTH_STORAGE_KEY = "cardinal_crm_auth";
export const AUTH_TOKEN_KEY = "cardinal_crm_token";
export const AUTH_REFRESH_TOKEN_KEY = "cardinal_crm_refresh_token";

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const rawUser = localStorage.getItem(AUTH_STORAGE_KEY);
    const accessToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!rawUser || !accessToken) return null;

    const user = JSON.parse(rawUser) as AuthUser;
    if (!user?.email) return null;

    const refreshToken =
      localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) ?? undefined;

    return { user, accessToken, refreshToken };
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  return getStoredSession()?.user ?? null;
}

export function setStoredSession(session: AuthSession): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session.user));
  localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);

  if (session.refreshToken) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, session.refreshToken);
  } else {
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
}

export function clearStoredUser(): void {
  clearStoredSession();
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "User";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getInitials(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (email.slice(0, 2) || "AU").toUpperCase();
}

export function canLogin(email: string, password: string): boolean {
  return email.trim().length > 0 && password.trim().length > 0;
}
