import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { deleteMediaFile, renameMediaFile } from "@/lib/media-upload";
import {
  deleteImageVariants,
  generateVariantsForFile,
  canGenerateVariants,
  variantsForPrisma,
  type MediaVariants,
} from "@/lib/image-variants";
import { createAuditLog } from "@/lib/audit";

export async function GET(
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
  return NextResponse.json(media);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const body = await request.json();

  const media = await prisma.media.findFirst({ where: { id, deletedAt: null } });
  if (!media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  // Handle file rename if requested
  let renameData: { filePath?: string; fileName?: string } = {};
  let regeneratedVariants: MediaVariants | null | undefined;
  if (body.fileName && body.fileName !== media.fileName) {
    try {
      const result = await renameMediaFile(media.filePath, body.fileName);
      renameData = result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Rename failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // The original moved, so its old variants are now stale/orphaned.
    // Remove them and regenerate against the new filename (best effort).
    if (renameData.filePath && canGenerateVariants(media.mimeType)) {
      try {
        await deleteImageVariants(
          media.variants as unknown as MediaVariants | null,
          media.filePath
        );
        regeneratedVariants = await generateVariantsForFile(
          renameData.filePath,
          media.mimeType
        );
      } catch (error) {
        console.error("Variant regeneration on rename failed:", error);
      }
    }
  }

  const updated = await prisma.media.update({
    where: { id },
    data: {
      ...(renameData.filePath ? { filePath: renameData.filePath } : {}),
      ...(renameData.fileName ? { fileName: renameData.fileName } : {}),
      ...(regeneratedVariants !== undefined
        ? { variants: variantsForPrisma(regeneratedVariants) }
        : {}),
      alt: body.alt !== undefined ? body.alt : undefined,
      caption: body.caption !== undefined ? body.caption : undefined,
    },
  });

  if (renameData.filePath) {
    createAuditLog({
      userId: admin.id,
      action: "RENAME_MEDIA",
      targetType: "MEDIA",
      targetId: id,
      details: { oldPath: media.filePath, newPath: renameData.filePath },
      request,
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
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

  await prisma.media.update({ where: { id }, data: { deletedAt: new Date() } });
  await deleteMediaFile(media.filePath);
  await deleteImageVariants(
    media.variants as unknown as MediaVariants | null,
    media.filePath
  );

  createAuditLog({
    userId: admin.id,
    action: "DELETE_MEDIA",
    targetType: "MEDIA",
    targetId: id,
    details: { fileName: media.fileName },
    request,
  });

  return NextResponse.json({ success: true });
}
