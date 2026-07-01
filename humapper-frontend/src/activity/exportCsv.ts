import type { Activity } from "../api/activities";

// Quote a cell only when needed (comma, quote, or newline), doubling inner quotes.
function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function activitiesToCsv(activities: Activity[]): string {
  const headers = [
    "Organization", "Sectors", "Status", "Review status",
    "Start", "End", "Target people", "Description", "Last updated",
  ];
  const rows = activities.map((a) => [
    a.organizationName,
    a.sectors.map((s) => s.name).join("; "),
    a.status,
    a.reviewStatus,
    a.startDate ?? "",
    a.endDate ?? "",
    a.targetPeople ?? "",
    a.description ?? "",
    a.lastUpdated,
  ].map(csvCell).join(","));

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  // Prepend a BOM so Excel reads UTF-8 (accented org names) correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
