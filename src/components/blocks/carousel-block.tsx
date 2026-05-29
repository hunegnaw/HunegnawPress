"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { resolveBlockFont } from "@/lib/block-fonts";

interface CarouselBlockProps {
  props: Record<string, unknown>;
}

interface Slide {
  imageUrl: string;
  alt?: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaUrl?: string;
}

const MAX_WIDTH: Record<string, string> = {
  sm: "max-w-4xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

export function CarouselBlock({ props }: CarouselBlockProps) {
  const slides = (props.slides as Slide[]) ?? [];
  const autoplay = props.autoplay !== false;
  const interval = Math.max(2000, (props.interval as number) || 5000);
  const showArrows = props.showArrows !== false;
  const showDots = props.showDots !== false;
  const loop = props.loop !== false;
  const aspectRatio = (props.aspectRatio as string) || "16/9";
  const maxWidth = (props.maxWidth as string) || "lg";
  const rounded = props.rounded !== false;
  const overlayOpacity =
    typeof props.overlayOpacity === "number" ? props.overlayOpacity : 0.3;
  const backgroundColor = (props.backgroundColor as string) || "";
  const textColor = (props.textColor as string) || "#ffffff";
  const arrowColor = (props.arrowColor as string) || "#ffffff";
  const dotColor = (props.dotColor as string) || "#ffffff";
  const headingFont = resolveBlockFont((props.headingFont as string) || "");
  const subheadingFont = resolveBlockFont((props.subheadingFont as string) || "");
  const ctaButtonColor =
    (props.ctaButtonColor as string) || "var(--site-secondary, #2563eb)";
  const ctaButtonTextColor = (props.ctaButtonTextColor as string) || "#ffffff";

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      if (loop) {
        setIndex(((next % count) + count) % count);
      } else {
        setIndex(Math.max(0, Math.min(count - 1, next)));
      }
    },
    [count, loop]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!autoplay || paused || count <= 1) return;
    timer.current = setInterval(() => {
      setIndex((i) => (loop ? (i + 1) % count : Math.min(i + 1, count - 1)));
    }, interval);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [autoplay, paused, count, interval, loop]);

  if (count === 0) return null;

  return (
    <section
      className="py-12"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className={`mx-auto ${MAX_WIDTH[maxWidth] ?? "max-w-6xl"} px-6 md:px-16`}>
        <div
          className={`relative w-full overflow-hidden ${rounded ? "rounded-lg" : ""}`}
          style={{ aspectRatio }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          role="region"
          aria-roledescription="carousel"
        >
          {/* Track */}
          <div
            className="flex h-full w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((slide, i) => {
              const overlayContent = (
                <div className="relative h-full w-full shrink-0 grow-0 basis-full">
                  {slide.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={slide.imageUrl}
                      alt={slide.alt || slide.heading || ""}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  {(slide.heading || slide.subheading || slide.ctaText) && (
                    <>
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                        {slide.heading && (
                          <h3
                            className="text-3xl font-semibold md:text-5xl"
                            style={{ color: textColor, ...(headingFont ?? {}) }}
                          >
                            {slide.heading}
                          </h3>
                        )}
                        {slide.subheading && (
                          <p
                            className="max-w-2xl text-base md:text-lg"
                            style={{ color: textColor, ...(subheadingFont ?? {}) }}
                          >
                            {slide.subheading}
                          </p>
                        )}
                        {slide.ctaText && slide.ctaUrl && (
                          <Link
                            href={slide.ctaUrl}
                            className="mt-2 w-fit px-8 py-3 text-[11px] font-medium uppercase tracking-[0.12em] transition hover:brightness-110"
                            style={{
                              backgroundColor: ctaButtonColor,
                              color: ctaButtonTextColor,
                            }}
                          >
                            {slide.ctaText}
                          </Link>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );

              // If a slide has a link but no overlay CTA, make the whole slide clickable
              if (slide.ctaUrl && !slide.ctaText) {
                return (
                  <Link
                    key={i}
                    href={slide.ctaUrl}
                    className="block h-full w-full shrink-0 grow-0 basis-full"
                  >
                    {overlayContent}
                  </Link>
                );
              }
              return <div key={i} className="contents">{overlayContent}</div>;
            })}
          </div>

          {/* Arrows */}
          {showArrows && count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                disabled={!loop && index === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition hover:bg-black/50 disabled:opacity-30"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={arrowColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                disabled={!loop && index === count - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition hover:bg-black/50 disabled:opacity-30"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={arrowColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          )}

          {/* Dots */}
          {showDots && count > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === index ? "24px" : "8px",
                    backgroundColor: dotColor,
                    opacity: i === index ? 1 : 0.4,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
