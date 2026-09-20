"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // 2FA is optional and managed from Settings, so the only gate here is
    // being signed in at all.
    if (!user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        Loading…
      </div>
    );
  }

  return <div className="min-h-screen">{children}</div>;
}
