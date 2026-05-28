import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { getAllBrandHexValues, mergeBrandPalette, type BrandColorCategory } from "@/lib/brand-palette";

export async function POST() {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const organization = await prisma.organization.findFirst();
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const palette = mergeBrandPalette(organization.brandPalette as BrandColorCategory[] | null);
    const brandColors = getAllBrandHexValues(palette);

    await prisma.organization.update({
      where: { id: organization.id },
      data: { savedColors: brandColors },
    });

    return NextResponse.json({ colors: brandColors, count: brandColors.length });
  } catch (error) {
    console.error("Error seeding saved colors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
