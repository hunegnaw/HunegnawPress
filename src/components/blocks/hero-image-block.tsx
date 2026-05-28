import { resolveBlockFont, resolveBlockFontVars } from "@/lib/block-fonts";

interface HeroImageBlockProps {
  props: Record<string, unknown>;
}

interface HeroStat {
  label: string;
  value: string;
  note: string;
}

export function HeroImageBlock({ props }: HeroImageBlockProps) {
  const heading = (props.heading as string) ?? "";
  const subheading = (props.subheading as string) ?? "";
  const ctaText = (props.ctaText as string) ?? "";
  const ctaUrl = (props.ctaUrl as string) ?? "";
  const imageUrl = (props.imageUrl as string) ?? "";
  const overlayOpacity = (props.overlayOpacity as number) ?? 0.5;
  const backgroundColor = (props.backgroundColor as string) ?? "#1e293b";
  const height = (props.height as string) ?? "70vh";
  const textAlign = (props.textAlign as string) ?? "center";
  const tagline = (props.tagline as string) ?? "";
  const showGrid = !!props.showGrid;
  const showDivider = !!props.showDivider;
  const showStats = !!props.showStats;
  const stats = (props.stats as HeroStat[]) ?? [];

  const statsBackgroundColor = (props.statsBackgroundColor as string) || "rgba(16,28,18,0.7)";
  const statsBorderColor = (props.statsBorderColor as string) || "rgba(255,255,255,0.08)";
  const statsLabelColor = (props.statsLabelColor as string) || "rgba(255,255,255,0.4)";
  const statsValueColor = (props.statsValueColor as string) || "rgba(255,255,255,0.9)";
  const statsNoteColor = (props.statsNoteColor as string) || "rgba(255,255,255,0.25)";

  const statsLabelFont = resolveBlockFont((props.statsLabelFont as string) || "");
  const statsValueFont = resolveBlockFont((props.statsValueFont as string) || "");
  const statsNoteFont = resolveBlockFont((props.statsNoteFont as string) || "");

  const headingFont = resolveBlockFontVars((props.headingFont as string) || "", "h1");
  const subheadingFont = resolveBlockFont((props.subheadingFont as string) || "");
  const ctaButtonFont = resolveBlockFont((props.ctaButtonFont as string) || "");
  const taglineFont = resolveBlockFont((props.taglineFont as string) || "");

  const headingColor = (props.headingColor as string) || "";
  const subheadingColor = (props.subheadingColor as string) || "";
  const ctaButtonColor = (props.ctaButtonColor as string) || "#2563eb";
  const ctaButtonTextColor = (props.ctaButtonTextColor as string) || "#ffffff";
  const taglineColor = (props.taglineColor as string) || "";

  const alignClass =
    textAlign === "left"
      ? "text-left items-start"
      : textAlign === "right"
        ? "text-right items-end"
        : "text-center items-center";

  const contentMaxWidth =
    textAlign === "center" ? "max-w-4xl" : "max-w-3xl";

  const hasStats = showStats && stats.length > 0;

  return (
    <section
      className="relative flex items-center justify-center bg-cover bg-center"
      style={{
        minHeight: height,
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundColor,
      }}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Grid pattern overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* Radial gradient overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(37,99,235,0.08) 0%, transparent 60%)",
          }}
        />
      )}

      {/* Content wrapper — grid when stats present */}
      <div
        className="relative z-10 w-full h-full px-16"
        style={hasStats ? {
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          alignItems: "end",
          paddingBottom: "4rem",
          paddingTop: "10rem",
        } : undefined}
      >
        {/* Main content */}
        <div
          className={hasStats ? "" : `mx-auto ${contentMaxWidth} flex flex-col ${alignClass}`}
          style={hasStats ? {
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          } : {
            justifyContent: textAlign === "left" ? "flex-end" : "center",
          }}
        >
          {tagline && (
            <div className="mb-4 flex items-center gap-3">
              <span
                className="inline-block h-px w-6"
                style={{
                  backgroundColor:
                    taglineColor || "var(--font-section-tag-color, #2563eb)",
                }}
              />
              <span
                className="uppercase tracking-[0.18em]"
                style={{
                  fontFamily:
                    "var(--font-section-tag-family, Inter), sans-serif",
                  fontSize: "var(--font-section-tag-size, 10px)",
                  fontWeight:
                    "var(--font-section-tag-weight, 400)" as unknown as number,
                  color:
                    taglineColor || "var(--font-section-tag-color, #2563eb)",
                  ...(taglineFont ?? {}),
                }}
              >
                {tagline}
              </span>
            </div>
          )}
          {heading && (
            <h1
              className="heading-dark leading-[1.05] tracking-tight text-white"
              style={{
                ...(headingFont ?? {}),
                ...(headingColor ? { color: headingColor } : {}),
              }}
              dangerouslySetInnerHTML={{ __html: heading }}
            />
          )}
          {subheading && (
            <p
              className="subtitle-font mt-6"
              style={{
                fontFamily: "var(--font-subtitle-family, 'Inter'), sans-serif",
                fontWeight: "var(--font-subtitle-weight, 300)" as unknown as number,
                fontStyle: "var(--font-subtitle-style, normal)",
                fontSize: "clamp(16px, 2vw, 22px)",
                lineHeight: 1.6,
                color: subheadingColor || "rgba(147,197,253,0.65)",
                ...(subheadingFont ?? {}),
              }}
              dangerouslySetInnerHTML={{ __html: subheading }}
            />
          )}
          {ctaText && ctaUrl && (
            <a
              href={ctaUrl}
              className="mt-10 inline-block px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.12em] transition hover:brightness-110"
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
        </div>

        {/* Stats card — right side, hidden on mobile */}
        {hasStats && (
          <div
            className="hero-stats-card"
            style={{
              alignSelf: "end",
              background: statsBackgroundColor,
              border: `1px solid ${statsBorderColor}`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              padding: "1.5rem",
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: i < stats.length - 1 ? "1rem" : undefined,
                  marginBottom: i < stats.length - 1 ? "1rem" : undefined,
                  borderBottom: i < stats.length - 1 ? `1px solid ${statsBorderColor}` : undefined,
                }}
              >
                <div
                  style={{
                    fontSize: "0.64rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: statsLabelColor,
                    fontFamily: "var(--font-body-family, Inter), sans-serif",
                    ...(statsLabelFont ?? {}),
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "1.65rem",
                    fontWeight: 400,
                    color: statsValueColor,
                    lineHeight: 1.2,
                    marginTop: "0.25rem",
                    fontFamily: "var(--font-hero-title-family, 'Inter'), sans-serif",
                    ...(statsValueFont ?? {}),
                  }}
                >
                  {stat.value}
                </div>
                {stat.note && (
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: statsNoteColor,
                      marginTop: "0.15rem",
                      fontFamily: "var(--font-body-family, Inter), sans-serif",
                      ...(statsNoteFont ?? {}),
                    }}
                  >
                    {stat.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom divider */}
      {showDivider && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #2563eb 50%, transparent 100%)",
          }}
        />
      )}

      {/* Responsive: hide stats card on mobile */}
      {hasStats && (
        <style>{`
          @media (max-width: 960px) {
            .hero-stats-card { display: none !important; }
            .relative.z-10.w-full.h-full {
              display: flex !important;
              grid-template-columns: unset !important;
              align-items: center !important;
            }
          }
        `}</style>
      )}
    </section>
  );
}
