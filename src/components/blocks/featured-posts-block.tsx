import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolveBlockFont } from "@/lib/block-fonts";

interface FeaturedPostsBlockProps {
  props: Record<string, unknown>;
}

const MAX_WIDTH: Record<string, string> = {
  sm: "max-w-4xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

const COLS: Record<string, string> = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 lg:grid-cols-3",
  "4": "md:grid-cols-2 lg:grid-cols-4",
};

export async function FeaturedPostsBlock({ props }: FeaturedPostsBlockProps) {
  const tagline = (props.tagline as string) || "";
  const heading = (props.heading as string) || "";
  const subtitle = (props.subtitle as string) || "";
  const categorySlug = (props.categorySlug as string) || "";
  const limit = Math.max(1, Math.min(12, (props.limit as number) || 3));
  const columns = (props.columns as string) || "3";
  const maxWidth = (props.maxWidth as string) || "lg";

  const showImage = props.showImage !== false;
  const showExcerpt = props.showExcerpt !== false;
  const showDate = props.showDate !== false;
  const showReadTime = props.showReadTime !== false;
  const showCategory = props.showCategory !== false;

  const ctaText = (props.ctaText as string) || "";
  const ctaUrl = (props.ctaUrl as string) || "/blog";

  const backgroundColor = (props.backgroundColor as string) || "";
  const taglineColor = (props.taglineColor as string) || "var(--site-secondary, #2563eb)";
  const headingColor = (props.headingColor as string) || "#0f172a";
  const subtitleColor = (props.subtitleColor as string) || "#64748b";
  const cardBgColor = (props.cardBgColor as string) || "#ffffff";
  const titleColor = (props.titleColor as string) || "#1e293b";
  const excerptColor = (props.excerptColor as string) || "#64748b";
  const metaColor = (props.metaColor as string) || "#94a3b8";
  const ctaColor = (props.ctaColor as string) || "var(--site-secondary, #2563eb)";

  const taglineFont = resolveBlockFont((props.taglineFont as string) || "");
  const headingFont = resolveBlockFont((props.headingFont as string) || "");
  const subtitleFont = resolveBlockFont((props.subtitleFont as string) || "");

  const where: Record<string, unknown> = { isPublished: true, deletedAt: null };
  if (categorySlug) {
    where.categories = { some: { category: { slug: categorySlug } } };
  }

  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    heroImageUrl: string | null;
    readTime: number | null;
    publishedAt: Date | null;
    categories: { category: { id: string; name: string; color: string | null } }[];
  }> = [];

  try {
    posts = await prisma.blogPost.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        heroImageUrl: true,
        readTime: true,
        publishedAt: true,
        categories: {
          include: {
            category: { select: { id: true, name: true, color: true } },
          },
        },
      },
    });
  } catch {
    posts = [];
  }

  if (posts.length === 0) return null;

  return (
    <section
      className="py-16"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className={`mx-auto ${MAX_WIDTH[maxWidth] ?? "max-w-6xl"} px-6 md:px-16`}>
        {(tagline || heading || subtitle) && (
          <div className="mb-10 max-w-2xl">
            {tagline && (
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: taglineColor, ...(taglineFont ?? {}) }}
              >
                {tagline}
              </p>
            )}
            {heading && (
              <h2
                className="mt-2 text-3xl font-semibold md:text-4xl"
                style={{ color: headingColor, ...(headingFont ?? {}) }}
              >
                {heading}
              </h2>
            )}
            {subtitle && (
              <p
                className="mt-3 text-base"
                style={{ color: subtitleColor, ...(subtitleFont ?? {}) }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-8 ${COLS[columns] ?? COLS["3"]}`}>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md"
              style={{ backgroundColor: cardBgColor }}
            >
              {showImage &&
                (post.heroImageUrl ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.heroImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                    <span className="text-6xl font-bold text-white/20">
                      {post.title.slice(0, 1)}
                    </span>
                  </div>
                ))}
              <div className="p-5">
                {showCategory && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.categories.map((pc) => (
                      <span
                        key={pc.category.id}
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor:
                            (pc.category.color || "var(--site-secondary, #2563eb)") + "20",
                          color: pc.category.color || "var(--site-secondary, #2563eb)",
                        }}
                      >
                        {pc.category.name}
                      </span>
                    ))}
                  </div>
                )}
                <h3
                  className="mt-2 line-clamp-2 text-xl font-semibold transition-colors group-hover:text-[var(--site-secondary)]"
                  style={{ color: titleColor }}
                >
                  {post.title}
                </h3>
                {showExcerpt && post.excerpt && (
                  <p
                    className="mt-2 line-clamp-3 text-sm"
                    style={{ color: excerptColor }}
                  >
                    {post.excerpt}
                  </p>
                )}
                {(showDate || showReadTime) && (
                  <div
                    className="mt-4 flex items-center gap-3 text-xs"
                    style={{ color: metaColor }}
                  >
                    {showDate && post.publishedAt && (
                      <time>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    )}
                    {showReadTime && post.readTime && (
                      <span>{post.readTime} min read</span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {ctaText && (
          <div className="mt-10 text-center">
            <Link
              href={ctaUrl}
              className="text-sm font-medium uppercase tracking-[0.12em] transition hover:brightness-110"
              style={{ color: ctaColor }}
            >
              {ctaText} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
