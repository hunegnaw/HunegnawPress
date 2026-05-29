import React from "react";

export function parseHeading(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n").filter((l) => l.length > 0);

  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const nodes = parts.map((part, partIndex) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <em
            key={`${lineIndex}-${partIndex}`}
            style={{ color: "var(--site-secondary-light, #93c5fd)", fontStyle: "italic" }}
          >
            {part.slice(2, -2)}
          </em>
        );
      }
      return part;
    });

    if (lines.length === 1) {
      return <React.Fragment key={lineIndex}>{nodes}</React.Fragment>;
    }

    return (
      <span key={lineIndex} className="block">
        {nodes}
      </span>
    );
  });
}
