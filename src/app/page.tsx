import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { getOrganization } from "@/lib/organization";
import { mergeTypography, type TypographySettings } from "@/lib/typography";

export async function generateMetadata(): Promise<Metadata> {
  const homepage = await prisma.page.findFirst({
    where: { isHomepage: true, status: "PUBLISHED", deletedAt: null },
    select: { metaTitle: true, metaDescription: true, ogImageUrl: true, title: true },
  });
  if (!homepage) return {};
  return {
    title: homepage.metaTitle || homepage.title,
    description: homepage.metaDescription || "",
    openGraph: {
      title: homepage.metaTitle || homepage.title,
      description: homepage.metaDescription || "",
      images: homepage.ogImageUrl ? [{ url: homepage.ogImageUrl }] : undefined,
    },
  };
}

export default async function Home() {
  const session = await auth();

  // Load the homepage from CMS
  const homepage = await prisma.page.findFirst({
    where: { isHomepage: true, status: "PUBLISHED", deletedAt: null },
    include: {
      blocks: { orderBy: { sortOrder: "asc" } },
    },
  });

  // Fallback: if no homepage exists, redirect based on auth state
  if (!homepage) {
    if (session?.user) {
      const role = session.user.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        redirect("/admin");
      }
    }
    redirect("/login");
  }

  // Fetch nav links for header/footer
  const [navPages, org] = await Promise.all([
    prisma.page.findMany({
      where: { showInNav: true, status: "PUBLISHED", deletedAt: null },
      select: { slug: true, title: true, navLabel: true, navOrder: true, isHomepage: true },
      orderBy: [{ navOrder: "asc" }, { title: "asc" }],
    }),
    getOrganization(),
  ]);

  const typography = mergeTypography(
    (org?.typography as Partial<TypographySettings>) ?? null
  );
  const typoCssVars = Object.entries({
    "hero-title": typography.heroTitle,
    "section-heading": typography.sectionHeading,
    "section-tag": typography.sectionTag,
    subtitle: typography.subtitle,
    body: typography.body,
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    h4: typography.h4,
    h5: typography.h5,
    h6: typography.h6,
  }).flatMap(([prefix, s]) => [
    `--font-${prefix}-family:'${s.fontFamily}',sans-serif`,
    `--font-${prefix}-weight:${s.fontWeight}`,
    `--font-${prefix}-style:${s.fontStyle}`,
    `--font-${prefix}-color:${s.color}`,
    `--font-${prefix}-size:${s.fontSize}`,
  ]).join(";");
  const typoCss = `:root{${typoCssVars}}`;
  const navLinks = navPages.map((p) => ({
    href: p.isHomepage ? "/" : `/${p.slug}`,
    label: p.navLabel || p.title,
  }));

  const blocks = homepage.blocks.map((b) => ({
    id: b.id,
    type: b.type,
    props: b.props as Record<string, unknown>,
    sortOrder: b.sortOrder,
  }));

  return (
    <div className="min-h-screen flex flex-col marketing-typography">
      <style dangerouslySetInnerHTML={{ __html: typoCss }} />
      <MarketingHeader transparent navLinks={navLinks} />
      <main className="flex-1">
        <BlockRenderer blocks={blocks} />
      </main>
      <MarketingFooter />

      {/* Floating admin button for authenticated admin users */}
      {session?.user && (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
        <Link
          href="/admin"
          className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          style={{ fontFamily: "var(--font-body-family, Inter), sans-serif" }}
        >
          Go to Admin
        </Link>
      )}
    </div>
  );
}
