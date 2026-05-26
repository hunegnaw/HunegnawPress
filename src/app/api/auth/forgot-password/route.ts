import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.deletedAt) {
      return NextResponse.json({ success: true });
    }

    await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

    const token = crypto.randomUUID();
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`Password reset token for ${user.email}: ${token}`);
      console.log(`Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${token}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
