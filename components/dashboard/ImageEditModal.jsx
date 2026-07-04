"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import { RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2, X } from "lucide-react";
import { getCroppedImg } from "@/lib/cropImage";

const EDIT_TABS = ["Crop", "Filter", "Adjust"];

const FILTERS = [
  { key: "original", name: "Original", css: "" },
  { key: "studio", name: "Studio", css: "brightness(1.06) contrast(1.08) saturate(1.12)" },
  { key: "spotlight", name: "Spotlight", css: "brightness(1.18) contrast(0.92) saturate(1.05)" },
  { key: "prime", name: "Prime", css: "contrast(1.12) saturate(0.8) brightness(1.02)" },
  { key: "classic", name: "Classic", css: "sepia(0.28) contrast(1.06) brightness(1.04) saturate(1.1)" },
  { key: "edge", name: "Edge", css: "grayscale(0.4) contrast(1.25) brightness(0.98)" },
  { key: "luminate", name: "Luminate", css: "brightness(1.14) saturate(1.08) sepia(0.12) hue-rotate(-8deg)" },
];

const DEFAULT_ADJUST = { brightness: 0, contrast: 0, saturation: 0, vignette: 0 };

function buildCssFilter(filterCss, adjust) {
  const parts = [];
  if (filterCss) parts.push(filterCss);
  if (adjust.brightness) parts.push(`brightness(${1 + adjust.brightness / 200})`);
  if (adjust.contrast) parts.push(`contrast(${1 + adjust.contrast / 200})`);
  if (adjust.saturation) parts.push(`saturate(${1 + adjust.saturation / 200})`);
  return parts.length ? parts.join(" ") : "none";
}

function Slider({ label, value, onChange, min, max, step = 1 }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-white/60">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent cursor-pointer"
        aria-label={label}
      />
    </label>
  );
}

/**
 * LinkedIn-style "Edit image" dialog: circular crop with pan/zoom/rotate/flip,
 * filter presets and brightness/contrast/saturation/vignette adjustments.
 * Calls `onSave(blob)` with the final JPEG; `onCancel()` closes without saving.
 */
export default function ImageEditModal({ src, onSave, onCancel }) {
  const [tab, setTab] = useState("Crop");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [quarterTurns, setQuarterTurns] = useState(0); // 90° button steps
  const [fineRotation, setFineRotation] = useState(0); // slider, -45..45
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [filterKey, setFilterKey] = useState("original");
  const [adjust, setAdjust] = useState(DEFAULT_ADJUST);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rotation = quarterTurns * 90 + fineRotation;
  const filterCss = FILTERS.find((f) => f.key === filterKey)?.css || "";
  const cssFilter = useMemo(() => buildCssFilter(filterCss, adjust), [filterCss, adjust]);
  const vignetteAlpha = (adjust.vignette / 100) * 0.85;

  const onCropComplete = useCallback((_, areaPixels) => setCroppedAreaPixels(areaPixels), []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel]);

  const handleSave = async () => {
    if (!croppedAreaPixels || saving) return;
    setError("");
    setSaving(true);
    try {
      const blob = await getCroppedImg(src, croppedAreaPixels, rotation, flip, cssFilter, vignetteAlpha);
      await onSave(blob);
    } catch (err) {
      setError(err?.message || "Could not save the image.");
      setSaving(false);
    }
  };

  const cropToolButtons = [
    { title: "Rotate left", Icon: RotateCcw, onClick: () => setQuarterTurns((q) => q - 1) },
    { title: "Rotate right", Icon: RotateCw, onClick: () => setQuarterTurns((q) => q + 1) },
    {
      title: "Flip horizontal",
      Icon: FlipHorizontal2,
      active: flip.horizontal,
      onClick: () => setFlip((f) => ({ ...f, horizontal: !f.horizontal })),
    },
    {
      title: "Flip vertical",
      Icon: FlipVertical2,
      active: flip.vertical,
      onClick: () => setFlip((f) => ({ ...f, vertical: !f.vertical })),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit image"
    >
      <div className="bg-[#232329] text-white border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold">
            Edit <span className="text-accent">image</span>
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-y-auto md:overflow-hidden">
          {/* Preview / crop area */}
          <div className="relative flex-1 min-w-0 h-[300px] sm:h-[380px] md:h-auto md:min-h-[440px] bg-primary shrink-0 md:shrink">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              minZoom={1}
              maxZoom={3}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              transform={[
                `translate(${crop.x}px, ${crop.y}px)`,
                `rotateZ(${rotation}deg)`,
                `rotateY(${flip.horizontal ? 180 : 0}deg)`,
                `rotateX(${flip.vertical ? 180 : 0}deg)`,
                `scale(${zoom})`,
              ].join(" ")}
              style={{
                mediaStyle: {
                  filter: cssFilter === "none" ? undefined : cssFilter,
                },
                cropAreaStyle: {
                  border: "2px solid var(--accent, #00E0F2)",
                  backgroundImage:
                    vignetteAlpha > 0
                      ? `radial-gradient(circle farthest-corner, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignetteAlpha}) 100%)`
                      : undefined,
                },
              }}
            />
          </div>

          {/* Controls panel */}
          <div className="w-full md:w-80 shrink-0 p-5 md:overflow-y-auto">
            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-6">
              {EDIT_TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`text-sm rounded-full px-4 py-1.5 border transition-colors ${
                    tab === t
                      ? "bg-accent text-primary border-accent"
                      : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "Crop" && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  {cropToolButtons.map(({ title, Icon, onClick, active }) => (
                    <button
                      key={title}
                      type="button"
                      title={title}
                      aria-label={title}
                      onClick={onClick}
                      className={`p-2.5 rounded-lg border transition-colors ${
                        active
                          ? "border-accent text-accent bg-accent/10"
                          : "border-white/10 text-white/70 hover:text-accent hover:border-accent"
                      }`}
                    >
                      <Icon size={20} />
                    </button>
                  ))}
                </div>
                <Slider label="Zoom" value={zoom} onChange={setZoom} min={1} max={3} step={0.01} />
                <Slider label="Rotate" value={fineRotation} onChange={setFineRotation} min={-45} max={45} />
              </div>
            )}

            {tab === "Filter" && (
              <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilterKey(f.key)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={f.name}
                      style={{ filter: f.css || undefined }}
                      className={`w-16 h-14 object-cover rounded-md ${
                        filterKey === f.key
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-[#232329]"
                          : "group-hover:ring-1 group-hover:ring-white/30"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        filterKey === f.key ? "text-accent font-medium" : "text-white/60 group-hover:text-white"
                      }`}
                    >
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tab === "Adjust" && (
              <div className="flex flex-col gap-6">
                <Slider
                  label="Brightness"
                  value={adjust.brightness}
                  onChange={(v) => setAdjust((a) => ({ ...a, brightness: v }))}
                  min={-100}
                  max={100}
                />
                <Slider
                  label="Contrast"
                  value={adjust.contrast}
                  onChange={(v) => setAdjust((a) => ({ ...a, contrast: v }))}
                  min={-100}
                  max={100}
                />
                <Slider
                  label="Saturation"
                  value={adjust.saturation}
                  onChange={(v) => setAdjust((a) => ({ ...a, saturation: v }))}
                  min={-100}
                  max={100}
                />
                <Slider
                  label="Vignette"
                  value={adjust.vignette}
                  onChange={(v) => setAdjust((a) => ({ ...a, vignette: v }))}
                  min={0}
                  max={100}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-3 border-t border-white/10">
          <span className="text-sm text-red-300">{error}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm rounded-full border border-white/10 text-white/70 hover:bg-white/5 px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!croppedAreaPixels || saving}
              className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary text-sm font-semibold rounded-full px-5 py-2 transition-colors"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
