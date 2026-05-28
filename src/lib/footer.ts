export interface FooterModules {
  logo: boolean;
  navigation: boolean;
  newsletter: boolean;
  contact: boolean;
  tagline: boolean;
  copyright: boolean;
  disclaimer: boolean;
  legalLinks: boolean;
}

export interface FooterLink {
  label: string;
  url: string;
  source?: "custom" | "page";
  pageId?: string;
}

export interface FooterNavColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterConfig {
  modules: FooterModules;
  logoUrl: string | null;
  tagline: string;
  newsletterHeading: string;
  newsletterDescription: string;
  copyrightStartYear: string;
  copyrightEntity: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  linkColor: string;
  linkHoverColor: string;
  links: FooterLink[];
  navColumns: FooterNavColumn[];
}

export const DEFAULT_FOOTER: FooterConfig = {
  modules: {
    logo: false, navigation: true, newsletter: true, contact: true,
    tagline: true, copyright: true, disclaimer: true, legalLinks: true,
  },
  logoUrl: null,
  tagline: "",
  newsletterHeading: "Stay Updated",
  newsletterDescription: "",
  copyrightStartYear: new Date().getFullYear().toString(),
  copyrightEntity: "My Company",
  backgroundColor: "#1e293b",
  textColor: "#ffffff",
  accentColor: "#2563eb",
  linkColor: "rgba(255,255,255,0.55)",
  linkHoverColor: "#ffffff",
  links: [
    { label: "Privacy Policy", url: "/privacy-policy" },
    { label: "Terms of Use", url: "/terms-of-use" },
  ],
  navColumns: [],
};

export function mergeFooter(saved?: Partial<FooterConfig> | null): FooterConfig {
  if (!saved) return DEFAULT_FOOTER;
  return {
    ...DEFAULT_FOOTER,
    ...saved,
    modules: { ...DEFAULT_FOOTER.modules, ...(saved.modules || {}) },
    links: Array.isArray(saved.links) ? saved.links : DEFAULT_FOOTER.links,
    navColumns: Array.isArray(saved.navColumns) ? saved.navColumns : DEFAULT_FOOTER.navColumns,
  };
}
