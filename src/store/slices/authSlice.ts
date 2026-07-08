import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
  type AuthUser,
} from "@/lib/auth";
import { clearMfaPending } from "@/lib/mfa-pending";
import type {
  AdminProfile,
  LoginResult,
  RefreshTokenResult,
} from "@/services/auth.service";

interface AuthState {
  user: AuthUser | null;
  profile: AdminProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,
};

function persistSession(
  state: AuthState,
  user: AuthUser,
  accessToken: string,
  refreshToken?: string | null,
): void {
  setStoredSession({
    user,
    accessToken,
    refreshToken: refreshToken ?? state.refreshToken ?? undefined,
  });
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(state) {
      const session = getStoredSession();
      if (session) {
        state.user = session.user;
        state.accessToken = session.accessToken;
        state.refreshToken = session.refreshToken ?? null;
      }
      state.isHydrated = true;
    },
    setSession(state, action: PayloadAction<LoginResult>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? null;
      persistSession(
        state,
        action.payload.user,
        action.payload.accessToken,
        action.payload.refreshToken,
      );
    },
    updateTokens(state, action: PayloadAction<RefreshTokenResult>) {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      if (state.user) {
        persistSession(
          state,
          state.user,
          action.payload.accessToken,
          action.payload.refreshToken ?? state.refreshToken,
        );
      }
    },
    setProfile(state, action: PayloadAction<AdminProfile>) {
      state.profile = action.payload;
      const user = {
        id: action.payload.id,
        email: action.payload.email,
        name: action.payload.name,
      };
      state.user = user;
      if (state.accessToken) {
        persistSession(state, user, state.accessToken);
      }
    },
    logout(state) {
      clearStoredSession();
      clearMfaPending();
      state.user = null;
      state.profile = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { hydrateAuth, setSession, updateTokens, setProfile, logout } =
  authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthProfile = (state: { auth: AuthState }) => state.auth.profile;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.accessToken && state.auth.user);
export const selectAuthHydrated = (state: { auth: AuthState }) =>
  state.auth.isHydrated;
