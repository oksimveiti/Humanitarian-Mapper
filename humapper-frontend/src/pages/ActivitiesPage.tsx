import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchActivities,
  submitActivity,
  approveActivity,
  requestChangesActivity,
  type Activity,
  type ReviewStatus,
} from "../api/activities";
import { fetchMe, type Me } from "../api/me";
import { freshnessOf, FreshnessBadge } from "../activity/freshness";
import { REVIEW_META, ReviewStatusBadge } from "../activity/reviewStatus";
import { activitiesToCsv, downloadCsv } from "../activity/exportCsv";

type SortKey = "organizationName" | "status" | "startDate" | "lastUpdated";
type SortDir = "asc" | "desc";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [status, setStatus] = useState("");
  const [review, setReview] = useState<"" | ReviewStatus>("");
  const [onlyStale, setOnlyStale] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "lastUpdated", dir: "desc" });

  useEffect(() => {
    (async () => {
      try {
        const [acts, meData] = await Promise.all([fetchActivities(), fetchMe()]);
        setActivities(acts);
        setMe(meData);
      } catch {
        setError("Could not load activities.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isCoordinator = me?.role === "COORDINATOR";
  const myOrgId = me?.organizationId ?? null;

  // Filter options derived from the data itself, so they always match what's present.
  const sectorOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of activities) for (const s of a.sectors) map.set(s.code, s.name);
    return [...map].map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [activities]);

  const statusOptions = useMemo(
    () => [...new Set(activities.map((a) => a.status))].sort(),
    [activities]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = activities.filter((a) => {
      if (sector && !a.sectors.some((s) => s.code === sector)) return false;
      if (status && a.status !== status) return false;
      if (review && a.reviewStatus !== review) return false;
      if (onlyStale && freshnessOf(a.lastUpdated).days < 30) return false;
      if (q) {
        const hay = `${a.organizationName} ${a.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [activities, search, sector, status, review, onlyStale, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  function exportCsv() {
    const csv = activitiesToCsv(rows);
    downloadCsv(`activities-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  async function runAction(fn: (id: number) => Promise<Activity>, id: number) {
    setError(null);
    try {
      const updated = await fn(id);
      setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      setError("That action could not be completed.");
    }
  }

  function actionsFor(a: Activity) {
    const owns = myOrgId != null && a.organizationId === myOrgId;
    const canSubmit = owns && (a.reviewStatus === "DRAFT" || a.reviewStatus === "NEEDS_UPDATE");
    const canReview = isCoordinator && a.reviewStatus === "SUBMITTED";
    return (
      <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
        {canSubmit && <button onClick={() => runAction(submitActivity, a.id)}>Submit</button>}
        {canReview && <button onClick={() => runAction(approveActivity, a.id)}>Approve</button>}
        {canReview && <button onClick={() => runAction(requestChangesActivity, a.id)}>Request changes</button>}
        <Link to={`/?focus=${a.id}`}>View on map</Link>
      </span>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1180, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Activities</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input placeholder="Search organization or description…" value={search}
               onChange={(e) => setSearch(e.target.value)} style={{ flex: "1 1 240px", minWidth: 200 }} />
        <select value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">All sectors</option>
          {sectorOptions.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={review} onChange={(e) => setReview(e.target.value as "" | ReviewStatus)}>
          <option value="">All review states</option>
          {(Object.keys(REVIEW_META) as ReviewStatus[]).map((r) => (
            <option key={r} value={r}>{REVIEW_META[r].label}</option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
          <input type="checkbox" checked={onlyStale} onChange={(e) => setOnlyStale(e.target.checked)} />
          Needs update (30d+)
        </label>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {rows.length} of {activities.length} activities
            </span>
            <button onClick={exportCsv} disabled={rows.length === 0}>Export CSV</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                <SortableTh label="Organization" k="organizationName" sort={sort} onSort={toggleSort} />
                <th style={{ padding: 8 }}>Sectors</th>
                <SortableTh label="Status" k="status" sort={sort} onSort={toggleSort} />
                <th style={{ padding: 8 }}>Review</th>
                <SortableTh label="Start" k="startDate" sort={sort} onSort={toggleSort} />
                <th style={{ padding: 8 }}>End</th>
                <th style={{ padding: 8 }}>Target</th>
                <SortableTh label="Last updated" k="lastUpdated" sort={sort} onSort={toggleSort} />
                <th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 14, color: "#6b7280" }}>No activities match the filters.</td></tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{a.organizationName}</td>
                    <td style={{ padding: 8, color: "#374151" }}>{a.sectors.map((s) => s.name).join(", ") || "—"}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{ fontSize: 11, background: "#e0e7ff", color: "#3730a3",
                                     padding: "1px 6px", borderRadius: 999 }}>{a.status}</span>
                    </td>
                    <td style={{ padding: 8 }}><ReviewStatusBadge status={a.reviewStatus} /></td>
                    <td style={{ padding: 8 }}>{a.startDate ?? "—"}</td>
                    <td style={{ padding: 8 }}>{a.endDate ?? "—"}</td>
                    <td style={{ padding: 8 }}>{a.targetPeople ?? "—"}</td>
                    <td style={{ padding: 8 }}><FreshnessBadge lastUpdated={a.lastUpdated} /></td>
                    <td style={{ padding: 8, whiteSpace: "nowrap" }}>{actionsFor(a)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function SortableTh({ label, k, sort, onSort }: {
  label: string; k: SortKey; sort: { key: SortKey; dir: SortDir }; onSort: (k: SortKey) => void;
}) {
  const active = sort.key === k;
  return (
    <th onClick={() => onSort(k)}
        style={{ padding: 8, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
      {label}{active ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
    </th>
  );
}
