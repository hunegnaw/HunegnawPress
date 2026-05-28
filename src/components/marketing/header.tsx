"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LogIn, Menu, X } from "lucide-react";
import { useOrganization } from "@/components/providers/organization-provider";

interface NavLink {
  href: string;
  label: string;
}

interface MarketingHeaderProps {
  transparent?: boolean;
  navLinks?: NavLink[];
}

export function MarketingHeader({ transparent = true, navLinks: navLinksProp }: MarketingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const org = useOrganization();
  const nav = org.nav;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const solid = !transparent || scrolled;
  const currentLogo = solid ? (org.logoScrolledUrl || org.logoUrl) : org.logoUrl;

  const logoHref = "/";

  const navLinks = navLinksProp && navLinksProp.length > 0
    ? navLinksProp
    : [{ href: "/", label: "Home" }];

  // When transparent (hero), use white-ish link colors; when solid, use nav config colors
  const linkColor = solid ? nav.linkColor : "rgba(255,255,255,0.7)";
  const linkHoverColor = solid ? nav.linkHoverColor : "#ffffff";
  const btnBorder = solid ? nav.buttonBorderColor : "#ffffff";
  const btnHoverBg = solid ? nav.buttonHoverBgColor : nav.buttonHoverBgColor;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
      style={{ backgroundColor: solid ? nav.backgroundColor : "transparent" }}
    >
      <nav className="w-full px-16 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={logoHref}
          className={currentLogo ? "block" : "font-bold text-sm tracking-widest uppercase px-3 py-1.5 transition-colors"}
          style={currentLogo ? undefined : {
            color: linkHoverColor,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: linkColor,
          }}
        >
          {currentLogo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={currentLogo}
              alt={org.name}
              className="h-8 w-auto object-contain"
            />
          ) : (
            org.name || "HunegnawPress"
          )}
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden md:flex items-center gap-8" style={{ fontFamily: "var(--font-body-family, Inter), sans-serif" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition-colors"
              style={{ color: linkColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = linkHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = linkColor;
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right — desktop login */}
        <div className="hidden md:block">
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm flex items-center gap-2 transition-colors"
            style={{
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: btnBorder,
              color: btnBorder,
              fontFamily: "var(--font-body-family, Inter), sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = btnHoverBg;
              e.currentTarget.style.borderColor = btnHoverBg;
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = btnBorder;
              e.currentTarget.style.color = btnBorder;
            }}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden"
          style={{ color: linkHoverColor }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden px-16 pb-6 pt-2 space-y-4"
          style={{
            backgroundColor: nav.mobileMenuBgColor,
            borderTop: `1px solid ${nav.mobileMenuBorderColor}`,
            fontFamily: "var(--font-body-family, Inter), sans-serif",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm transition-colors"
              style={{ color: nav.linkColor }}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = nav.linkHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = nav.linkColor;
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="px-4 py-1.5 text-sm inline-flex items-center gap-2 transition-colors"
            style={{
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: nav.buttonBorderColor,
              color: nav.buttonBorderColor,
              fontFamily: "var(--font-body-family, Inter), sans-serif",
            }}
            onClick={() => setMobileOpen(false)}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
