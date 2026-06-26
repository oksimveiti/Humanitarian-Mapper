import { apiFetch } from "./client";

export interface Sector {
  id: number;
  code: string;
  name: string;
}

export async function fetchSectors(): Promise<Sector[]> {
  const res = await apiFetch("/api/sectors");
  return res.json();
}
