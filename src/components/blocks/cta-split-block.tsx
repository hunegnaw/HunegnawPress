"use client";

import { resolveBlockFont, resolveBlockFontVars } from "@/lib/block-fonts";

interface CtaSplitBlockProps {
  props: Record<string, unknown>;
}

export function CtaSplitBlock({ props }: CtaSplitBlockProps) {
  const tagline = (props.tagline as string) ?? "";
  const heading = (props.heading as string) ?? "";
  const description = (props.description as string) ?? "";
  const ctaText = (props.ctaText as string) ?? "";
  const ctaUrl = (props.ctaUrl as string) ?? "";
  const ctaText2 = (props.ctaText2 as string) ?? "";
  const ctaUrl2 = (props.ctaUrl2 as string) ?? "";
  const bullets = (props.bullets as { text: string }[]) ?? [];
  const backgroundColor = (props.backgroundColor as string) || "#f8fafc";
  const headingColor = (props.headingColor as string) || "";
  const descriptionColor = (props.descriptionColor as string) || "#64748b";
  const bulletColor = (props.bulletColor as string) || "#0f172a";
  const ctaButtonColor = (props.ctaButtonColor as string) || "#2563eb";
  const ctaButtonTextColor = (props.ctaButtonTextColor as string) || "#ffffff";
  const maxWidth = (props.maxWidth as string) ?? "xl";
  const MAX_WIDTH: Record<string, string> = { sm: "max-w-4xl", md: "max-w-5xl", lg: "max-w-6xl", xl: "max-w-7xl", full: "max-w-full" };

  const taglineColor = (props.taglineColor as string) || "";
  const cta2ButtonColor = (props.cta2ButtonColor as string) || "";
  const cta2ButtonTextColor = (props.cta2ButtonTextColor as string) || "";

  const headingFont = resolveBlockFontVars((props.headingFont as string) || "", "h2");
  const descriptionFont = resolveBlockFont((props.descriptionFont as string) || "");
  const bulletFont = resolveBlockFont((props.bulletFont as string) || "");
  const taglineFont = resolveBlockFont((props.taglineFont as string) || "");
  const ctaButtonFont = resolveBlockFont((props.ctaButtonFont as string) || "");
  const cta2ButtonFont = resolveBlockFont((props.cta2ButtonFont as string) || "");

  return (
    <section style={{ backgroundColor }} className="py-24 md:py-28">
      <div className={`mx-auto ${MAX_WIDTH[maxWidth] ?? "max-w-7xl"} px-16`}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            {tagline && (
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="inline-block h-px w-6"
                  style={{ backgroundColor: taglineColor || "var(--font-section-tag-color, #2563eb)" }}
                />
                <span
                  className="uppercase tracking-[0.18em]"
                  style={{
                    fontFamily: "var(--font-section-tag-family, Inter), sans-serif",
                    fontSize: "var(--font-section-tag-size, 10px)",
                    fontWeight: "var(--font-section-tag-weight, 400)" as unknown as number,
                    color: taglineColor || "var(--font-section-tag-color, #2563eb)",
                    ...(taglineFont ?? {}),
                  }}
                >
                  {tagline}
                </span>
              </div>
            )}
            {heading && (
              <h2
                className="heading-light leading-[1.15] mb-4"
                style={{
                  color: headingColor || undefined,
                  ...(headingFont ?? {}),
                }}
                dangerouslySetInnerHTML={{ __html: heading }}
              />
            )}
            {description && (
              <p
                className="leading-[1.8]"
                style={{
                  fontFamily: "var(--font-body-family, Inter), sans-serif",
                  fontSize: "13px",
                  fontWeight: 300,
                  color: descriptionColor,
                  ...(descriptionFont ?? {}),
                }}
              >
                {description}
              </p>
            )}
            {(ctaText || ctaText2) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {ctaText && ctaUrl && (
                  <a
                    href={ctaUrl}
                    className="inline-block px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.12em] transition hover:brightness-110"
                    style={{
                      fontFamily: "var(--font-body-family, Inter), sans-serif",
                      backgroundColor: ctaButtonColor,
                      color: ctaButtonTextColor,
                      ...(ctaButtonFont ?? {}),
                    }}
                  >
                    {ctaText}
                  </a>
                )}
                {ctaText2 && ctaUrl2 && (
                  <a
                    href={ctaUrl2}
                    className="inline-block px-8 py-3.5 text-[11px] font-normal uppercase tracking-[0.12em] transition hover:bg-gray-100"
                    style={{
                      fontFamily: "var(--font-body-family, Inter), sans-serif",
                      border: `0.5px solid ${cta2ButtonColor || "rgba(15,23,42,0.3)"}`,
                      color: cta2ButtonTextColor || "#334155",
                      ...(cta2ButtonColor ? { backgroundColor: cta2ButtonColor } : {}),
                      ...(cta2ButtonFont ?? {}),
                    }}
                  >
                    {ctaText2}
                  </a>
                )}
              </div>
            )}
          </div>

          {bullets.length > 0 && (
            <div
              className="border-l pl-10 lg:pl-16"
              style={{ borderColor: "rgba(15,23,42,0.12)" }}
            >
              <div className="flex flex-col gap-4">
                {bullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: "#2563eb" }}
                    />
                    <span
                      className="leading-[1.6]"
                      style={{
                        fontFamily: "var(--font-body-family, Inter), sans-serif",
                        fontSize: "12px",
                        fontWeight: 300,
                        color: bulletColor,
                        ...(bulletFont ?? {}),
                      }}
                      dangerouslySetInnerHTML={{ __html: bullet.text }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
