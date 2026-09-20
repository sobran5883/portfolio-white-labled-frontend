"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState("email"); // "email" | "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [resending, setResending] = useState(false);

  // Ticks the "Resend code in Xs" countdown while on the reset step.
  useEffect(() => {
    if (step !== "reset" || resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, resendIn]);

  const requestCode = async (e) => {
    e?.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.forgotPassword({ email });
      setStep("reset");
      setResendIn(60);
    } catch (err) {
      setError(err.message || "Could not send a reset code.");
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError("");
    setResending(true);
    try {
      await api.forgotPassword({ email });
      setOtp("");
      setResendIn(60);
    } catch (err) {
      setError(err.message || "Could not resend the code.");
    } finally {
      setResending(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await api.resetPassword({ email, otp, newPassword: password });
      router.push("/login");
    } catch (err) {
      setError(err.message || "Could not reset your password.");
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

        {step === "email" ? (
          <>
            <h1 className="text-2xl font-semibold mt-6 mb-1">Forgot your password?</h1>
            <p className="text-white/60 text-sm mb-6">
              Enter your account email and we&apos;ll send you a code to reset it.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={requestCode} className="flex flex-col gap-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              <Button type="submit" disabled={submitting || !email}>
                {submitting ? "Sending…" : "Send reset code"}
              </Button>
            </form>

            <p className="text-white/60 text-sm mt-6 text-center">
              Remembered it?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Back to login
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mt-6 mb-1">Reset your password</h1>
            <p className="text-white/60 text-sm mb-6">
              Enter the 6-digit code sent to{" "}
              <span className="text-white">{email}</span> and choose a new password.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={submitReset} className="flex flex-col gap-4">
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="6-digit code"
                className="text-center tracking-[0.5em]"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                autoFocus
                required
              />
              <PasswordInput
                placeholder="New password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <PasswordInput
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
              <Button type="submit" disabled={submitting || otp.length !== 6}>
                {submitting ? "Resetting…" : "Reset password"}
              </Button>
            </form>

            <div className="flex items-center justify-between mt-6 text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                  setOtp("");
                }}
                className="text-white/60 hover:text-white"
              >
                Change email
              </button>
              {resendIn > 0 ? (
                <span className="text-white/60">Resend code in {resendIn}s</span>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  disabled={resending}
                  className="text-accent hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending…" : "Resend code"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
