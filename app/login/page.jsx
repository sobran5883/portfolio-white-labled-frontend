"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { login, totpVerify, totpBackupVerify } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // TOTP step (shown when the account has 2FA enrolled)
  const [challenge, setChallenge] = useState(null);
  const [useBackup, setUseBackup] = useState(false);
  const [code, setCode] = useState("");

  const afterTokens = (res) => {
    router.push(res.totp_enrollment_required ? "/totp-setup" : "/dashboard");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.totp_required) {
        setChallenge(res.totp_challenge);
        setCode("");
        setUseBackup(false);
      } else {
        afterTokens(res);
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = useBackup
        ? await totpBackupVerify(challenge, code)
        : await totpVerify(challenge, code);
      afterTokens(res);
    } catch (err) {
      setError(err.message || "Verification failed.");
      // The challenge is single-session and short-lived; when it dies the
      // user has to start from the password step again.
      if (err.code === "challenge_expired") {
        setChallenge(null);
        setCode("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#232329] rounded-2xl border border-white/5 p-8">
        <Link href="/" className="text-2xl font-semibold">
          Folionce<span className="text-accent">.</span>
        </Link>

        {!challenge ? (
          <>
            <h1 className="text-2xl font-semibold mt-6 mb-1">Welcome back</h1>
            <p className="text-white/60 text-sm mb-6">Log in to manage your portfolio.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <PasswordInput
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? "Logging in…" : "Log in"}
              </Button>
            </form>

            <p className="text-white/60 text-sm mt-6 text-center">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-accent hover:underline">
                Sign up
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mt-6 mb-1">Two-factor authentication</h1>
            <p className="text-white/60 text-sm mb-6">
              {useBackup
                ? "Enter one of your one-time backup codes."
                : "Enter the 6-digit code from your authenticator app."}
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={onVerifyCode} className="flex flex-col gap-4">
              <Input
                type="text"
                inputMode={useBackup ? "text" : "numeric"}
                autoComplete="one-time-code"
                maxLength={useBackup ? 11 : 6}
                placeholder={useBackup ? "XXXXX-XXXXX" : "6-digit code"}
                className="text-center tracking-[0.3em]"
                value={code}
                onChange={(e) =>
                  setCode(
                    useBackup
                      ? e.target.value.toUpperCase()
                      : e.target.value.replace(/\D/g, "")
                  )
                }
                autoFocus
                required
              />
              <Button type="submit" disabled={submitting || !code}>
                {submitting ? "Verifying…" : "Verify"}
              </Button>
            </form>

            <div className="flex items-center justify-between mt-6 text-sm">
              <button
                type="button"
                onClick={() => {
                  setChallenge(null);
                  setError("");
                }}
                className="text-white/60 hover:text-white"
              >
                Back to login
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseBackup((v) => !v);
                  setCode("");
                  setError("");
                }}
                className="text-accent hover:underline"
              >
                {useBackup ? "Use authenticator code" : "Use a backup code"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
