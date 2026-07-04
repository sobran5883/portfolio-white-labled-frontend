"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { api } from "@/lib/api";
import { registerStepUpHandler } from "@/lib/reauth-coordinator";
import { useAuth } from "@/lib/AuthContext";

const StepUpContext = createContext(null);

/**
 * Mounts one global re-auth modal and registers it with the coordinator.
 * When a sensitive write gets `401 reauth_required`, api.js awaits this
 * modal; confirming re-proves credentials server-side and the original
 * request is retried once.
 */
export function StepUpReauthProvider({ children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const resolverRef = useRef(null);

  useEffect(() => {
    const unregister = registerStepUpHandler(
      () =>
        new Promise((resolve) => {
          resolverRef.current = resolve;
          setPassword("");
          setCode("");
          setError("");
          setOpen(true);
        })
    );
    return unregister;
  }, []);

  const settle = useCallback((ok) => {
    setOpen(false);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    if (resolve) resolve(ok);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.reauth({ password, code: code || undefined });
      settle(true);
    } catch (err) {
      setError(err.message || "Could not confirm your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StepUpContext.Provider value={{}}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
          <div className="w-full max-w-sm bg-[#232329] rounded-2xl border border-white/5 p-8">
            <h2 className="text-xl font-semibold mb-1">Confirm it&apos;s you</h2>
            <p className="text-white/60 text-sm mb-6">
              This action is sensitive — please re-enter your credentials.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <PasswordInput
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
              {user?.totpEnabled && (
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="Authenticator code"
                  className="text-center tracking-[0.5em]"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                />
              )}
              <Button type="submit" disabled={submitting || !password}>
                {submitting ? "Confirming…" : "Confirm"}
              </Button>
              <button
                type="button"
                onClick={() => settle(false)}
                className="text-white/60 hover:text-white text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </StepUpContext.Provider>
  );
}

export function useStepUp() {
  return useContext(StepUpContext);
}
