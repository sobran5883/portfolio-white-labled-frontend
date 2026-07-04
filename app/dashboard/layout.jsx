"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    // TOTP is mandatory for every account — enforce enrollment before the
    // dashboard is usable (covers pre-2FA accounts logging in again).
    else if (!user.totpEnabled) router.replace("/totp-setup");
  }, [loading, user, router]);

  if (loading || !user || !user.totpEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        Loading…
      </div>
    );
  }

  return <div className="min-h-screen">{children}</div>;
}
