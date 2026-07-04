"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Header from "@/components/dashboard/Header";

export default function PortfolioLinkPage() {
  const [slug, setSlugInput] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null); // {type, text}

  useEffect(() => {
    api
      .getMyPortfolio()
      .then((res) => {
        const p = res.portfolio;
        setSlugInput(p.slug || "");
        setSavedSlug(p.slug || "");
        setPublished(Boolean(p.published));
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const saveSlug = async () => {
    try {
      const res = await api.setSlug(slug);
      setSlugInput(res.portfolio.slug || "");
      setSavedSlug(res.portfolio.slug || "");
      notify("success", "Slug saved.");
    } catch (err) {
      notify("error", err.message);
    }
  };

  const togglePublish = async () => {
    try {
      const next = !published;
      const res = await api.setPublished(next);
      setPublished(Boolean(res.portfolio.published));
      notify("success", next ? "Portfolio published!" : "Portfolio unpublished.");
    } catch (err) {
      notify("error", err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Loading…</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Header />

      <div className="mb-6">
        <h1 className="text-xl font-semibold">Portfolio link</h1>
        <p className="text-white/50 text-sm mt-1">
          Choose your public URL and control whether your portfolio is live.
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

      {/* Publish + slug controls */}
      <div className="bg-[#232329] border border-white/5 rounded-2xl p-6 mb-8 flex flex-col lg:flex-row gap-6 lg:items-end justify-between">
        <div className="flex-1">
          <span className="text-sm text-white/60">Your portfolio link</span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-white/40 text-sm whitespace-nowrap">/</span>
            <input
              value={slug}
              onChange={(e) => setSlugInput(e.target.value.toLowerCase())}
              placeholder="your-name"
              className="bg-[#1c1c22] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-accent w-full max-w-xs"
            />
            <Button onClick={saveSlug} size="sm" variant="outline">Save slug</Button>
          </div>
          <p className="text-xs text-white/40 mt-2">
            3–40 chars, lowercase letters, numbers and hyphens. Set a slug before publishing.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-white/60">Status</p>
            <p className={`font-semibold ${published ? "text-green-400" : "text-white/50"}`}>
              {published ? "Published" : "Draft"}
            </p>
          </div>
          <Button onClick={togglePublish} size="sm" disabled={!savedSlug && !published}>
            {published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
