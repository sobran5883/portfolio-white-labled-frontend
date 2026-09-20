"use client";

// Owner-only draft preview. Renders the exact public portfolio chrome
// (header + page transitions) but is fed by the authenticated
// `GET /api/portfolio` endpoint, so an unpublished/draft portfolio is
// visible to its owner before it ever goes live. The access token lives
// only in memory (see lib/token-store.js), so this must run client-side;
// on a hard load the api client self-heals via the httpOnly refresh cookie.

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { accentStyle } from "@/lib/theme";

import PortfolioHeader from "@/components/portfolio/PortfolioHeader";
import PortfolioTransition from "@/components/PortfolioTransition";
import PageTransition from "@/components/PageTransition";

// All preview links live under this base instead of `/<slug>`.
export const PREVIEW_BASE = "/preview";

const PreviewPortfolioContext = createContext(null);

/** Read the draft portfolio inside any preview page. */
export const usePreviewPortfolio = () => useContext(PreviewPortfolioContext);

export default function PreviewProvider({ children }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .getMyPortfolio()
      .then((res) => {
        if (!alive) return;
        setPortfolio(res.portfolio);
        setStatus("ready");
      })
      .catch((err) => {
        if (!alive) return;
        // No session (even after a refresh attempt) → send them to log in.
        if (err.status === 401) {
          router.replace("/login");
          return;
        }
        setError(err.message || "Could not load your portfolio.");
        setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        Loading preview…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-300">
        {error}
      </div>
    );
  }

  const theme = portfolio.theme || {};

  return (
    <PreviewPortfolioContext.Provider value={portfolio}>
      <div style={accentStyle(theme.accentColor)} className="min-h-screen">
        <PortfolioHeader base={PREVIEW_BASE} logoText={theme.logoText || "Portfolio"} visibility={portfolio.visibility} />
        <PortfolioTransition variant={theme.pageTransition} />
        <PageTransition variant={theme.pageTransition}>{children}</PageTransition>

        {/* Draft banner — fixed to the bottom so it stays visible while
            scrolling without pushing the portfolio content down. */}
        <div className="fixed bottom-0 inset-x-0 z-50 bg-accent/15 border-t border-accent/30 backdrop-blur-sm text-center text-sm text-white/80 py-2 px-4">
          Preview mode — {portfolio.published ? "your portfolio is live." : "this is a draft and is not publicly visible yet."}{" "}
          <a href="/dashboard/portfolio-link" className="text-accent font-medium underline underline-offset-2">
            Back to dashboard
          </a>
        </div>
      </div>
    </PreviewPortfolioContext.Provider>
  );
}
