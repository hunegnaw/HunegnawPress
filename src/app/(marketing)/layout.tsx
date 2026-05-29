import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { prisma } from "@/lib/prisma";
import { getOrganization } from "@/lib/organization";
import { mergeTypography, type TypographySettings } from "@/lib/typography";
import { getGoogleFontUrl } from "@/lib/google-fonts";

export const dynamic = "force-dynamic";

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  return `${parseInt(h.slice(0, 2), 16)} ${parseInt(h.slice(2, 4), 16)} ${parseInt(h.slice(4, 6), 16)}`;
}

function mixHex(hex: string, target: string, amount: number): string {
  const h = hex.replace("#", "");
  const t = target.replace("#", "");
  const m = (a: number, b: number) => Math.round(a + (b - a) * amount);
  const r = m(parseInt(h.slice(0, 2), 16), parseInt(t.slice(0, 2), 16));
  const g = m(parseInt(h.slice(2, 4), 16), parseInt(t.slice(2, 4), 16));
  const b = m(parseInt(h.slice(4, 6), 16), parseInt(t.slice(4, 6), 16));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function buildTypographyCss(typography: TypographySettings): string {
  const vars: string[] = [];
  const categories = [
    { key: "heroTitle", prefix: "hero-title" },
    { key: "sectionHeading", prefix: "section-heading" },
    { key: "sectionTag", prefix: "section-tag" },
    { key: "subtitle", prefix: "subtitle" },
    { key: "body", prefix: "body" },
    { key: "adminBody", prefix: "admin-body" },
    { key: "portalBody", prefix: "portal-body" },
    { key: "blogCardTitle", prefix: "blog-card-title" },
    { key: "blogCardExcerpt", prefix: "blog-card-excerpt" },
    { key: "h1", prefix: "h1" },
    { key: "h2", prefix: "h2" },
    { key: "h3", prefix: "h3" },
    { key: "h4", prefix: "h4" },
    { key: "h5", prefix: "h5" },
    { key: "h6", prefix: "h6" },
  ] as const;

  for (const { key, prefix } of categories) {
    const s = typography[key];
    vars.push(`--font-${prefix}-family:'${s.fontFamily}',sans-serif`);
    vars.push(`--font-${prefix}-weight:${s.fontWeight}`);
    vars.push(`--font-${prefix}-style:${s.fontStyle}`);
    vars.push(`--font-${prefix}-color:${s.color}`);
    vars.push(`--font-${prefix}-size:${s.fontSize}`);
  }

  return `:root{${vars.join(";")}}`;
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navPages, org] = await Promise.all([
    prisma.page.findMany({
      where: { showInNav: true, status: "PUBLISHED", deletedAt: null },
      select: { slug: true, title: true, navLabel: true, navOrder: true, isHomepage: true, isBlogPage: true },
      orderBy: [{ navOrder: "asc" }, { title: "asc" }],
    }),
    getOrganization(),
  ]);

  const typography = mergeTypography(
    (org?.typography as Partial<TypographySettings>) ?? null
  );
  const typoCss = buildTypographyCss(typography);

  // Inject site color CSS variables from org settings
  const primary = org?.primaryColor || "#334155";
  const secondary = org?.secondaryColor || "#2563eb";
  const accent = org?.accentColor || "#3b82f6";
  const colorCss = `:root{--site-primary:${primary};--site-secondary:${secondary};--site-accent:${accent};--site-primary-rgb:${hexToRgb(primary)};--site-secondary-rgb:${hexToRgb(secondary)};--site-accent-rgb:${hexToRgb(accent)};--site-secondary-light:${mixHex(secondary, "#ffffff", 0.5)};--site-secondary-lighter:${mixHex(secondary, "#ffffff", 0.7)};--site-secondary-dark:${mixHex(secondary, "#000000", 0.2)}}`;

  // Collect unique font families from all typography settings and load via Google Fonts
  const fontFamilies = Array.from(
    new Set(
      Object.values(typography).map((s) => s.fontFamily)
    )
  );
  const googleFontUrl = getGoogleFontUrl(fontFamilies);

  const navLinks = navPages.map((p) => ({
    href: p.isHomepage ? "/" : `/${p.slug}`,
    label: p.navLabel || p.title,
  }));

  return (
    <>
      {googleFontUrl && (
        <link rel="stylesheet" href={googleFontUrl} />
      )}
      <style dangerouslySetInnerHTML={{ __html: typoCss + colorCss }} />
      <MarketingHeader navLinks={navLinks} />
      <div className="min-h-screen flex flex-col marketing-typography">
        <main className="flex-1">{children}</main>
        <MarketingFooter />
      </div>
    </>
  );
}
