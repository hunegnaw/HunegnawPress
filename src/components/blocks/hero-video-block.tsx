"use client";

import { useRef, useEffect } from "react";
import { resolveBlockFont, resolveBlockFontVars } from "@/lib/block-fonts";

interface HeroVideoBlockProps {
  props: Record<string, unknown>;
}

interface HeroStat {
  label: string;
  value: string;
  note: string;
}

export function HeroVideoBlock({ props }: HeroVideoBlockProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const tagline = (props.tagline as string) ?? "";
  const heading = (props.heading as string) ?? "";
  const subheading = (props.subheading as string) ?? "";
  const ctaText = (props.ctaText as string) ?? "";
  const ctaUrl = (props.ctaUrl as string) ?? "";
  const ctaText2 = (props.ctaText2 as string) ?? "";
  const ctaUrl2 = (props.ctaUrl2 as string) ?? "";
  const videoUrl = (props.videoUrl as string) ?? "";
  const posterImageUrl = (props.posterImageUrl as string) ?? "";
  const overlayOpacity = (props.overlayOpacity as number) ?? 0.5;
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

  const taglineFont = resolveBlockFont((props.taglineFont as string) || "");
  const headingFont = resolveBlockFontVars((props.headingFont as string) || "", "h1");
  const subheadingFont = resolveBlockFont((props.subheadingFont as string) || "");
  const ctaButtonFont = resolveBlockFont((props.ctaButtonFont as string) || "");
  const cta2ButtonFont = resolveBlockFont((props.cta2ButtonFont as string) || "");

  const taglineColor = (props.taglineColor as string) || "";
  const headingColor = (props.headingColor as string) || "";
  const subheadingColor = (props.subheadingColor as string) || "";
  const ctaButtonColor = (props.ctaButtonColor as string) || "#2563eb";
  const ctaButtonTextColor = (props.ctaButtonTextColor as string) || "#ffffff";
  const cta2ButtonColor = (props.cta2ButtonColor as string) || "";
  const cta2ButtonTextColor = (props.cta2ButtonTextColor as string) || "";
  const backgroundColor = (props.backgroundColor as string) || "";

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const hasStats = showStats && stats.length > 0;

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden" style={backgroundColor ? { backgroundColor } : undefined}>
      {/* Background radial gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(37,99,235,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(30,41,59,0.6) 0%, transparent 50%)",
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(147,197,253,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.03) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Video background */}
      {videoUrl ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={posterImageUrl || undefined}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-[#1e293b]" />
      )}

      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content wrapper — grid when stats present */}
      <div
        className="relative z-10 w-full px-16 pb-16 pt-40"
        style={hasStats ? {
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          alignItems: "end",
          gap: "2rem",
        } : undefined}
      >
        <div className={hasStats ? "" : "max-w-[900px]"}>
          {/* Tagline */}
          {tagline && (
            <div
              className="mb-7 flex items-center gap-3"
              style={{ animation: "fadeUp 0.8s ease 0.1s both" }}
            >
              <span
                className="inline-block h-px w-8"
                style={{ backgroundColor: "var(--font-section-tag-color, #2563eb)" }}
              />
              <span
                className="uppercase tracking-[0.2em]"
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

          {/* Heading */}
          {heading && (
            <h1
              className="heading-dark leading-[1.05] tracking-tight text-white"
              style={{
                animation: "fadeUp 0.8s ease 0.25s both",
                ...(headingFont ?? {}),
                ...(headingColor ? { color: headingColor } : {}),
              }}
              dangerouslySetInnerHTML={{ __html: heading }}
            />
          )}

          {/* Subtitle */}
          {subheading && (
            <p
              className="subtitle-font mt-6 max-w-[600px]"
              style={{
                fontFamily: "var(--font-subtitle-family, 'Inter'), sans-serif",
                fontWeight: "var(--font-subtitle-weight, 300)" as unknown as number,
                fontStyle: "var(--font-subtitle-style, normal)",
                fontSize: "clamp(16px, 2vw, 22px)",
                lineHeight: 1.6,
                color: subheadingColor || "rgba(147,197,253,0.65)",
                animation: "fadeUp 0.8s ease 0.4s both",
                ...(subheadingFont ?? {}),
              }}
              dangerouslySetInnerHTML={{ __html: subheading }}
            />
          )}

          {/* CTA Buttons */}
          {(ctaText || ctaText2) && (
            <div
              className="mt-10 flex flex-wrap gap-4"
              style={{ animation: "fadeUp 0.8s ease 0.55s both" }}
            >
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
                  className="inline-block px-8 py-3.5 text-[11px] font-normal uppercase tracking-[0.12em] transition hover:border-[#93c5fd] hover:text-[#93c5fd]"
                  style={{
                    fontFamily: "var(--font-body-family, Inter), sans-serif",
                    border: `0.5px solid ${cta2ButtonColor || "rgba(147,197,253,0.4)"}`,
                    color: cta2ButtonTextColor || "rgba(147,197,253,0.8)",
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
              animation: "fadeUp 0.8s ease 0.7s both",
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

      {/* Divider at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)",
        }}
      />

      {/* Responsive: hide stats card on mobile */}
      {hasStats && (
        <style>{`
          @media (max-width: 960px) {
            .hero-stats-card { display: none !important; }
          }
        `}</style>
      )}
    </section>
  );
}
