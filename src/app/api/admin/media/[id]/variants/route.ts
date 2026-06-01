import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import {
  generateVariantsForFile,
  deleteImageVariants,
  canGenerateVariants,
  variantsForPrisma,
  type MediaVariants,
} from "@/lib/image-variants";
import { createAuditLog } from "@/lib/audit";

// POST — (re)generate responsive variants for a single media item.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const media = await prisma.media.findFirst({ where: { id, deletedAt: null } });
  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  if (!canGenerateVariants(media.mimeType)) {
    return NextResponse.json(
      { error: "This file type does not support variants." },
      { status: 400 }
    );
  }

  try {
    // Clear out any previous variants first to avoid orphaned files.
    await deleteImageVariants(
      media.variants as unknown as MediaVariants | null,
      media.filePath
    );

    const variants = await generateVariantsForFile(media.filePath, media.mimeType);

    const updated = await prisma.media.update({
      where: { id },
      data: { variants: variantsForPrisma(variants) },
    });

    createAuditLog({
      userId: admin.id,
      action: "GENERATE_MEDIA_VARIANTS",
      targetType: "MEDIA",
      targetId: id,
      details: { fileName: media.fileName },
      request,
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate variants";
    console.error("Variant generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
