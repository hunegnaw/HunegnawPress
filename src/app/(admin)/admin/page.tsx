"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { FileText, PenLine, Image, Users } from "lucide-react";

interface DashboardStats {
  pageCount: number;
  blogPostCount: number;
  mediaCount: number;
  adminUserCount: number;
}

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
}

function formatAuditAction(action: string): string {
  return action.replace(/_/g, " ").toLowerCase();
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, auditRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats"),
          fetch("/api/admin/audit-log?limit=10"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }

        if (auditRes.ok) {
          const data = await auditRes.json();
          setAuditLog(data.entries || []);
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    { label: "Total Pages", value: stats?.pageCount ?? 0, icon: FileText, color: "bg-blue-50 text-blue-600" },
    { label: "Blog Posts", value: stats?.blogPostCount ?? 0, icon: PenLine, color: "bg-emerald-50 text-emerald-600" },
    { label: "Media Files", value: stats?.mediaCount ?? 0, icon: Image, color: "bg-purple-50 text-purple-600" },
    { label: "Admin Users", value: stats?.adminUserCount ?? 0, icon: Users, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your site content and recent activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {card.label}
              </p>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            ))
          ) : auditLog.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">
              No activity yet.
            </div>
          ) : (
            auditLog.map((entry) => (
              <div key={entry.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-700">
                    <span className="font-medium">{entry.user?.name || entry.user?.email || "System"}</span>
                    {" "}
                    <span className="text-slate-500">{formatAuditAction(entry.action)}</span>
                    {entry.entityType && (
                      <span className="text-slate-400"> ({entry.entityType.toLowerCase()})</span>
                    )}
                  </span>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {formatDate(entry.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
