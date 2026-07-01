import { apiFetch } from "./client";

export type ReviewStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "NEEDS_UPDATE";

export interface Activity {
  id: number;
  organizationId: number;
  organizationName: string;
  geometry: { type: string; coordinates: unknown };
  sectors: { id: number; code: string; name: string }[];
  status: string;
  reviewStatus: ReviewStatus;
  startDate: string | null;
  endDate: string | null;
  targetPeople: number | null;
  reachedPeople: number | null;
  budget: number | null;
  currency: string | null;
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
  reachedPeople?: number | null;
  budget?: number | null;
  currency?: string | null;
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

export async function updateActivity(id: number, input: CreateActivityInput): Promise<Activity> {
  const res = await apiFetch(`/api/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return res.json();
}

export async function deleteActivity(id: number): Promise<void> {
  await apiFetch(`/api/activities/${id}`, { method: "DELETE" });
}

// Review workflow transitions. Backend enforces role + ownership + valid transition.
export async function submitActivity(id: number): Promise<Activity> {
  const res = await apiFetch(`/api/activities/${id}/submit`, { method: "POST" });
  return res.json();
}

export async function approveActivity(id: number): Promise<Activity> {
  const res = await apiFetch(`/api/activities/${id}/approve`, { method: "POST" });
  return res.json();
}

export async function requestChangesActivity(id: number): Promise<Activity> {
  const res = await apiFetch(`/api/activities/${id}/request-changes`, { method: "POST" });
  return res.json();
}
