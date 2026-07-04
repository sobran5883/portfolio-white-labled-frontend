"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import { FiExternalLink, FiX } from "react-icons/fi";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.userType === "admin";

  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  // Detail modal state: which row is open, and its fetched detail.
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState(null);

  // The dashboard layout already guarantees a logged-in user; this page
  // additionally requires admin. The backend enforces it too — this is UX only.
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }
    api
      .adminListUsers()
      .then((res) => setUsers(res.users))
      .catch((err) => setError(err.message));
  }, [isAdmin, router]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setDetail(null);
    setDetailError(null);
    api
      .adminGetUser(selectedId)
      .then((res) => {
        if (!cancelled) setDetail(res);
      })
      .catch((err) => {
        if (!cancelled) setDetailError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  if (!isAdmin) return null;

  const closeDetail = () => setSelectedId(null);

  return (
    <div className="container mx-auto py-6">
      <Header />

      <div className="mb-6">
        <h1 className="text-xl font-semibold">Customers</h1>
        <p className="text-white/50 text-sm mt-1">
          {users ? `${users.length} customer${users.length === 1 ? "" : "s"}` : "Loading…"}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg px-4 py-3 text-sm border bg-red-500/10 border-red-500/30 text-red-300">
          {error}
        </div>
      )}

      {users && users.length === 0 && (
        <div className="bg-[#232329] border border-white/5 rounded-2xl p-10 text-center text-white/50">
          No customers yet.
        </div>
      )}

      {users && users.length > 0 && (
        <div className="bg-[#232329] border border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 border-b border-white/5">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Portfolio</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className="border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-white/70">{u.email}</td>
                  <td className="px-6 py-4 text-white/70">{u.slug ? `/${u.slug}` : "—"}</td>
                  <td className="px-6 py-4">
                    <span className={u.published ? "text-green-400" : "text-white/50"}>
                      {u.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/70">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer detail modal */}
      {selectedId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeDetail}
        >
          <div
            className="bg-[#232329] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold">Customer details</h2>
              <button onClick={closeDetail} className="text-white/50 hover:text-white" aria-label="Close">
                <FiX size={20} />
              </button>
            </div>

            {detailError && <p className="text-red-300 text-sm">{detailError}</p>}
            {!detail && !detailError && <p className="text-white/50 text-sm">Loading…</p>}

            {detail && (
              <div className="space-y-3 text-sm">
                <DetailRow label="Name" value={detail.user.name} />
                <DetailRow label="Email" value={detail.user.email} />
                <DetailRow label="Joined" value={formatDate(detail.user.createdAt)} />
                <DetailRow label="2FA" value={detail.user.totpEnabled ? "Enabled" : "Not enabled"} />
                <DetailRow label="Slug" value={detail.portfolio?.slug ? `/${detail.portfolio.slug}` : "Not set"} />
                <DetailRow
                  label="Status"
                  value={
                    <span className={detail.portfolio?.published ? "text-green-400" : "text-white/50"}>
                      {detail.portfolio?.published ? "Published" : "Draft"}
                    </span>
                  }
                />
                <DetailRow label="Last updated" value={formatDate(detail.portfolio?.updatedAt)} />

                {detail.portfolio?.published && detail.portfolio?.slug && (
                  <div className="pt-2">
                    <Link href={`/${detail.portfolio.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        View live <FiExternalLink />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/50">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
