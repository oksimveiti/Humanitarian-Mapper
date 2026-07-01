import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchActivities,
  approveActivity,
  requestChangesActivity,
  type Activity,
} from "../api/activities";
import { fetchMe, type Me } from "../api/me";
import { FreshnessBadge } from "../activity/freshness";

export default function ReviewQueuePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [acts, meData] = await Promise.all([fetchActivities(), fetchMe()]);
        setActivities(acts);
        setMe(meData);
      } catch {
        setError("Could not load the review queue.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const queue = activities.filter((a) => a.reviewStatus === "SUBMITTED");

  async function act(fn: (id: number) => Promise<Activity>, id: number) {
    setBusyId(id);
    setError(null);
    try {
      const updated = await fn(id);
      setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {
      setError("That action could not be completed.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  if (me && me.role !== "COORDINATOR") {
    return <div style={{ padding: 24, color: "#555" }}>The review queue is for coordinators.</div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Review queue</h2>
      <p style={{ color: "#555", marginTop: 0 }}>
        Activities submitted by organizations, waiting for your approval.
      </p>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {queue.length === 0 ? (
        <p style={{ color: "#6b7280" }}>Nothing awaiting review. 🎉</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {queue.map((a) => (
            <div key={a.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{a.organizationName}</div>
                <FreshnessBadge lastUpdated={a.lastUpdated} />
              </div>
              <div style={{ color: "#374151", fontSize: 14, margin: "4px 0 10px" }}>
                {a.sectors.map((s) => s.name).join(", ") || "—"}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 24px", fontSize: 13, color: "#374151" }}>
                <Field label="Status" value={a.status} />
                <Field label="Dates" value={[a.startDate, a.endDate].filter(Boolean).join(" → ") || "—"} />
                <Field label="Target" value={a.targetPeople?.toLocaleString() ?? "—"} />
                <Field label="Reached" value={a.reachedPeople?.toLocaleString() ?? "—"} />
                <Field label="Budget" value={a.budget != null ? `${a.budget.toLocaleString()} ${a.currency ?? ""}`.trim() : "—"} />
              </div>

              {a.description && (
                <p style={{ fontSize: 14, color: "#4b5563", marginTop: 10, marginBottom: 0 }}>{a.description}</p>
              )}

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14 }}>
                <button onClick={() => act(approveActivity, a.id)} disabled={busyId === a.id}>Approve</button>
                <button onClick={() => act(requestChangesActivity, a.id)} disabled={busyId === a.id}>
                  Request changes
                </button>
                <Link to={`/?focus=${a.id}`} style={{ marginLeft: "auto" }}>View on map</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <span><span style={{ color: "#9ca3af" }}>{label}:</span> {value}</span>
  );
}
