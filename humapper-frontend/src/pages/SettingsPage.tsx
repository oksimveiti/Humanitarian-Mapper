import { useEffect, useState } from "react";
import { fetchSettings, updateSettings, type MapVisibility } from "../api/settings";

export default function SettingsPage() {
  const [visibility, setVisibility] = useState<MapVisibility>("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchSettings();
        setVisibility(s.mapVisibility);
      } catch {
        setError("Could not load settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
    </div>
  );
}
