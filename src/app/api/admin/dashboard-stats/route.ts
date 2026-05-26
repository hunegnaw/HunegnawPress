import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const [pageCount, blogPostCount, mediaCount, adminUserCount] =
      await Promise.all([
        prisma.page.count({ where: { deletedAt: null } }),
        prisma.blogPost.count({ where: { deletedAt: null } }),
        prisma.media.count({ where: { deletedAt: null } }),
        prisma.user.count({
          where: {
            role: { in: ["ADMIN", "SUPER_ADMIN"] },
            deletedAt: null,
          },
        }),
      ]);

    return NextResponse.json({
      pageCount,
      blogPostCount,
      mediaCount,
      adminUserCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
