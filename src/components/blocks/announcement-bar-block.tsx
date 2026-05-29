"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { resolveBlockFont } from "@/lib/block-fonts";

interface AnnouncementBarBlockProps {
  props: Record<string, unknown>;
}

export function AnnouncementBarBlock({ props }: AnnouncementBarBlockProps) {
  const text = (props.text as string) || "";
  const emoji = (props.emoji as string) || "";
  const linkText = (props.linkText as string) || "";
  const linkUrl = (props.linkUrl as string) || "";
  const dismissible = props.dismissible !== false;
  const sticky = props.sticky === true;
  const align = (props.align as string) || "center";

  const backgroundColor =
    (props.backgroundColor as string) || "var(--site-secondary, #2563eb)";
  const textColor = (props.textColor as string) || "#ffffff";
  const linkColor = (props.linkColor as string) || "#ffffff";

  const textFont = resolveBlockFont((props.textFont as string) || "");

  // Stable key so dismissal is remembered per message content
  const storageKey = `announcement-dismissed:${text.slice(0, 60)}`;

  // When dismissible, start hidden so SSR and initial client render match (both
  // render nothing); the effect then reveals it unless previously dismissed.
  const [hidden, setHidden] = useState(dismissible);

  useEffect(() => {
    if (!dismissible) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(storageKey) === "1";
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing visibility from localStorage (external system) on mount
    setHidden(dismissed);
  }, [dismissible, storageKey]);

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  };

  if (!text || hidden) return null;

  const justify =
    align === "left"
      ? "justify-start"
      : align === "right"
        ? "justify-end"
        : "justify-center";

  return (
    <div
      className={`${sticky ? "sticky top-0 z-40" : "relative"} w-full`}
      style={{ backgroundColor }}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center gap-3 px-6 py-2.5 md:px-16 ${justify}`}
      >
        <p
          className="flex items-center gap-2 text-sm"
          style={{ color: textColor, ...(textFont ?? {}) }}
        >
          {emoji && <span aria-hidden="true">{emoji}</span>}
          <span>{text}</span>
          {linkText && linkUrl && (
            <Link
              href={linkUrl}
              className="font-semibold underline underline-offset-2 transition hover:opacity-80"
              style={{ color: linkColor }}
            >
              {linkText}
            </Link>
          )}
        </p>
        {dismissible && (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="absolute right-4 flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-black/10"
            style={{ color: textColor }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
