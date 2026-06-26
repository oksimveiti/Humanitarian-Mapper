import { apiFetch } from "./client";

export interface Activity {
  id: number;
  organizationId: number;
  organizationName: string;
  geometry: { type: string; coordinates: unknown };
  sectors: { id: number; code: string; name: string }[];
  status: string;
  startDate: string | null;
  endDate: string | null;
  targetPeople: number | null;
  description: string | null;
  lastUpdated: string;
}

export interface CreateActivityInput {
  geometry: { type: string; coordinates: unknown };
  sectorIds: number[];
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  targetPeople?: number | null;
  description?: string | null;
}

export async function fetchActivities(): Promise<Activity[]> {
  const res = await apiFetch("/api/activities");
  return res.json();
}

export async function createActivity(input: CreateActivityInput): Promise<Activity> {
  const res = await apiFetch("/api/activities", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.json();
}
