"use client";

import { Field, Card } from "./ui";

/**
 * Theme & appearance settings, edited on the dedicated /dashboard/theme page.
 * Owns everything under `data.theme` — branding, colors and (soon) animation
 * options live here so the section can grow without crowding the editor.
 */
export default function ThemeEditor({ data, onChange }) {
  const setTheme = (field, value) =>
    onChange({ ...data, theme: { ...(data.theme || {}), [field]: value } });

  return (
    <div className="flex flex-col gap-6">
      <Card title="Branding">
        <Field
          label="Logo text (shown in the header)"
          value={data.theme?.logoText}
          onChange={(v) => setTheme("logoText", v)}
        />
      </Card>

      <Card title="Colors">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-white/60">Accent color</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.theme?.accentColor || "#00E0F2"}
              onChange={(e) => setTheme("accentColor", e.target.value)}
              className="w-12 h-10 bg-transparent rounded cursor-pointer"
              aria-label="Accent color picker"
            />
            <input
              type="text"
              value={data.theme?.accentColor ?? ""}
              onChange={(e) => setTheme("accentColor", e.target.value)}
              placeholder="#00E0F2"
              className="bg-[#1c1c22] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-accent w-40"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
