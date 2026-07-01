import { apiFetch } from "./client";

export type MapVisibility = "ALL" | "APPROVED_ONLY";

export interface Settings {
  mapVisibility: MapVisibility;
  configured: boolean;
  publicShareEnabled: boolean;
  publicShareToken: string | null;
  updatedAt: string;
}

export async function fetchSettings(): Promise<Settings> {
  const res = await apiFetch("/api/settings");
  return res.json();
}

export async function updateSettings(mapVisibility: MapVisibility): Promise<Settings> {
  const res = await apiFetch("/api/settings", {
    method: "PUT",
    body: JSON.stringify({ mapVisibility }),
  });
  return res.json();
}

export async function setPublicShare(enabled: boolean): Promise<Settings> {
  const res = await apiFetch("/api/settings/public-share", {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
  return res.json();
}
