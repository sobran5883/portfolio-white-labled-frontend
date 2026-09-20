"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, Field } from "@/components/dashboard/ui";
import Header from "@/components/dashboard/Header";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

/** One-time backup codes grid, shown right after enrolling or regenerating. */
function BackupCodes({ codes }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-white/60">
        Save these one-time backup codes somewhere safe. Each works once if you
        lose your authenticator. They&apos;re shown{" "}
        <span className="text-white">only now</span>.
      </p>
      <div className="grid grid-cols-2 gap-2 bg-primary rounded-xl border border-white/10 p-4 font-mono text-sm">
        {codes.map((c) => (
          <span key={c} className="text-center text-white/90">
            {c}
          </span>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={copy} className="self-start">
        {copied ? "Copied!" : "Copy codes"}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ProfileSection({ notify }) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const dirty = name.trim().length > 0 && name.trim() !== (user?.name || "");

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.updateProfile({ name: name.trim() });
      updateUser(res.user);
      notify("success", "Name updated.");
    } catch (err) {
      notify("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Profile">
      <Field label="Name" value={name} onChange={setName} placeholder="Your name" />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-white/60">Email</span>
        <input
          value={user?.email || ""}
          disabled
          className="bg-[#1c1c22] border border-white/10 rounded-lg px-3 py-2 text-white/50 outline-none cursor-not-allowed"
        />
      </label>
      <Button onClick={save} size="sm" disabled={!dirty || saving} className="self-start">
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

function PasswordSection({ notify }) {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  // Email-OTP reset sub-flow, for when the current password is forgotten.
  const [resetStage, setResetStage] = useState("idle"); // "idle" | "code"
  const [otp, setOtp] = useState("");
  const [resetPass, setResetPass] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

  const change = async (e) => {
    e.preventDefault();
    if (next.length < 6) return notify("error", "New password must be at least 6 characters.");
    if (next !== confirm) return notify("error", "New passwords don't match.");
    setSaving(true);
    try {
      await api.changePassword({ currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      notify("success", "Password changed.");
    } catch (err) {
      notify("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const sendResetCode = async () => {
    setResetBusy(true);
    try {
      await api.forgotPassword({ email: user.email });
      setResetStage("code");
      notify("success", `We sent a reset code to ${user.email}.`);
    } catch (err) {
      notify("error", err.message);
    } finally {
      setResetBusy(false);
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    if (resetPass.length < 6) return notify("error", "New password must be at least 6 characters.");
    if (resetPass !== resetConfirm) return notify("error", "New passwords don't match.");
    setResetBusy(true);
    try {
      await api.resetPassword({ email: user.email, otp, newPassword: resetPass });
      setResetStage("idle");
      setOtp("");
      setResetPass("");
      setResetConfirm("");
      notify("success", "Password reset. Use it next time you log in.");
    } catch (err) {
      notify("error", err.message);
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <Card title="Password">
      <form onSubmit={change} className="flex flex-col gap-4">
        <PasswordInput
          placeholder="Current password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          required
        />
        <PasswordInput
          placeholder="New password (min 6 characters)"
          value={next}
          onChange={(e) => setNext(e.target.value)}
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
        <Button
          type="submit"
          size="sm"
          disabled={saving || !current || !next || !confirm}
          className="self-start"
        >
          {saving ? "Changing…" : "Change password"}
        </Button>
      </form>

      <div className="border-t border-white/5 pt-4">
        {resetStage === "idle" ? (
          <button
            type="button"
            onClick={sendResetCode}
            disabled={resetBusy}
            className="text-sm text-accent hover:underline disabled:opacity-50"
          >
            {resetBusy ? "Sending…" : "Forgot your current password? Reset via email code"}
          </button>
        ) : (
          <form onSubmit={doReset} className="flex flex-col gap-4">
            <p className="text-sm text-white/60">
              Enter the 6-digit code sent to{" "}
              <span className="text-white">{user.email}</span> and choose a new password.
            </p>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit code"
              className="text-center tracking-[0.5em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
            />
            <PasswordInput
              placeholder="New password (min 6 characters)"
              value={resetPass}
              onChange={(e) => setResetPass(e.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordInput
              placeholder="Confirm new password"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
            <div className="flex items-center gap-4">
              <Button type="submit" size="sm" disabled={resetBusy || otp.length !== 6}>
                {resetBusy ? "Resetting…" : "Reset password"}
              </Button>
              <button
                type="button"
                onClick={sendResetCode}
                disabled={resetBusy}
                className="text-sm text-white/60 hover:text-white disabled:opacity-50"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetStage("idle");
                  setOtp("");
                  setResetPass("");
                  setResetConfirm("");
                }}
                className="text-sm text-white/60 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

function TwoFactorSection({ notify }) {
  const { user, updateUser } = useAuth();
  const enabled = Boolean(user?.totpEnabled);

  const [enroll, setEnroll] = useState(null); // { qr_data_uri, secret }
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [backupCodes, setBackupCodes] = useState(null);

  const beginEnroll = async () => {
    setBusy(true);
    try {
      const res = await api.totpEnrollBegin();
      setEnroll(res);
      setCode("");
    } catch (err) {
      notify("error", err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmEnroll = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.totpEnrollConfirm({ code });
      updateUser(res.user);
      setEnroll(null);
      setBackupCodes(res.backup_codes);
      notify("success", "Two-factor authentication enabled.");
    } catch (err) {
      notify("error", err.message);
      // A stale enrollment secret can't be confirmed — drop back to the button.
      if (err.code === "enrollment_expired") setEnroll(null);
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const res = await api.totpDisable();
      updateUser(res.user);
      setBackupCodes(null);
      notify("success", "Two-factor authentication disabled.");
    } catch (err) {
      // The step-up modal was dismissed — no-op, leave 2FA on.
      if (err.code !== "reauth_cancelled") notify("error", err.message);
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    setBusy(true);
    try {
      const res = await api.totpRegenerateBackup();
      setBackupCodes(res.backup_codes);
      notify("success", "New backup codes generated.");
    } catch (err) {
      if (err.code !== "reauth_cancelled") notify("error", err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Two-factor authentication">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">
            Require a one-time code from an authenticator app when logging in.
          </p>
          <p className={`text-sm font-semibold mt-1 ${enabled ? "text-green-400" : "text-white/50"}`}>
            {enabled ? "Enabled" : "Disabled"}
          </p>
        </div>
        {enabled ? (
          <Button type="button" size="sm" variant="outline" onClick={disable} disabled={busy}>
            {busy ? "Working…" : "Disable 2FA"}
          </Button>
        ) : (
          !enroll && (
            <Button type="button" size="sm" onClick={beginEnroll} disabled={busy}>
              {busy ? "Working…" : "Enable 2FA"}
            </Button>
          )
        )}
      </div>

      {/* Enable flow — scan QR, confirm a code */}
      {!enabled && enroll && (
        <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
          <p className="text-sm text-white/60">
            Scan the QR code with Google Authenticator, 1Password, Authy or
            similar, then enter the 6-digit code.
          </p>
          <div className="bg-white rounded-xl p-3 w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enroll.qr_data_uri} alt="TOTP QR code" width={200} height={200} />
          </div>
          <p className="text-white/40 text-xs break-all">
            Can&apos;t scan? Enter this key manually: {enroll.secret}
          </p>
          <form onSubmit={confirmEnroll} className="flex items-center gap-3 flex-wrap">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit code"
              className="text-center tracking-[0.5em] max-w-[180px]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
              required
            />
            <Button type="submit" size="sm" disabled={busy || code.length !== 6}>
              {busy ? "Verifying…" : "Turn on 2FA"}
            </Button>
            <button
              type="button"
              onClick={() => setEnroll(null)}
              className="text-sm text-white/60 hover:text-white"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Regenerate backup codes (when enabled and not currently showing codes) */}
      {enabled && !backupCodes && (
        <div className="border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={regenerate}
            disabled={busy}
            className="text-sm text-accent hover:underline disabled:opacity-50"
          >
            Regenerate backup codes
          </button>
        </div>
      )}

      {/* Backup codes panel — after enabling or regenerating */}
      {backupCodes && (
        <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
          <BackupCodes codes={backupCodes} />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setBackupCodes(null)}
            className="self-start"
          >
            Done
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState(null); // { type, text }

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">Loading…</div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Header />

      <div className="mb-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-white/50 text-sm mt-1">
          Manage your account, password and security.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 text-sm border ${
            message.type === "error"
              ? "bg-red-500/10 border-red-500/30 text-red-300"
              : "bg-green-500/10 border-green-500/30 text-green-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-6 max-w-2xl">
        <ProfileSection notify={notify} />
        <PasswordSection notify={notify} />
        <TwoFactorSection notify={notify} />
      </div>
    </div>
  );
}
