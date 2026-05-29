"use client";

import { useState } from "react";
import Link from "next/link";
import { resolveBlockFont, resolveBlockFontVars } from "@/lib/block-fonts";

interface AssetCardsBlockProps {
  props: Record<string, unknown>;
}

export function AssetCardsBlock({ props }: AssetCardsBlockProps) {
  const tagline = (props.tagline as string) ?? "";
  const heading = (props.heading as string) ?? "";
  const subtitle = (props.subtitle as string) ?? "";
  const cards =
    (props.cards as { name: string; description: string; url?: string }[]) ?? [];
  const backgroundColor = (props.backgroundColor as string) || "#f8fafc";
  const taglineColor = (props.taglineColor as string) || "";
  const taglineAccentColor = (props.taglineAccentColor as string) || "";
  const headingColor = (props.headingColor as string) || "";
  const subtitleColor = (props.subtitleColor as string) || "";
  const maxWidth = (props.maxWidth as string) ?? "xl";

  const maxWidthClass: Record<string, string> = {
    sm: "max-w-4xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  // Card colors — all customizable
  const cardBgColor = (props.cardBgColor as string) || "#ffffff";
  const cardHoverBgColor = (props.cardHoverBgColor as string) || "#1e293b";
  const cardNameColor = (props.cardNameColor as string) || "#1e293b";
  const cardNameHoverColor = (props.cardNameHoverColor as string) || "var(--site-secondary-light, #93c5fd)";
  const cardDescColor = (props.cardDescColor as string) || "#64748b";
  const cardDescHoverColor = (props.cardDescHoverColor as string) || "rgba(255,255,255,0.55)";
  const cardIndexColor = (props.cardIndexColor as string) || "rgba(15,23,42,0.06)";
  const cardIndexHoverColor = (props.cardIndexHoverColor as string) || "rgb(var(--site-secondary-rgb, 147 197 253) / 0.2)";
  const cardSeparatorColor = (props.cardSeparatorColor as string) || "var(--site-secondary, #2563eb)";
  const cardLinkColor = (props.cardLinkColor as string) || "var(--site-secondary, #2563eb)";
  const cardLinkHoverColor = (props.cardLinkHoverColor as string) || "var(--site-secondary-light, #93c5fd)";
  const cardLinkText = (props.cardLinkText as string) || "Explore";
  const gridBorderColor = (props.gridBorderColor as string) || "rgba(15,23,42,0.1)";

  const taglineFont = resolveBlockFont((props.taglineFont as string) || "");
  const headingFont = resolveBlockFontVars((props.headingFont as string) || "", "h2");
  const subtitleFont = resolveBlockFont((props.subtitleFont as string) || "");
  const cardNameFont = resolveBlockFontVars((props.cardNameFont as string) || "", "h3");
  const cardDescFont = resolveBlockFont((props.cardDescFont as string) || "");

  return (
    <section style={{ backgroundColor }} className="py-24 md:py-28">
      <div className={`mx-auto ${maxWidthClass[maxWidth] ?? "max-w-7xl"} px-6 md:px-16`}>
        <div className="mb-14">
          {tagline && (
            <div className="mb-4 flex items-center gap-3">
              <span
                className="inline-block h-px w-6"
                style={{ backgroundColor: taglineAccentColor || taglineColor || "var(--font-section-tag-color, var(--site-secondary, #2563eb))" }}
              />
              <span
                className="uppercase tracking-[0.18em]"
                style={{
                  fontFamily: "var(--font-section-tag-family, Inter), sans-serif",
                  fontSize: "var(--font-section-tag-size, 10px)",
                  fontWeight: "var(--font-section-tag-weight, 400)" as unknown as number,
                  color: taglineColor || "var(--font-section-tag-color, var(--site-secondary, #2563eb))",
                  ...(taglineFont ?? {}),
                }}
              >
                {tagline}
              </span>
            </div>
          )}
          {heading && (
            <h2
              className="heading-light leading-[1.15]"
              style={{
                color: headingColor || undefined,
                ...(headingFont ?? {}),
              }}
              dangerouslySetInnerHTML={{ __html: heading }}
            />
          )}
          {subtitle && (
            <p
              className="mt-2 leading-relaxed"
              style={{
                fontFamily: "var(--font-subtitle-family, 'Inter'), sans-serif",
                fontWeight: "var(--font-subtitle-weight, 300)" as unknown as number,
                fontStyle: "var(--font-subtitle-style, normal)",
                fontSize: "var(--font-subtitle-size, 18px)",
                color: subtitleColor || "var(--font-subtitle-color, #64748b)",
                ...(subtitleFont ?? {}),
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: "1px", backgroundColor: gridBorderColor }}
        >
          {cards.map((card, i) => (
            <AssetCard
              key={i}
              card={card}
              index={i}
              cardBgColor={cardBgColor}
              cardHoverBgColor={cardHoverBgColor}
              cardNameColor={cardNameColor}
              cardNameHoverColor={cardNameHoverColor}
              cardDescColor={cardDescColor}
              cardDescHoverColor={cardDescHoverColor}
              cardIndexColor={cardIndexColor}
              cardIndexHoverColor={cardIndexHoverColor}
              cardSeparatorColor={cardSeparatorColor}
              cardLinkColor={cardLinkColor}
              cardLinkHoverColor={cardLinkHoverColor}
              cardLinkText={cardLinkText}
              cardNameFont={cardNameFont}
              cardDescFont={cardDescFont}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AssetCard({
  card,
  index,
  cardBgColor,
  cardHoverBgColor,
  cardNameColor,
  cardNameHoverColor,
  cardDescColor,
  cardDescHoverColor,
  cardIndexColor,
  cardIndexHoverColor,
  cardSeparatorColor,
  cardLinkColor,
  cardLinkHoverColor,
  cardLinkText,
  cardNameFont,
  cardDescFont,
}: {
  card: { name: string; description: string; url?: string };
  index: number;
  cardBgColor: string;
  cardHoverBgColor: string;
  cardNameColor: string;
  cardNameHoverColor: string;
  cardDescColor: string;
  cardDescHoverColor: string;
  cardIndexColor: string;
  cardIndexHoverColor: string;
  cardSeparatorColor: string;
  cardLinkColor: string;
  cardLinkHoverColor: string;
  cardLinkText: string;
  cardNameFont: import("react").CSSProperties | null;
  cardDescFont: import("react").CSSProperties | null;
}) {
  const [hovered, setHovered] = useState(false);

  const content = (
    <div
      className="relative overflow-hidden px-7 py-9 transition-all duration-300"
      style={{
        backgroundColor: hovered ? cardHoverBgColor : cardBgColor,
        cursor: card.url ? "pointer" : "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="pointer-events-none absolute right-5 top-4 leading-none transition-colors duration-300"
        style={{
          fontFamily: "var(--font-section-heading-family, 'Inter'), sans-serif",
          fontSize: "72px",
          fontWeight: 300,
          color: hovered ? cardIndexHoverColor : cardIndexColor,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      <div
        className="mb-5 h-px w-8"
        style={{ backgroundColor: cardSeparatorColor }}
      />

      <h3
        className="mb-3 transition-colors duration-300"
        style={{
          fontFamily: "var(--font-section-heading-family, 'Inter'), sans-serif",
          fontSize: "22px",
          fontWeight: 500,
          color: hovered ? cardNameHoverColor : cardNameColor,
          ...(cardNameFont ?? {}),
        }}
      >
        {card.name}
      </h3>

      <p
        className="mb-5 leading-[1.7] transition-colors duration-300"
        style={{
          fontFamily: "var(--font-body-family, Inter), sans-serif",
          fontSize: "12px",
          fontWeight: 300,
          color: hovered ? cardDescHoverColor : cardDescColor,
          ...(cardDescFont ?? {}),
        }}
      >
        {card.description}
      </p>

      {cardLinkText && (
        <span
          className="tracking-[0.1em] transition-colors duration-300"
          style={{
            fontFamily: "var(--font-body-family, Inter), sans-serif",
            fontSize: "11px",
            color: hovered ? cardLinkHoverColor : cardLinkColor,
          }}
        >
          {cardLinkText} &rarr;
        </span>
      )}
    </div>
  );

  if (card.url) {
    return (
      <Link href={card.url} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
