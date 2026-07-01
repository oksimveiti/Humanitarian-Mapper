import { apiFetch } from "./client";

export type OrganizationType = "INGO" | "NATIONAL_NGO" | "UN" | "GOVERNMENT" | "OTHER";

export const ORG_TYPE_LABELS: Record<OrganizationType, string> = {
  INGO: "International NGO",
  NATIONAL_NGO: "National / local NGO",
  UN: "UN agency",
  GOVERNMENT: "Government",
  OTHER: "Other",
};

export interface InviteResponse {
  organizationId: number;
  inviteToken: string;
}

export interface OrganizationSummary {
  id: number;
  name: string;
  contactEmail: string;
  type: OrganizationType;
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
  contactEmail: string,
  type: OrganizationType
): Promise<InviteResponse> {
  const res = await apiFetch("/api/organizations", {
    method: "POST",
    body: JSON.stringify({ orgName, contactEmail, type }),
  });
  return res.json();
}
