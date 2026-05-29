import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

// PATCH — toggle a subscriber's subscribed/unsubscribed state
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const { id } = await params;
    const { action } = await request.json();

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id },
    });
    if (!subscriber) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const unsubscribedAt = action === "unsubscribe" ? new Date() : null;
    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { unsubscribedAt },
    });

    await createAuditLog({
      userId: user.id,
      action: action === "unsubscribe" ? "UNSUBSCRIBE_SUBSCRIBER" : "RESUBSCRIBE_SUBSCRIBER",
      targetType: "NewsletterSubscriber",
      targetId: id,
      details: { email: subscriber.email },
      request,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating subscriber:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE — permanently remove a subscriber
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const { id } = await params;

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id },
      select: { email: true },
    });
    if (!subscriber) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.newsletterSubscriber.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      action: "DELETE_SUBSCRIBER",
      targetType: "NewsletterSubscriber",
      targetId: id,
      details: { email: subscriber.email },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
