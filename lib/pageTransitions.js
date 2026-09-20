/**
 * Page-transition overlays a visitor sees when navigating a public portfolio.
 * `key` is stored in `theme.pageTransition` (mirrored in the backend
 * Portfolio model's theme schema) and mapped to a panel component in
 * components/PortfolioTransition.jsx — add new transitions in both places.
 */
export const PAGE_TRANSITIONS = [
  {
    key: "stairs",
    label: "Stairs",
    description: "Panels sweep away one after another like descending steps.",
  },
  {
    key: "curtains",
    label: "Curtains",
    description: "Horizontal slats sweep downward one after another, like a falling curtain.",
  },
];

export const DEFAULT_PAGE_TRANSITION = "stairs";

/**
 * Shared per-variant timing. The panel components (Stairs.jsx, Curtains.jsx)
 * and PageTransition.jsx (route content swap) read these so the page content
 * always swaps behind fully closed panels and the reveal opens directly onto
 * the new page.
 */
const TIMING = {
  stairs: {
    panels: 8, // vertical columns
    duration: 0.3, // per-panel travel time
    stagger: 0.04, // delay between neighbouring panels
    // pause after the close before the reveal starts; above ~0.05 the
    // fully-covered moment reads as a white flash, and the content swap
    // hides behind the closing sweep's tail either way
    revealDelay: 0.0,
  },
  curtains: {
    panels: 12, // horizontal slats
    duration: 0.3,
    stagger: 0.04,
    revealDelay: 0.0,
  },
};

export function transitionTiming(variant) {
  const t = TIMING[variant] || TIMING[DEFAULT_PAGE_TRANSITION];
  // full closing sweep = last panel's delay + its travel
  const close = t.duration + (t.panels - 1) * t.stagger;
  return {
    ...t,
    close,
    // hold the old page just past the close so the swap is never visible
    contentHold: close + 0.02,
  };
}
