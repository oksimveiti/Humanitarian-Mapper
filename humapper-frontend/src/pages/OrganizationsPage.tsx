import { useEffect, useState } from "react";
import {
  createOrganization,
  fetchOrganizations,
  type OrganizationSummary,
} from "../api/organizations";

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<OrganizationSummary[]>([]);
  const [orgName, setOrgName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [newInvite, setNewInvite] = useState<{ name: string; link: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  function inviteLink(token: string) {
    return `${window.location.origin}/activate?token=${token}`;
  }

  async function load() {
    setLoading(true);
    try {
      setOrgs(await fetchOrganizations());
    } catch {
      setError("Could not load organizations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await createOrganization(orgName, contactEmail);
      setNewInvite({ name: orgName, link: inviteLink(res.inviteToken) });
      setOrgName("");
      setContactEmail("");
      await load();
    } catch {
      setError("Could not create the organization.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Organizations</h2>
      <p style={{ color: "#555" }}>
        Create an account for an organization, then send them the invite link so they can set a
        password and start mapping their activities.
      </p>

      <form onSubmit={handleSubmit}
            style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Organization name
          <input value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Contact email
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
        </label>
        <button type="submit" disabled={saving}>{saving ? "Creating..." : "Create & invite"}</button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {newInvite && (
        <div style={{ border: "1px solid #c7d2fe", background: "#eef2ff", borderRadius: 8,
                      padding: 12, marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>Invite link for {newInvite.name}</div>
          <div style={{ fontSize: 13, color: "#555", margin: "4px 0 6px" }}>
            Send this to the organization — it works once.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input readOnly value={newInvite.link} style={{ flex: 1, fontSize: 12 }} />
            <button type="button" onClick={() => navigator.clipboard.writeText(newInvite.link)}>Copy</button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading…</p>
      ) : orgs.length === 0 ? (
        <p style={{ color: "#555" }}>No organizations yet. Create one above.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #eee" }}>
              <th style={{ padding: 8 }}>Organization</th>
              <th style={{ padding: 8 }}>Contact</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Activities</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>{o.name}</td>
                <td style={{ padding: 8 }}>{o.contactEmail}</td>
                <td style={{ padding: 8 }}><StatusBadge status={o.accountStatus} /></td>
                <td style={{ padding: 8 }}>{o.activityCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    ACTIVE: { bg: "#dcfce7", fg: "#166534" },
    INVITED: { bg: "#fef9c3", fg: "#854d0e" },
    SUSPENDED: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const c = colors[status] ?? { bg: "#eee", fg: "#555" };
  return (
    <span style={{ background: c.bg, color: c.fg, padding: "2px 8px", borderRadius: 999, fontSize: 12 }}>
      {status}
    </span>
  );
}
