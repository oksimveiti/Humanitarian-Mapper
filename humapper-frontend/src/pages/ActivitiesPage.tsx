import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchActivities, type Activity } from "../api/activities";

type SortKey = "organizationName" | "status" | "startDate" | "lastUpdated";
type SortDir = "asc" | "desc";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "lastUpdated", dir: "desc" });

  useEffect(() => {
    (async () => {
      try {
        setActivities(await fetchActivities());
      } catch {
        setError("Could not load activities.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
  }, [activities, search, sector, status, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Activities</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <input placeholder="Search organization or description…" value={search}
               onChange={(e) => setSearch(e.target.value)} style={{ flex: "1 1 260px", minWidth: 220 }} />
        <select value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">All sectors</option>
          {sectorOptions.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
            {rows.length} of {activities.length} activities
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
                <SortableTh label="Organization" k="organizationName" sort={sort} onSort={toggleSort} />
                <th style={{ padding: 8 }}>Sectors</th>
                <SortableTh label="Status" k="status" sort={sort} onSort={toggleSort} />
                <SortableTh label="Start" k="startDate" sort={sort} onSort={toggleSort} />
                <th style={{ padding: 8 }}>End</th>
                <th style={{ padding: 8 }}>Target</th>
                <SortableTh label="Last updated" k="lastUpdated" sort={sort} onSort={toggleSort} />
                <th style={{ padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 14, color: "#6b7280" }}>No activities match the filters.</td></tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{a.organizationName}</td>
                    <td style={{ padding: 8, color: "#374151" }}>{a.sectors.map((s) => s.name).join(", ") || "—"}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{ fontSize: 11, background: "#e0e7ff", color: "#3730a3",
                                     padding: "1px 6px", borderRadius: 999 }}>{a.status}</span>
                    </td>
                    <td style={{ padding: 8 }}>{a.startDate ?? "—"}</td>
                    <td style={{ padding: 8 }}>{a.endDate ?? "—"}</td>
                    <td style={{ padding: 8 }}>{a.targetPeople ?? "—"}</td>
                    <td style={{ padding: 8, color: "#6b7280" }}>{formatDate(a.lastUpdated)}</td>
                    <td style={{ padding: 8 }}>
                      <Link to={`/?focus=${a.id}`}>View on map</Link>
                    </td>
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}
