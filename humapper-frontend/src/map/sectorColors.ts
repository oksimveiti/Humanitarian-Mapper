// One color per sector. Activities are colored by their primary (first) sector.
export const SECTOR_COLORS: Record<string, string> = {
  SHELTER: "#2563eb",        // blue
  HEALTH: "#dc2626",         // red
  WASH: "#0891b2",           // cyan
  PROTECTION: "#7c3aed",     // purple
  FSC: "#ca8a04",            // amber (food security)
  NUTRITION: "#16a34a",      // green
  EDUCATION: "#db2777",      // pink
  CCCM: "#0d9488",           // teal
  EARLY_RECOVERY: "#65a30d", // lime
  LOGISTICS: "#475569",      // slate
  ETC: "#9333ea",            // violet
  CASH: "#ea580c",           // orange
};

export const DEFAULT_COLOR = "#888888";

// Builds a MapLibre "match" expression that colors a feature by its `primarySector` property.
// (Typed loosely to avoid MapLibre's verbose expression types; valid at runtime.)
export function sectorColorExpression(): unknown[] {
  const pairs = Object.entries(SECTOR_COLORS).flatMap(([code, color]) => [code, color]);
  return ["match", ["get", "primarySector"], ...pairs, DEFAULT_COLOR];
}
