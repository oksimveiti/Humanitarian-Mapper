import type { ReviewStatus } from "../api/activities";

export const REVIEW_META: Record<ReviewStatus, { label: string; bg: string; fg: string }> = {
  DRAFT: { label: "Draft", bg: "#f3f4f6", fg: "#374151" },
  SUBMITTED: { label: "Submitted", bg: "#dbeafe", fg: "#1e40af" },
  APPROVED: { label: "Approved", bg: "#dcfce7", fg: "#166534" },
  NEEDS_UPDATE: { label: "Needs update", bg: "#fef9c3", fg: "#854d0e" },
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const m = REVIEW_META[status] ?? { label: status, bg: "#eee", fg: "#555" };
  return (
    <span style={{ background: m.bg, color: m.fg, fontSize: 11,
                   padding: "1px 6px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}
