import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { OrganizationProvider } from "@/components/providers/organization-provider";
import { FontLoader } from "@/components/providers/font-loader";
import { getOrganization } from "@/lib/organization";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const org = await getOrganization();
  return {
    title: org?.name || "My Website",
    description: org?.legalName ? `${org.name} — ${org.legalName}` : org?.name || "My Website",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <OrganizationProvider>
            <FontLoader />
            {children}
          </OrganizationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
