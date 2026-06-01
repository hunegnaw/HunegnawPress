import fs from "fs/promises";
import path from "path";
import { Prisma } from "@prisma/client";

/**
 * Responsive image variant generation.
 *
 * For each raster image we generate WebP renditions at a set of widths, in
 * both color and grayscale (black & white), plus a full-size WebP. Each
 * generated file's path, dimensions, and byte size are recorded so the admin
 * can pick the right one. SVG, GIF (possibly animated), and video are skipped.
 */

export const VARIANT_WIDTHS = [200, 320, 640, 960, 1280, 1920];
const WEBP_QUALITY = 80;

// MIME types we will rasterize. GIF is excluded to preserve animation; SVG is
// vector and needs no resizing.
const RASTER_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
  "image/avif",
];

export interface VariantFile {
  path: string; // public path, e.g. /uploads/media/2026/photo-640.webp
  width: number;
  height: number;
  size: number; // bytes
}

export interface MediaVariants {
  full?: VariantFile; // full-resolution WebP
  color: VariantFile[]; // sorted ascending by width
  bw: VariantFile[]; // grayscale, sorted ascending by width
  generatedAt: string;
}

export function canGenerateVariants(mimeType: string): boolean {
  return RASTER_MIME_TYPES.includes(mimeType);
}

/**
 * Coerce a variants manifest into a value Prisma accepts for a Json column.
 * Returns undefined (no-op for updates / default for creates) when absent.
 */
export function variantsForPrisma(
  v: MediaVariants | null | undefined
): Prisma.InputJsonValue | undefined {
  return (v ?? undefined) as Prisma.InputJsonValue | undefined;
}

function publicToAbsolute(publicPath: string): string {
  return path.join(process.cwd(), "public", publicPath);
}

/**
 * Generate variants from an in-memory buffer (used on upload).
 * `publicPath` is the public path of the already-saved original.
 */
export async function generateImageVariants(
  buffer: Buffer,
  publicPath: string,
  mimeType: string
): Promise<MediaVariants | null> {
  if (!canGenerateVariants(mimeType)) return null;

  const sharp = (await import("sharp")).default;

  const meta = await sharp(buffer).metadata();
  const origWidth = meta.width ?? 0;
  if (!origWidth) return null;

  const dir = path.dirname(publicToAbsolute(publicPath));
  const publicDir = path.posix.dirname(publicPath);
  const ext = path.extname(publicPath);
  const stem = path.basename(publicPath, ext);
  const isOriginalWebp = mimeType === "image/webp";

  // Only widths that don't upscale; ensure at least one rendition.
  let widths = VARIANT_WIDTHS.filter((w) => w <= origWidth);
  if (widths.length === 0) widths = [origWidth];

  const variants: MediaVariants = {
    color: [],
    bw: [],
    generatedAt: new Date().toISOString(),
  };

  // Full-size WebP. If the original is already WebP, reuse it as the full.
  if (isOriginalWebp) {
    try {
      const stat = await fs.stat(publicToAbsolute(publicPath));
      variants.full = {
        path: publicPath,
        width: origWidth,
        height: meta.height ?? 0,
        size: stat.size,
      };
    } catch {
      /* ignore */
    }
  } else {
    const fullName = `${stem}.webp`;
    const info = await sharp(buffer)
      .webp({ quality: WEBP_QUALITY })
      .toFile(path.join(dir, fullName));
    variants.full = {
      path: `${publicDir}/${fullName}`,
      width: info.width,
      height: info.height,
      size: info.size,
    };
  }

  for (const w of widths) {
    // Color
    const colorName = `${stem}-${w}.webp`;
    const colorInfo = await sharp(buffer)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(path.join(dir, colorName));
    variants.color.push({
      path: `${publicDir}/${colorName}`,
      width: colorInfo.width,
      height: colorInfo.height,
      size: colorInfo.size,
    });

    // Black & white
    const bwName = `${stem}-${w}-bw.webp`;
    const bwInfo = await sharp(buffer)
      .resize({ width: w, withoutEnlargement: true })
      .grayscale()
      .webp({ quality: WEBP_QUALITY })
      .toFile(path.join(dir, bwName));
    variants.bw.push({
      path: `${publicDir}/${bwName}`,
      width: bwInfo.width,
      height: bwInfo.height,
      size: bwInfo.size,
    });
  }

  return variants;
}

/**
 * Generate variants for an already-uploaded file on disk (used for backfill).
 */
export async function generateVariantsForFile(
  publicPath: string,
  mimeType: string
): Promise<MediaVariants | null> {
  if (!canGenerateVariants(mimeType)) return null;
  const buffer = await fs.readFile(publicToAbsolute(publicPath));
  return generateImageVariants(buffer, publicPath, mimeType);
}

/**
 * Remove all generated variant files for a media item (best effort).
 * Does not remove the original or a full that points at the original.
 */
export async function deleteImageVariants(
  variants: MediaVariants | null | undefined,
  originalPublicPath?: string
): Promise<void> {
  if (!variants) return;
  const paths = new Set<string>();
  if (variants.full && variants.full.path !== originalPublicPath) {
    paths.add(variants.full.path);
  }
  for (const v of variants.color) paths.add(v.path);
  for (const v of variants.bw) paths.add(v.path);

  await Promise.all(
    [...paths].map(async (p) => {
      try {
        await fs.unlink(publicToAbsolute(p));
      } catch {
        /* file may already be gone */
      }
    })
  );
}
