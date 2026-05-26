import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const [
      pageCount,
      blogPostCount,
      blogCategoryCount,
      mediaCount,
    ] = await Promise.all([
      prisma.page.count({ where: { deletedAt: null } }),
      prisma.blogPost.count({ where: { deletedAt: null } }),
      prisma.blogCategory.count({ where: { deletedAt: null } }),
      prisma.media.count({ where: { deletedAt: null } }),
    ]);

    return NextResponse.json({
      pageCount,
      blogPostCount,
      blogCategoryCount,
      mediaCount,
    });
  } catch (error) {
    console.error("Error fetching sidebar counts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
