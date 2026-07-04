"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import PortfolioEditor from "@/components/dashboard/PortfolioEditor";
import { FiCheck, FiExternalLink } from "react-icons/fi";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);
  const [message, setMessage] = useState(null); // {type, text}

  // load my portfolio
  useEffect(() => {
    api
      .getMyPortfolio()
      .then((res) => setData(res.portfolio))
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoadingData(false));
  }, []);

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const saveContent = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await api.updatePortfolio(data);
      setData(res.portfolio);
      setSavedAt(true);
      setTimeout(() => setSavedAt(false), 2000);
    } catch (err) {
      notify("error", err.message);
    } finally {
      setSaving(false);
    }
  }, [data]);

  if (loadingData) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Loading your portfolio…</div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/60">
        Could not load your portfolio. {message?.text}
      </div>
    );
  }

  const savedSlug = data.slug;

  return (
    <div className="container mx-auto py-6">
      <Header />

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

      {/* Editor */}
      <PortfolioEditor data={data} onChange={setData} />

      {/* Sticky save footer for convenience */}
      <div className="sticky bottom-4 mt-8 flex justify-end gap-3">
        {savedSlug && (
          <Link href={`/${savedSlug}`} target="_blank">
            <Button variant="outline" className="flex items-center gap-2 bg-primary shadow-lg">
              View live <FiExternalLink />
            </Button>
          </Link>
        )}
        <Button onClick={saveContent} disabled={saving} className="flex items-center gap-2 shadow-lg">
          {savedAt ? (<><FiCheck /> Saved</>) : saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
