"use client";

import { FiPlus } from "react-icons/fi";

// Small presentational helpers shared across the dashboard editor.

export function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-white/60">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#1c1c22] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-accent"
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-white/60">{label}</span>
      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#1c1c22] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-accent resize-y"
      />
    </label>
  );
}

export function Card({ title, action, children }) {
  return (
    <div className="bg-[#232329] border border-white/5 rounded-2xl p-6">
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {action}
        </div>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function SmallButton({ children, onClick, variant = "default", type = "button" }) {
  const styles =
    variant === "danger"
      ? "border-red-500/40 text-red-300 hover:bg-red-500/10"
      : variant === "ghost"
      ? "border-white/10 text-white/70 hover:bg-white/5"
      : "border-accent text-accent hover:bg-accent hover:text-primary";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`text-sm rounded-full border px-3 py-1.5 transition-colors ${styles}`}
    >
      {children}
    </button>
  );
}

/** Dashed empty tile that appends a new entry to a repeated list. */
export function AddTile({ onClick, label = "Add" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="border border-dashed border-white/20 rounded-xl min-h-[120px] flex items-center justify-center text-white/40 hover:text-accent hover:border-accent transition-colors"
    >
      <FiPlus className="text-3xl" />
    </button>
  );
}

/** Wraps a repeated list item with a remove control. */
export function RepeatItem({ children, onRemove }) {
  return (
    <div className="relative border border-white/10 rounded-xl p-4 pt-8">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-xs text-red-300 hover:text-red-200 border border-red-500/30 rounded-full px-2 py-0.5"
      >
        Remove
      </button>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
