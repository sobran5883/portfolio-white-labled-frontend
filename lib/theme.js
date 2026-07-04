// Helpers for per-portfolio accent theming.

const DEFAULT_ACCENT = "#00E0F2";

function clamp(n) {
  return Math.max(0, Math.min(255, n));
}

/** Darken a hex color by `amount` (0-1) to derive a hover shade. */
export function shade(hex, amount = 0.15) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return hex;
  const r = clamp(Math.round(parseInt(m[1], 16) * (1 - amount)));
  const g = clamp(Math.round(parseInt(m[2], 16) * (1 - amount)));
  const b = clamp(Math.round(parseInt(m[3], 16) * (1 - amount)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Returns an inline-style object setting the accent CSS variables. */
export function accentStyle(accentColor) {
  const accent = accentColor || DEFAULT_ACCENT;
  return {
    "--accent": accent,
    "--accent-hover": shade(accent, 0.15),
  };
}
