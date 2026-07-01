import { apiFetch } from "./client";

export interface Me {
  userId: string;
  authorities: string[];
  role?: string;
  organizationId?: number | null;
  organizationName?: string | null;
}

export async function fetchMe(): Promise<Me> {
  const res = await apiFetch("/api/me");
  return res.json();
}
