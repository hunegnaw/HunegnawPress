export interface BrandColor {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
}

export interface BrandColorCategory {
  id: string;
  label: string;
  colors: BrandColor[];
}

export const DEFAULT_BRAND_PALETTE: BrandColorCategory[] = [
  {
    id: "primary",
    label: "Primary Colors",
    colors: [
      { name: "Slate", hex: "#1e293b", rgb: "30, 41, 59", usage: "Primary bg, header, sidebar" },
      { name: "Blue", hex: "#2563eb", rgb: "37, 99, 235", usage: "Accent, active states, CTA" },
      { name: "Blue Light", hex: "#93c5fd", rgb: "147, 197, 253", usage: "Highlights on dark backgrounds" },
    ],
  },
  {
    id: "secondary",
    label: "Secondary Colors",
    colors: [
      { name: "Slate Dark", hex: "#0f172a", rgb: "15, 23, 42", usage: "Sidebar, hover states" },
      { name: "Blue Dark", hex: "#1d4ed8", rgb: "29, 78, 216", usage: "Darker accent" },
      { name: "Blue Tint", hex: "#eff6ff", rgb: "239, 246, 255", usage: "Tags, alerts, selected rows" },
      { name: "White", hex: "#FFFFFF", rgb: "255, 255, 255", usage: "Text on dark backgrounds" },
    ],
  },
  {
    id: "blue-scale",
    label: "Blue Scale",
    colors: [
      { name: "Blue 50", hex: "#eff6ff", rgb: "239, 246, 255", usage: "Lightest blue tint" },
      { name: "Blue 100", hex: "#dbeafe", rgb: "219, 234, 254", usage: "Light blue background" },
      { name: "Blue 200", hex: "#bfdbfe", rgb: "191, 219, 254", usage: "Light blue" },
      { name: "Blue 300", hex: "#93c5fd", rgb: "147, 197, 253", usage: "Mid blue" },
      { name: "Blue 500", hex: "#3b82f6", rgb: "59, 130, 246", usage: "Standard blue" },
      { name: "Blue 600", hex: "#2563eb", rgb: "37, 99, 235", usage: "Primary blue" },
      { name: "Blue 900", hex: "#1e3a5f", rgb: "30, 58, 95", usage: "Deepest blue" },
    ],
  },
  {
    id: "slate-scale",
    label: "Slate Scale",
    colors: [
      { name: "Slate 50", hex: "#f8fafc", rgb: "248, 250, 252", usage: "Lightest slate" },
      { name: "Slate 100", hex: "#f1f5f9", rgb: "241, 245, 249", usage: "Light slate" },
      { name: "Slate 200", hex: "#e2e8f0", rgb: "226, 232, 240", usage: "Borders" },
      { name: "Slate 300", hex: "#cbd5e1", rgb: "203, 213, 225", usage: "Mid slate" },
      { name: "Slate 500", hex: "#64748b", rgb: "100, 116, 139", usage: "Muted text" },
      { name: "Slate 800", hex: "#1e293b", rgb: "30, 41, 59", usage: "Primary slate" },
      { name: "Slate 900", hex: "#0f172a", rgb: "15, 23, 42", usage: "Deepest slate" },
    ],
  },
  {
    id: "neutral",
    label: "Neutral / UI",
    colors: [
      { name: "Dark Text", hex: "#0f172a", rgb: "15, 23, 42", usage: "Darkest text" },
      { name: "Body Text", hex: "#334155", rgb: "51, 65, 85", usage: "Default body copy" },
      { name: "Muted Text", hex: "#64748b", rgb: "100, 116, 139", usage: "Secondary text, captions" },
      { name: "Light Gray", hex: "#94a3b8", rgb: "148, 163, 184", usage: "Borders, subtle text" },
    ],
  },
];

export function getAllBrandHexValues(palette: BrandColorCategory[] = DEFAULT_BRAND_PALETTE): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const cat of palette) {
    for (const color of cat.colors) {
      const hex = color.hex.toLowerCase();
      if (!seen.has(hex)) { seen.add(hex); result.push(hex); }
    }
  }
  return result;
}

export function findBrandColor(hex: string, palette: BrandColorCategory[] = DEFAULT_BRAND_PALETTE): BrandColor | undefined {
  const normalized = hex.toLowerCase();
  for (const cat of palette) {
    for (const color of cat.colors) {
      if (color.hex.toLowerCase() === normalized) return color;
    }
  }
  return undefined;
}

export function mergeBrandPalette(saved?: BrandColorCategory[] | null): BrandColorCategory[] {
  return saved && Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_BRAND_PALETTE;
}
