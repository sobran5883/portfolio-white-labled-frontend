"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { api, refreshAccessToken } from "@/lib/api";
import { setAccessToken, getAccessTokenExpiresAt } from "@/lib/token-store";

const AuthContext = createContext(null);

// Refresh one minute before expiry; floor guards a tight loop when a token
// is restored nearly expired (e.g. after laptop sleep).
const REFRESH_LEAD_MS = 60 * 1000;
const MIN_REFRESH_DELAY_MS = 5 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True until the bootstrap probe settles — guards must not redirect
  // (or render) before this flips, or every hard refresh looks logged-out.
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  }, []);

  // One timer, re-armed after every refresh: while a tab is open the access
  // token never actually reaches expiry.
  const scheduleRefresh = useCallback(() => {
    clearRefreshTimer();
    const expiresAt = getAccessTokenExpiresAt();
    if (!expiresAt) return;
    const delay = Math.max(expiresAt - Date.now() - REFRESH_LEAD_MS, MIN_REFRESH_DELAY_MS);
    refreshTimer.current = setTimeout(async () => {
      const data = await refreshAccessToken();
      if (data) {
        setUser(data.user);
        scheduleRefresh();
      } else {
        setUser(null); // session revoked/expired server-side
      }
    }, delay);
  }, [clearRefreshTimer]);

  /** Installs tokens from login / TOTP verify / signup OTP verify. */
  const setTokens = useCallback(
    (res) => {
      setAccessToken(res.token, res.expires_in);
      setUser(res.user);
      scheduleRefresh();
      return res;
    },
    [scheduleRefresh]
  );

  // Bootstrap probe: the access token lives only in memory, so a hard
  // refresh starts logged-out; the httpOnly refresh cookie silently
  // restores the session.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await refreshAccessToken();
      if (cancelled) return;
      if (data) {
        setUser(data.user);
        scheduleRefresh();
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
      clearRefreshTimer();
    };
  }, [scheduleRefresh, clearRefreshTimer]);

  /**
   * Returns the raw response: `{ totp_required, totp_challenge }` when a
   * code is owed (no session yet), otherwise tokens are installed and
   * `totp_enrollment_required` tells the caller where to navigate.
   */
  const login = useCallback(
    async (email, password) => {
      const res = await api.login({ email, password });
      if (res.totp_required) return res;
      return setTokens(res);
    },
    [setTokens]
  );

  // Step 1 of signup: no session yet — the backend emails an OTP and holds
  // the registration until verifyOtp succeeds.
  const register = useCallback(async (name, email, password) => {
    return api.register({ name, email, password });
  }, []);

  // Step 2 of signup: a correct OTP creates the account and signs the user in.
  const verifyOtp = useCallback(
    async (email, otp) => {
      return setTokens(await api.verifyOtp({ email, otp }));
    },
    [setTokens]
  );

  const resendOtp = useCallback(async (email) => {
    return api.resendOtp({ email });
  }, []);

  /** Finishes a TOTP-gated login. */
  const totpVerify = useCallback(
    async (challenge, code) => {
      return setTokens(await api.totpVerify({ challenge, code }));
    },
    [setTokens]
  );

  const totpBackupVerify = useCallback(
    async (challenge, code) => {
      return setTokens(await api.totpBackupVerify({ challenge, code }));
    },
    [setTokens]
  );

  /** Marks TOTP as enrolled locally after a successful enroll/confirm. */
  const markTotpEnrolled = useCallback((safeUser) => {
    setUser(safeUser);
  }, []);

  const logout = useCallback(() => {
    clearRefreshTimer();
    api.logout().catch(() => {}); // fire-and-forget; revokes server-side
    setAccessToken(null);
    setUser(null);
  }, [clearRefreshTimer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        totpVerify,
        totpBackupVerify,
        markTotpEnrolled,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
