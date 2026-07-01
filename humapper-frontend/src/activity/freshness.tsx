// Shared "how stale is this record?" logic. 3W data is only useful if it's current —
// showing old activities as active leads to wrong coordination decisions.

export type FreshnessLevel = "fresh" | "aging" | "stale" | "very_stale";

export interface Freshness {
  days: number;
  level: FreshnessLevel;
  label: string; // relative, e.g. "today", "5d ago"
  color: { bg: string; fg: string } | null; // null while fresh (<30d)
}

export function freshnessOf(lastUpdated: string): Freshness {
  const days = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86_400_000);
  const label = days <= 0 ? "today" : `${days}d ago`;

  if (days >= 90) return { days, level: "very_stale", label, color: { bg: "#fee2e2", fg: "#991b1b" } };
  if (days >= 60) return { days, level: "stale", label, color: { bg: "#ffedd5", fg: "#9a3412" } };
  if (days >= 30) return { days, level: "aging", label, color: { bg: "#fef9c3", fg: "#854d0e" } };
  return { days, level: "fresh", label, color: null };
}

// `compact` (used in the map side panel) renders nothing while fresh to avoid clutter.
export function FreshnessBadge({ lastUpdated, compact }: { lastUpdated: string; compact?: boolean }) {
  const f = freshnessOf(lastUpdated);

  if (f.color === null) {
    if (compact) return null;
    return <span style={{ color: "#6b7280", fontSize: 12 }}>{f.label}</span>;
  }

  return (
    <span title={`Updated ${f.label} — may need re-verification`}
          style={{ background: f.color.bg, color: f.color.fg, fontSize: 11,
                   padding: "1px 6px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {compact ? "stale" : f.label}
    </span>
  );
}
