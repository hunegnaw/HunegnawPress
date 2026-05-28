export interface NavConfig {
  backgroundColor: string;
  linkColor: string;
  linkHoverColor: string;
  buttonBorderColor: string;
  buttonHoverBgColor: string;
  mobileMenuBgColor: string;
  mobileMenuBorderColor: string;
}

export const DEFAULT_NAV: NavConfig = {
  backgroundColor: "#1e293b",
  linkColor: "rgba(255,255,255,0.7)",
  linkHoverColor: "#ffffff",
  buttonBorderColor: "#ffffff",
  buttonHoverBgColor: "#2563eb",
  mobileMenuBgColor: "#1e293b",
  mobileMenuBorderColor: "rgba(255,255,255,0.1)",
};

export function mergeNav(saved?: Partial<NavConfig> | null): NavConfig {
  if (!saved) return DEFAULT_NAV;
  return { ...DEFAULT_NAV, ...saved };
}
