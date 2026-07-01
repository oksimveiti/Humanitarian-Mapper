import type { Activity } from "../api/activities";
import { FreshnessBadge } from "../activity/freshness";

interface Props {
  activities: Activity[];
  selectedId: number | null;
  onSelect: (a: Activity) => void;
  onClose: () => void;
}

export default function ActivityListPanel({ activities, selectedId, onSelect, onClose }: Props) {
  return (
    <div style={{ width: 300, flexShrink: 0, height: "100%", background: "#fff",
                  borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", zIndex: 2 }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #eee",
                    display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 600 }}>Activities</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{activities.length} shown</div>
        </div>
        <button onClick={onClose} title="Hide panel" style={{ cursor: "pointer" }}>«</button>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        {activities.length === 0 ? (
          <p style={{ padding: 14, color: "#6b7280", fontSize: 14 }}>
            No activities match the current filters.
          </p>
        ) : (
          activities.map((a) => {
            const selected = a.id === selectedId;
            return (
              <button key={a.id} onClick={() => onSelect(a)}
                style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer",
                         border: "none", borderBottom: "1px solid #f3f4f6", padding: "10px 14px",
                         borderLeft: selected ? "3px solid #4f46e5" : "3px solid transparent",
                         background: selected ? "#eef2ff" : "transparent" }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "#f9fafb"; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.organizationName}</div>
                <div style={{ fontSize: 12, color: "#6b7280", margin: "2px 0" }}>
                  {a.sectors.map((s) => s.name).join(", ") || "—"}
                </div>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11, background: "#e0e7ff", color: "#3730a3",
                                 padding: "1px 6px", borderRadius: 999 }}>{a.status}</span>
                  <FreshnessBadge lastUpdated={a.lastUpdated} compact />
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
