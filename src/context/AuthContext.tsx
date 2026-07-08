"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api";
import { getInitials } from "@/lib/auth";
import { setMfaPending } from "@/lib/mfa-pending";
import type { AdminProfile, MfaSetupResult } from "@/services/auth.service";
import {
  authApi,
  useGetProfileQuery,
  useLoginMutation,
  useLogoutMutation,
  useSetupMfaMutation,
} from "@/store/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  hydrateAuth,
  logout as logoutAction,
  selectAuthHydrated,
  selectAuthProfile,
  selectAuthUser,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";

interface AuthContextType {
  user: ReturnType<typeof selectAuthUser>;
  profile: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isMfaSetupLoading: boolean;
  loginError: string | null;
  profileError: string | null;
  initials: string;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; mfaRequired?: boolean; error?: string }>;
  setupMfa: () => Promise<{ ok: boolean; data?: MfaSetupResult; error?: string }>;
  refetchProfile: () => void;
  logout: () => void;
  clearLoginError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loginMutation, { isLoading: isLoggingIn, error: loginMutationError, reset }] =
    useLoginMutation();
  const [setupMfaMutation, { isLoading: isMfaSetupLoading }] =
    useSetupMfaMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const user = useAppSelector(selectAuthUser);
  const profile = useAppSelector(selectAuthProfile);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isHydrated = useAppSelector(selectAuthHydrated);

  const {
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileQueryError,
    refetch: refetchProfile,
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  const login = useCallback(
    async (email: string, password: string) => {
      reset();
      try {
        const outcome = await loginMutation({ email, password }).unwrap();
        if (outcome.status === "mfa_required") {
          setMfaPending(outcome.pending);
          return { ok: true, mfaRequired: true };
        }
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          error: getApiErrorMessage(error),
        };
      }
    },
    [loginMutation, reset],
  );

  const setupMfa = useCallback(async () => {
    try {
      const data = await setupMfaMutation().unwrap();
      return { ok: true, data };
    } catch (error) {
      return {
        ok: false,
        error: getApiErrorMessage(error),
      };
    }
  }, [setupMfaMutation]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Clear local session even if the server logout fails.
    } finally {
      dispatch(logoutAction());
      dispatch(authApi.util.resetApiState());
      router.push("/login");
    }
  }, [dispatch, logoutMutation, router]);

  const loginError = loginMutationError
    ? getApiErrorMessage(loginMutationError)
    : null;

  const profileError = profileQueryError
    ? getApiErrorMessage(profileQueryError)
    : null;

  const initials = useMemo(
    () => (user ? getInitials(user.name, user.email) : "AU"),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      isAuthenticated,
      isLoading: !isHydrated,
      isProfileLoading: isProfileLoading || isProfileFetching,
      isLoggingIn,
      isLoggingOut,
      isMfaSetupLoading,
      loginError,
      profileError,
      initials,
      login,
      setupMfa,
      refetchProfile,
      logout,
      clearLoginError: reset,
    }),
    [
      user,
      profile,
      isAuthenticated,
      isHydrated,
      isProfileLoading,
      isProfileFetching,
      isLoggingIn,
      isLoggingOut,
      isMfaSetupLoading,
      loginError,
      profileError,
      initials,
      login,
      setupMfa,
      refetchProfile,
      logout,
      reset,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
