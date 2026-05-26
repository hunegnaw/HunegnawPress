import { prisma } from "@/lib/prisma";
import type { Organization } from "@prisma/client";

let cachedOrg: Organization | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;

export async function getOrganization(): Promise<Organization | null> {
  const now = Date.now();
  if (cachedOrg && now - cacheTimestamp < CACHE_TTL) {
    return cachedOrg;
  }

  const org = await prisma.organization.findFirst();
  if (org) {
    cachedOrg = org;
    cacheTimestamp = now;
  }
  return org;
}

export function getOrgName(): string {
  return process.env.NEXT_PUBLIC_ORG_NAME || "My Website";
}

export function getOrgDefaults() {
  return {
    name: process.env.NEXT_PUBLIC_ORG_NAME || "My Website",
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#334155",
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#2563eb",
    accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR || "#3b82f6",
    footer: null,
  };
}
