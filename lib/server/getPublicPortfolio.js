import { cache } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Server-side fetch of a published portfolio by slug.
 * Wrapped in React `cache` so the layout and page in the same request
 * share a single backend call. Returns the portfolio object or null.
 */
export const getPublicPortfolio = cache(async (slug) => {
  try {
    const res = await fetch(`${API_URL}/public/${encodeURIComponent(slug)}`, {
      // Always reflect the latest published content.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.portfolio || null;
  } catch {
    return null;
  }
});
