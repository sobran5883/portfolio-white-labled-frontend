/**
 * Canvas helpers to bake the edits made in ImageEditModal (crop, rotation,
 * flip, CSS filters, vignette) into a JPEG blob ready for upload.
 * Based on the official react-easy-crop export recipe.
 */

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.src = url;
  });
}

function getRadianAngle(degrees) {
  return (degrees * Math.PI) / 180;
}

/** Bounding-box size of a w×h rectangle rotated by `rotation` degrees. */
function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/** Keep exported profile images at a sane size. */
const MAX_OUTPUT = 1024;

/**
 * Crops `imageSrc` to `pixelCrop` (from react-easy-crop's onCropComplete),
 * applying rotation, flips, a CSS filter string and a vignette strength
 * (0..1). Resolves with a JPEG Blob.
 */
export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  cssFilter = "none",
  vignette = 0
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.naturalWidth,
    image.naturalHeight,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Draw the rotated/flipped/filtered source onto the big canvas.
  if (cssFilter && cssFilter !== "none" && "filter" in ctx) ctx.filter = cssFilter;
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
  ctx.drawImage(image, 0, 0);

  // Extract the crop area into the output canvas (downscaled if huge).
  const scale = Math.min(1, MAX_OUTPUT / pixelCrop.width);
  const outW = Math.round(pixelCrop.width * scale);
  const outH = Math.round(pixelCrop.height * scale);

  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const outCtx = out.getContext("2d");
  outCtx.imageSmoothingQuality = "high";
  outCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH
  );

  if (vignette > 0) {
    const cx = outW / 2;
    const cy = outH / 2;
    const outer = Math.sqrt(cx * cx + cy * cy);
    const grad = outCtx.createRadialGradient(cx, cy, outer * 0.45, cx, cy, outer);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, `rgba(0,0,0,${Math.min(0.85, vignette)})`);
    outCtx.fillStyle = grad;
    outCtx.fillRect(0, 0, outW, outH);
  }

  return new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not export the edited image."))),
      "image/jpeg",
      0.92
    );
  });
}

/** Reads a File as a data URL so it can be fed to the crop modal. */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("Could not read the selected file.")));
    reader.readAsDataURL(file);
  });
}
