import type { Activity } from "./activities";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

// Unauthenticated: fetch the approved activities exposed by a public share token.
export async function fetchPublicActivities(token: string): Promise<Activity[]> {
  const res = await fetch(`${API_BASE}/api/public/${encodeURIComponent(token)}/activities`);
  if (!res.ok) throw new Error("This share link is not valid.");
  return res.json();
}
