const MFA_PENDING_KEY = "cardinal_crm_mfa_pending";

export interface MfaPendingSession {
  tempToken: string;
  email: string;
  methods?: string[];
}

export function setMfaPending(session: MfaPendingSession): void {
  sessionStorage.setItem(MFA_PENDING_KEY, JSON.stringify(session));
}

export function getMfaPending(): MfaPendingSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(MFA_PENDING_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as MfaPendingSession;
    if (!parsed?.tempToken || !parsed?.email) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function clearMfaPending(): void {
  sessionStorage.removeItem(MFA_PENDING_KEY);
}
