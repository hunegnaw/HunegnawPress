import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all"; // all | active | unsubscribed
    const exportCsv = searchParams.get("export") === "csv";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25")));

    const where: Prisma.NewsletterSubscriberWhereInput = {
      ...(search ? { email: { contains: search } } : {}),
      ...(status === "active"
        ? { unsubscribedAt: null }
        : status === "unsubscribed"
          ? { unsubscribedAt: { not: null } }
          : {}),
    };

    // CSV export — return all matching rows, not just the current page.
    if (exportCsv) {
      const rows = await prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: "desc" },
        select: { email: true, subscribedAt: true, unsubscribedAt: true },
      });

      const header = "Email,Status,Subscribed At,Unsubscribed At";
      const lines = rows.map((r) => {
        const status = r.unsubscribedAt ? "Unsubscribed" : "Active";
        return [
          csvCell(r.email),
          status,
          csvCell(r.subscribedAt.toISOString()),
          csvCell(r.unsubscribedAt ? r.unsubscribedAt.toISOString() : ""),
        ].join(",");
      });
      const csv = [header, ...lines].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="subscribers-${new Date()
            .toISOString()
            .slice(0, 10)}.csv"`,
        },
      });
    }

    const [subscribers, total, activeCount, unsubscribedCount] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { subscribedAt: "desc" },
        select: {
          id: true,
          email: true,
          subscribedAt: true,
          unsubscribedAt: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
      prisma.newsletterSubscriber.count({ where: { unsubscribedAt: { not: null } } }),
    ]);

    return NextResponse.json({
      subscribers,
      total,
      page,
      pageSize,
      activeCount,
      unsubscribedCount,
    });
  } catch (error) {
    console.error("Error listing subscribers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function csvCell(value: string): string {
  // Escape values that contain commas, quotes, or newlines.
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
