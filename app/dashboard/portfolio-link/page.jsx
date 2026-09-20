"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { loadRazorpayCheckout } from "@/lib/razorpay";
import Header from "@/components/dashboard/Header";
import Link from "next/link";
import { FiCheck, FiExternalLink } from "react-icons/fi";

export default function PortfolioLinkPage() {
  const [data, setData] = useState(null);
  const [slug, setSlugInput] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [subActive, setSubActive] = useState(false);
  const [subStatus, setSubStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); // subscribe/publish in flight
  const [message, setMessage] = useState(null); // {type, text}

  useEffect(() => {
    Promise.all([api.getMyPortfolio(), api.getBillingStatus()])
      .then(([pRes, bRes]) => {
        const p = pRes.portfolio;
        setSlugInput(p.slug || "");
        setSavedSlug(p.slug || "");
        setPublished(Boolean(p.published));
        setSubActive(Boolean(bRes.subscription?.active));
        setSubStatus(bRes.subscription?.status || "none");
      })
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  const notify = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4500);
  };

  const refreshBilling = async () => {
    const b = await api.getBillingStatus();
    setSubActive(Boolean(b.subscription?.active));
    setSubStatus(b.subscription?.status || "none");
    return b;
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

  // Opens Razorpay Checkout to authorize the subscription mandate. Resolves once
  // the modal closes; entitlement is confirmed by polling billing status (the
  // webhook flips it to active shortly after payment).
  const startSubscription = async () => {
    const Razorpay = await loadRazorpayCheckout();
    const { subscriptionId, keyId, prefill } = await api.createSubscription();

    return new Promise((resolve, reject) => {
      const rzp = new Razorpay({
        key: keyId,
        subscription_id: subscriptionId,
        name: "Portfolio",
        description: "Publish subscription",
        prefill,
        theme: { color: "#00E0F2" },
        handler: () => resolve(true), // payment authorized
        modal: { ondismiss: () => reject(new Error("Payment cancelled.")) },
      });
      rzp.on("payment.failed", (resp) =>
        reject(new Error(resp?.error?.description || "Payment failed."))
      );
      rzp.open();
    });
  };

  // Poll billing status until active (webhook may lag a few seconds).
  const waitForActive = async (tries = 6, delayMs = 1500) => {
    for (let i = 0; i < tries; i++) {
      const b = await refreshBilling();
      if (b.subscription?.active) return true;
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  };

  const doPublish = async (next) => {
    const res = await api.setPublished(next);
    setPublished(Boolean(res.portfolio.published));
    notify("success", next ? "Portfolio published!" : "Portfolio unpublished.");
  };

  const onPublishClick = async () => {
    setBusy(true);
    try {
      // Unpublishing never needs a subscription.
      if (published) {
        await doPublish(false);
        return;
      }

      // Not subscribed yet → run the payment flow first.
      if (!subActive) {
        await startSubscription();
        notify("success", "Payment received — activating…");
        const active = await waitForActive();
        if (!active) {
          notify(
            "error",
            "Payment is processing. Once your subscription is active, click Publish again."
          );
          return;
        }
      }

      await doPublish(true);
    } catch (err) {
      notify("error", err.message);
    } finally {
      setBusy(false);
    }
  };

  const onCancelSubscription = async () => {
    setBusy(true);
    try {
      const res = await api.cancelSubscription();
      notify("success", res.message || "Subscription cancelled.");
      await refreshBilling();
    } catch (err) {
      notify("error", err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Loading…</div>;
  }

  const isSavedSlug = savedSlug;

  const publishLabel = busy
    ? "Please wait…"
    : published
    ? "Unpublish"
    : subActive
    ? "Publish"
    : "Subscribe & Publish";

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

      {/* Subscription banner — shown until the user has an active subscription. */}
      {!subActive && (
        <div className="mb-6 rounded-2xl px-5 py-4 text-sm border bg-accent/10 border-accent/30 text-white/80">
          Publishing your portfolio requires an active subscription. Click{" "}
          <span className="font-semibold text-accent">Subscribe &amp; Publish</span> to set it up
          securely with Razorpay.
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
          {/* <div className="text-right">
            <p className="text-sm text-white/60">Status</p>
            <p className={`font-semibold ${published ? "text-green-400" : "text-white/50"}`}>
              {published ? "Published" : "Draft"}
            </p>
          </div> */}
          {isSavedSlug && (
            <Link href={`/${isSavedSlug}`} target="_blank">
              <Button variant="outline" className="flex items-center gap-2 bg-primary shadow-lg">
                View live <FiExternalLink />
              </Button>
            </Link>
          )}
          <Button onClick={onPublishClick} size="sm" disabled={busy || (!savedSlug && !published)}>
            {publishLabel}
          </Button>
        </div>
      </div>

      {/* Subscription management */}
      {subActive && (
        <div className="bg-[#232329] border border-white/5 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Subscription</p>
            <p className="font-semibold text-green-400 capitalize">{subStatus || "active"}</p>
            <p className="text-xs text-white/40 mt-1">
              Cancelling keeps your portfolio live until the end of the current billing cycle.
            </p>
          </div>
          <Button onClick={onCancelSubscription} size="sm" variant="outline" disabled={busy}>
            Cancel subscription
          </Button>
        </div>
      )}
    </div>
  );
}
