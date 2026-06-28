import { apiFetch } from "./client";

export interface InviteResponse {
  organizationId: number;
  inviteToken: string;
}

export interface OrganizationSummary {
  id: number;
  name: string;
  contactEmail: string;
  accountStatus: string; // INVITED | ACTIVE | SUSPENDED | UNKNOWN
  activityCount: number;
  createdAt: string;
}

export async function fetchOrganizations(): Promise<OrganizationSummary[]> {
  const res = await apiFetch("/api/organizations");
  return res.json();
}

export async function createOrganization(
  orgName: string,
  contactEmail: string
): Promise<InviteResponse> {
  const res = await apiFetch("/api/organizations", {
    method: "POST",
    body: JSON.stringify({ orgName, contactEmail }),
  });
  return res.json();
}
