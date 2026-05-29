"use client";

import { useState } from "react";
import { resolveBlockFont } from "@/lib/block-fonts";

interface AccordionBlockProps {
  props: Record<string, unknown>;
}

interface Item {
  title: string;
  content: string;
}

const MAX_WIDTH: Record<string, string> = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  full: "max-w-full",
};

export function AccordionBlock({ props }: AccordionBlockProps) {
  const items = (props.items as Item[]) ?? [];
  const layout = (props.layout as string) === "tabs" ? "tabs" : "accordion";
  const heading = (props.heading as string) || "";
  const allowMultiple = props.allowMultiple === true;
  const maxWidth = (props.maxWidth as string) || "lg";

  const backgroundColor = (props.backgroundColor as string) || "";
  const headingColor = (props.headingColor as string) || "#0f172a";
  const titleColor = (props.titleColor as string) || "#1e293b";
  const contentColor = (props.contentColor as string) || "#64748b";
  const borderColor = (props.borderColor as string) || "#e2e8f0";
  const activeColor = (props.activeColor as string) || "var(--site-secondary, #2563eb)";

  const headingFont = resolveBlockFont((props.headingFont as string) || "");
  const titleFont = resolveBlockFont((props.titleFont as string) || "");

  const [openSet, setOpenSet] = useState<Set<number>>(new Set([0]));
  const [activeTab, setActiveTab] = useState(0);

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        if (!allowMultiple) next.clear();
        next.add(i);
      }
      return next;
    });
  };

  if (items.length === 0) return null;

  return (
    <section
      className="py-16"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className={`mx-auto ${MAX_WIDTH[maxWidth] ?? "max-w-4xl"} px-6 md:px-16`}>
        {heading && (
          <h2
            className="mb-8 text-3xl font-semibold md:text-4xl"
            style={{ color: headingColor, ...(headingFont ?? {}) }}
          >
            {heading}
          </h2>
        )}

        {layout === "tabs" ? (
          <div>
            <div
              className="flex flex-wrap gap-1 border-b"
              style={{ borderColor }}
              role="tablist"
            >
              {items.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === i}
                  onClick={() => setActiveTab(i)}
                  className="-mb-px border-b-2 px-4 py-3 text-sm font-medium transition"
                  style={{
                    borderColor: activeTab === i ? activeColor : "transparent",
                    color: activeTab === i ? activeColor : titleColor,
                    ...(titleFont ?? {}),
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <div
              className="prose prose-slate mt-6 max-w-none"
              style={{ color: contentColor }}
              dangerouslySetInnerHTML={{ __html: items[activeTab]?.content || "" }}
            />
          </div>
        ) : (
          <div className="divide-y rounded-lg border" style={{ borderColor }}>
            {items.map((item, i) => {
              const open = openSet.has(i);
              return (
                <div key={i} style={{ borderColor }}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span
                      className="text-base font-medium"
                      style={{ color: open ? activeColor : titleColor, ...(titleFont ?? {}) }}
                    >
                      {item.title}
                    </span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={open ? activeColor : titleColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="prose prose-slate max-w-none px-5 pb-5 text-sm"
                        style={{ color: contentColor }}
                        dangerouslySetInnerHTML={{ __html: item.content || "" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
