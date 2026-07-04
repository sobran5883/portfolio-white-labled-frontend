"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/lib/AuthContext";

export default function RegisterPage() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // OTP step
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [resending, setResending] = useState(false);

  // Ticks the "Resend code in Xs" countdown while the modal is open.
  useEffect(() => {
    if (!otpOpen || resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpOpen, resendIn]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      setOtp("");
      setOtpError("");
      setResendIn(60);
      setOtpOpen(true);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onVerify = async (e) => {
    e.preventDefault();
    setOtpError("");
    setVerifying(true);
    try {
      await verifyOtp(email, otp);
      // TOTP is mandatory — new accounts go straight to enrollment.
      router.push("/totp-setup");
    } catch (err) {
      setOtpError(err.message || "Verification failed.");
      // The pending registration is gone (expired / too many attempts) —
      // send the user back to the form to start over.
      if (err.status === 429 || /register again/i.test(err.message || "")) {
        setOtpOpen(false);
        setError(err.message);
      }
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    setOtpError("");
    setResending(true);
    try {
      await resendOtp(email);
      setOtp("");
      setResendIn(60);
    } catch (err) {
      setOtpError(err.message || "Could not resend the code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#232329] rounded-2xl border border-white/5 p-8">
        <Link href="/" className="text-2xl font-semibold">
          Folionce<span className="text-accent">.</span>
        </Link>
        <h1 className="text-2xl font-semibold mt-6 mb-1">Create your account</h1>
        <p className="text-white/60 text-sm mb-6">
          Start building your portfolio in minutes.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PasswordInput
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-white/60 text-sm mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>

      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
          <div className="w-full max-w-sm bg-[#232329] rounded-2xl border border-white/5 p-8">
            <h2 className="text-xl font-semibold mb-1">Verify your email</h2>
            <p className="text-white/60 text-sm mb-6">
              We sent a 6-digit code to <span className="text-white">{email}</span>.
            </p>

            {otpError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {otpError}
              </div>
            )}

            <form onSubmit={onVerify} className="flex flex-col gap-4">
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
              <Button type="submit" disabled={verifying || otp.length !== 6}>
                {verifying ? "Verifying…" : "Verify & create account"}
              </Button>
            </form>

            <div className="flex items-center justify-between mt-6 text-sm">
              <button
                type="button"
                onClick={() => setOtpOpen(false)}
                className="text-white/60 hover:text-white"
              >
                Change email
              </button>
              {resendIn > 0 ? (
                <span className="text-white/60">Resend code in {resendIn}s</span>
              ) : (
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resending}
                  className="text-accent hover:underline disabled:opacity-50"
                >
                  {resending ? "Sending…" : "Resend code"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
