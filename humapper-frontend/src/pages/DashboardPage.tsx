import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchActivities, type Activity, type ReviewStatus } from "../api/activities";
import { fetchMe, type Me } from "../api/me";
import {
  fetchOrganizations,
  ORG_TYPE_LABELS,
  type OrganizationSummary,
  type OrganizationType,
} from "../api/organizations";
import { freshnessOf } from "../activity/freshness";
import { REVIEW_META } from "../activity/reviewStatus";

export default function DashboardPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [orgs, setOrgs] = useState<OrganizationSummary[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const meData = await fetchMe();
        setMe(meData);
        const acts = await fetchActivities();
        setActivities(acts);
        if (meData.role === "COORDINATOR") {
          setOrgs(await fetchOrganizations());
        }
      } catch {
        setError("Could not load the dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const submitted = activities.filter((a) => a.reviewStatus === "SUBMITTED").length;
    const stale = activities.filter((a) => freshnessOf(a.lastUpdated).days >= 30).length;
    const distinctOrgs = new Set(activities.map((a) => a.organizationName)).size;
    return { total: activities.length, submitted, stale, distinctOrgs };
  }, [activities]);

  const byReview = useMemo(
    () => countBy(activities, (a) => a.reviewStatus).map((r) => ({
      label: REVIEW_META[r.label as ReviewStatus]?.label ?? r.label,
      count: r.count,
    })),
    [activities]
  );
  const byStatus = useMemo(() => countBy(activities, (a) => a.status), [activities]);
  const bySector = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of activities) for (const s of a.sectors) m.set(s.name, (m.get(s.name) ?? 0) + 1);
    return [...m].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [activities]);
  const byOrgType = useMemo(() => {
    if (!orgs) return [];
    const m = new Map<string, number>();
    for (const o of orgs) {
      const label = ORG_TYPE_LABELS[o.type as OrganizationType] ?? o.type;
      m.set(label, (m.get(label) ?? 0) + 1);
    }
    return [...m].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [orgs]);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error) return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;

  const isCoordinator = me?.role === "COORDINATOR";

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Activities" value={stats.total} />
        <StatCard label="Organizations" value={isCoordinator && orgs ? orgs.length : stats.distinctOrgs} />
        <StatCard label="Awaiting approval" value={stats.submitted}
                  to={stats.submitted > 0 ? "/activities" : undefined} accent="#1e40af" />
        <StatCard label="Stale (30d+)" value={stats.stale}
                  to={stats.stale > 0 ? "/activities" : undefined} accent="#9a3412" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        <Breakdown title="By review status" rows={byReview} />
        <Breakdown title="By operational status" rows={byStatus} />
        <Breakdown title="By sector" rows={bySector} />
        {isCoordinator && <Breakdown title="Organizations by type" rows={byOrgType} />}
      </div>
    </div>
  );
}

function countBy<T>(items: T[], key: (t: T) => string): { label: string; count: number }[] {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = key(it);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function StatCard({ label, value, to, accent }: {
  label: string; value: number; to?: string; accent?: string;
}) {
  const inner = (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 18px", minWidth: 150 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? "#111827" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{label}</div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: "none" }}>{inner}</Link> : inner;
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      {rows.length === 0 ? (
        <p style={{ color: "#6b7280", fontSize: 14 }}>No data yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((r) => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 130, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.label}
              </div>
              <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 4, height: 16 }}>
                <div style={{ width: `${(r.count / max) * 100}%`, background: "#6366f1", height: "100%", borderRadius: 4 }} />
              </div>
              <div style={{ width: 32, textAlign: "right", fontSize: 13 }}>{r.count}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
