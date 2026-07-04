"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function TotpSetupPage() {
  const { user, loading, markTotpEnrolled } = useAuth();
  const router = useRouter();
  const [enroll, setEnroll] = useState(null); // { qr_data_uri, secret }
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [backupCodes, setBackupCodes] = useState(null);
  const [copied, setCopied] = useState(false);

  // Must be logged in; already-enrolled users have nothing to do here.
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.totpEnabled && !backupCodes) router.replace("/dashboard");
  }, [loading, user, backupCodes, router]);

  // Fetch a fresh secret + QR once the session is confirmed.
  useEffect(() => {
    if (loading || !user || user.totpEnabled) return;
    let cancelled = false;
    api
      .totpEnrollBegin()
      .then((res) => {
        if (!cancelled) setEnroll(res);
      })
      .catch((err) => setError(err.message || "Could not start 2FA setup."));
    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const onConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.totpEnrollConfirm({ code });
      setBackupCodes(res.backup_codes);
      markTotpEnrolled(res.user);
    } catch (err) {
      setError(err.message || "Verification failed.");
      if (err.code === "enrollment_expired") {
        setEnroll(null);
        api.totpEnrollBegin().then(setEnroll).catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        Loading…
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#232329] rounded-2xl border border-white/5 p-8">
        <Link href="/" className="text-2xl font-semibold">
          Folionce<span className="text-accent">.</span>
        </Link>

        {!backupCodes ? (
          <>
            <h1 className="text-2xl font-semibold mt-6 mb-1">Set up two-factor auth</h1>
            <p className="text-white/60 text-sm mb-6">
              Protecting your account with an authenticator app is required.
              Scan the QR code with Google Authenticator, 1Password, Authy or
              similar, then enter the 6-digit code.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            {enroll ? (
              <>
                <div className="bg-white rounded-xl p-3 w-fit mx-auto mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={enroll.qr_data_uri} alt="TOTP QR code" width={200} height={200} />
                </div>
                <p className="text-white/40 text-xs text-center mb-6 break-all">
                  Can&apos;t scan? Enter this key manually: {enroll.secret}
                </p>

                <form onSubmit={onConfirm} className="flex flex-col gap-4">
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="6-digit code"
                    className="text-center tracking-[0.5em]"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    autoFocus
                    required
                  />
                  <Button type="submit" disabled={submitting || code.length !== 6}>
                    {submitting ? "Verifying…" : "Turn on 2FA"}
                  </Button>
                </form>
              </>
            ) : (
              <p className="text-white/50 text-sm text-center py-8">Generating your key…</p>
            )}
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mt-6 mb-1">Save your backup codes</h1>
            <p className="text-white/60 text-sm mb-6">
              Each code works once if you lose access to your authenticator.
              They are shown <span className="text-white">only now</span> — store
              them somewhere safe.
            </p>

            <div className="grid grid-cols-2 gap-2 bg-primary rounded-xl border border-white/10 p-4 mb-4 font-mono text-sm">
              {backupCodes.map((c) => (
                <span key={c} className="text-center text-white/90">
                  {c}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Button type="button" onClick={copyCodes}>
                {copied ? "Copied!" : "Copy codes"}
              </Button>
              <Button type="button" onClick={() => router.push("/dashboard")}>
                I saved them — continue
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
