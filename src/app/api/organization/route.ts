import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const org = await prisma.organization.findFirst({
      select: {
        name: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        logoUrl: true,
        logoScrolledUrl: true,
        disclaimer: true,
        email: true,
        phone: true,
        address: true,
        typography: true,
        nav: true,
        footer: true,
      },
    });

    if (!org) {
      return NextResponse.json({});
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
