import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import {
  generateVariantsForFile,
  canGenerateVariants,
  variantsForPrisma,
} from "@/lib/image-variants";

// How many images to process per request, to keep each call well under any
// serverless/proxy timeout. The client calls repeatedly until remaining is 0.
const BATCH_SIZE = 6;

// GET — report how many images still need variants generated.
export async function GET() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const images = await prisma.media.findMany({
    where: { deletedAt: null, mimeType: { startsWith: "image/" } },
    select: { mimeType: true, variants: true },
  });

  const pending = images.filter(
    (m) => canGenerateVariants(m.mimeType) && !m.variants
  ).length;
  const eligible = images.filter((m) => canGenerateVariants(m.mimeType)).length;

  return NextResponse.json({ pending, eligible });
}

// POST — generate variants for a batch of images that don't have them yet.
export async function POST() {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const images = await prisma.media.findMany({
    where: { deletedAt: null, mimeType: { startsWith: "image/" } },
    select: { id: true, filePath: true, mimeType: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  const pending = images.filter(
    (m) => canGenerateVariants(m.mimeType) && !m.variants
  );
  const batch = pending.slice(0, BATCH_SIZE);

  let processed = 0;
  const failures: { id: string; error: string }[] = [];

  for (const media of batch) {
    try {
      const variants = await generateVariantsForFile(
        media.filePath,
        media.mimeType
      );
      await prisma.media.update({
        where: { id: media.id },
        data: { variants: variantsForPrisma(variants) },
      });
      processed++;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "generation failed";
      console.error(`Variant generation failed for ${media.id}:`, message);
      failures.push({ id: media.id, error: message });
    }
  }

  return NextResponse.json({
    processed,
    failures,
    remaining: Math.max(0, pending.length - processed),
  });
}
