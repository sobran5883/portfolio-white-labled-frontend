"use client";

import { useState } from "react";
import Image from "next/image";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { uploadFile } from "@/lib/api";
import { readFileAsDataURL } from "@/lib/cropImage";
import ImageEditModal from "./ImageEditModal";

/**
 * Uploads a single file to S3 (via presigned URL) and reports back the
 * public URL through `onChange`. Shows a preview of the current value.
 * With `crop`, selected images first open a LinkedIn-style edit dialog
 * (crop/filter/adjust) and the edited result is what gets uploaded.
 */
export default function ImageUpload({ label, value, onChange, folder = "misc", accept = "image/*", crop = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [editSrc, setEditSrc] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (crop && file.type.startsWith("image/")) {
      try {
        setEditSrc(await readFileAsDataURL(file));
      } catch (err) {
        setError(err.message || "Could not read the selected file.");
      }
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Called by the edit dialog with the final cropped JPEG blob.
  const handleCropSave = async (blob) => {
    const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
    const url = await uploadFile(file, folder);
    onChange(url);
    setEditSrc(null);
  };

  const isPdf = value && /\.pdf($|\?)/i.test(value);

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm text-white/60">{label}</span>}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg bg-[#1c1c22] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
          {value && !isPdf ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : value && isPdf ? (
            <span className="text-xs text-white/50">PDF</span>
          ) : (
            <FiUploadCloud className="text-white/30 text-2xl" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="cursor-pointer text-sm rounded-full border border-accent text-accent hover:bg-accent hover:text-primary px-3 py-1.5 transition-colors inline-flex items-center gap-2 w-max">
            <FiUploadCloud />
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
            <input type="file" accept={accept} className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-white/50 hover:text-red-300 inline-flex items-center gap-1 w-max"
            >
              <FiX /> Remove
            </button>
          )}
        </div>
      </div>
      {error && <span className="text-xs text-red-300">{error}</span>}

      {editSrc && (
        <ImageEditModal src={editSrc} onSave={handleCropSave} onCancel={() => setEditSrc(null)} />
      )}
    </div>
  );
}
