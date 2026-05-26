import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SavedColorsProvider } from "@/components/providers/saved-colors-provider";
import { getOrganization } from "@/lib/organization";
import { SidebarNav } from "@/components/admin/sidebar-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const [org, adminUser] = await Promise.all([
    getOrganization(),
    prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { profileImageUrl: true },
    }),
  ]);

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  return (
    <div className="flex min-h-screen flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="h-14 bg-slate-800 border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className={org?.logoUrl ? "block" : "font-bold text-white text-sm tracking-widest uppercase border border-white/40 px-3 py-1.5 transition-colors hover:border-white/70"}>
            {org?.logoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={org.logoUrl} alt={org.name} className="h-7 w-auto object-contain" />
            ) : (
              org?.name || "HunegnawPress"
            )}
          </Link>
          <span className="bg-blue-600 text-white text-[10px] font-semibold px-2.5 py-0.5 tracking-wider uppercase">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/admin/audit-log"
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Audit Log
          </Link>
          <Link
            href="/admin/settings"
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Settings
          </Link>
          {adminUser?.profileImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={adminUser.profileImageUrl} alt={session.user.name || "Admin"} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold text-white">
              {initials}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-60 bg-slate-900 flex flex-col pt-6">
          <SidebarNav />
        </aside>

        <main className="flex-1 bg-slate-50 overflow-auto">
          <SavedColorsProvider>{children}</SavedColorsProvider>
        </main>
      </div>
    </div>
  );
}
