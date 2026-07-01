import { useEffect, useState } from "react";
import { fetchSettings, updateSettings, setPublicShare, type MapVisibility } from "../api/settings";

export default function SettingsPage() {
  const [visibility, setVisibility] = useState<MapVisibility>("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shareEnabled, setShareEnabled] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSettings();
        setVisibility(s.mapVisibility);
        setShareEnabled(s.publicShareEnabled);
        setShareToken(s.publicShareToken);
      } catch {
        setError("Could not load settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function togglePublicShare(next: boolean) {
    setShareBusy(true);
    setError(null);
    try {
      const s = await setPublicShare(next);
      setShareEnabled(s.publicShareEnabled);
      setShareToken(s.publicShareToken);
    } catch {
      setError("Could not update public sharing.");
    } finally {
      setShareBusy(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const s = await updateSettings(visibility);
      setVisibility(s.mapVisibility);
      setSaved(true);
    } catch {
      setError("Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{ marginTop: 0 }}>Settings</h2>

      <section>
        <h3 style={{ marginBottom: 4 }}>Map visibility</h3>
        <p style={{ color: "#555", marginTop: 0 }}>
          Controls who sees activities on the shared map and Activities list.
        </p>

        <label style={{ display: "block", marginBottom: 10, cursor: "pointer" }}>
          <input type="radio" name="vis" checked={visibility === "ALL"}
                 onChange={() => setVisibility("ALL")} />{" "}
          <strong>Show all activities</strong>
          <div style={{ color: "#6b7280", fontSize: 14, marginLeft: 22 }}>
            Everyone sees every activity, marked with a review badge (Draft / Submitted / Approved).
          </div>
        </label>

        <label style={{ display: "block", marginBottom: 10, cursor: "pointer" }}>
          <input type="radio" name="vis" checked={visibility === "APPROVED_ONLY"}
                 onChange={() => setVisibility("APPROVED_ONLY")} />{" "}
          <strong>Approved only</strong>
          <div style={{ color: "#6b7280", fontSize: 14, marginLeft: 22 }}>
            The shared map shows only approved activities. Organizations still see their own
            in-progress ones; you (coordinator) always see everything.
          </div>
        </label>

        <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          {saved && <span style={{ color: "#166534" }}>Saved ✓</span>}
          {error && <span style={{ color: "crimson" }}>{error}</span>}
        </div>
      </section>

      <hr style={{ margin: "28px 0", border: 0, borderTop: "1px solid #eee" }} />

      <section>
        <h3 style={{ marginBottom: 4 }}>Public share</h3>
        <p style={{ color: "#555", marginTop: 0 }}>
          Create a read-only public link showing only <strong>approved</strong> activities — no
          login required to view it. Disable any time to revoke the link.
        </p>

        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input type="checkbox" checked={shareEnabled} disabled={shareBusy}
                 onChange={(e) => togglePublicShare(e.target.checked)} />
          Enable public share link
        </label>

        {shareEnabled && shareToken && (
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input readOnly value={`${window.location.origin}/public/${shareToken}`}
                   style={{ flex: 1, fontSize: 12 }} />
            <button type="button"
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/public/${shareToken}`)}>
              Copy
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
