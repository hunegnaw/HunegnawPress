import Link from "next/link";
import { resolveBlockFont } from "@/lib/block-fonts";

interface TeamBlockProps {
  props: Record<string, unknown>;
}

interface Member {
  name: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  url?: string;
}

const MAX_WIDTH: Record<string, string> = {
  sm: "max-w-4xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

const COLS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

const SHAPE: Record<string, string> = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
  square: "rounded-none",
};

export function TeamBlock({ props }: TeamBlockProps) {
  const members = (props.members as Member[]) ?? [];
  const tagline = (props.tagline as string) || "";
  const heading = (props.heading as string) || "";
  const subtitle = (props.subtitle as string) || "";
  const columns = (props.columns as string) || "3";
  const maxWidth = (props.maxWidth as string) || "lg";
  const imageShape = (props.imageShape as string) || "circle";

  const backgroundColor = (props.backgroundColor as string) || "";
  const taglineColor = (props.taglineColor as string) || "var(--site-secondary, #2563eb)";
  const headingColor = (props.headingColor as string) || "#0f172a";
  const subtitleColor = (props.subtitleColor as string) || "#64748b";
  const cardBgColor = (props.cardBgColor as string) || "";
  const nameColor = (props.nameColor as string) || "#1e293b";
  const roleColor = (props.roleColor as string) || "var(--site-secondary, #2563eb)";
  const bioColor = (props.bioColor as string) || "#64748b";
  const socialColor = (props.socialColor as string) || "#94a3b8";

  const taglineFont = resolveBlockFont((props.taglineFont as string) || "");
  const headingFont = resolveBlockFont((props.headingFont as string) || "");
  const subtitleFont = resolveBlockFont((props.subtitleFont as string) || "");
  const nameFont = resolveBlockFont((props.nameFont as string) || "");

  if (members.length === 0) return null;

  return (
    <section
      className="py-16"
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className={`mx-auto ${MAX_WIDTH[maxWidth] ?? "max-w-6xl"} px-6 md:px-16`}>
        {(tagline || heading || subtitle) && (
          <div className="mb-12 max-w-2xl">
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
          {members.map((member, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center ${cardBgColor ? "rounded-2xl p-6" : ""}`}
              style={cardBgColor ? { backgroundColor: cardBgColor } : undefined}
            >
              {member.imageUrl ? (
                <div
                  className={`mb-4 aspect-square w-32 overflow-hidden bg-gray-100 ${SHAPE[imageShape] ?? "rounded-full"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`mb-4 flex aspect-square w-32 items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800 ${SHAPE[imageShape] ?? "rounded-full"}`}
                >
                  <span className="text-3xl font-semibold text-white/40">
                    {member.name.slice(0, 1)}
                  </span>
                </div>
              )}
              <h3
                className="text-lg font-semibold"
                style={{ color: nameColor, ...(nameFont ?? {}) }}
              >
                {member.name}
              </h3>
              {member.role && (
                <p
                  className="mt-0.5 text-sm font-medium"
                  style={{ color: roleColor }}
                >
                  {member.role}
                </p>
              )}
              {member.bio && (
                <p className="mt-3 text-sm" style={{ color: bioColor }}>
                  {member.bio}
                </p>
              )}
              {(member.linkedin || member.twitter || member.email || member.url) && (
                <div
                  className="mt-4 flex items-center gap-3"
                  style={{ color: socialColor }}
                >
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="transition hover:text-[var(--site-secondary)]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 17V9.99H6V17h2.34zM7.17 8.92a1.36 1.36 0 1 0 0-2.71 1.36 1.36 0 0 0 0 2.71zM18 17v-3.84c0-2.05-.44-3.63-2.84-3.63-1.15 0-1.92.63-2.24 1.23h-.03V9.99H10.6V17h2.34v-3.47c0-.92.17-1.8 1.3-1.8 1.13 0 1.14 1.05 1.14 1.86V17H18z" />
                      </svg>
                    </a>
                  )}
                  {member.twitter && (
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on X`}
                      className="transition hover:text-[var(--site-secondary)]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                      </svg>
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      aria-label={`Email ${member.name}`}
                      className="transition hover:text-[var(--site-secondary)]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-10 5L2 7" />
                      </svg>
                    </a>
                  )}
                  {member.url && (
                    <Link
                      href={member.url}
                      aria-label={`${member.name} profile`}
                      className="transition hover:text-[var(--site-secondary)]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
