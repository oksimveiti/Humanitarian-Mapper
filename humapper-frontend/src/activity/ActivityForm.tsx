import { useEffect, useState } from "react";
import { fetchSectors, type Sector } from "../api/sectors";
import { createActivity } from "../api/activities";

interface Props {
  geometry: { type: string; coordinates: unknown };
  onSaved: () => void;
  onCancel: () => void;
}

const STATUSES = ["PLANNING", "IMPLEMENTATION", "COMPLETED"];

export default function ActivityForm({ geometry, onSaved, onCancel }: Props) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorIds, setSectorIds] = useState<number[]>([]);
  const [status, setStatus] = useState("PLANNING");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetPeople, setTargetPeople] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSectors().then(setSectors).catch(() => setError("Could not load sectors"));
  }, []);

  function toggleSector(id: number) {
    setSectorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (sectorIds.length === 0) {
      setError("Pick at least one sector.");
      return;
    }
    setSaving(true);
    try {
      await createActivity({
        geometry,
        sectorIds,
        status,
        startDate: startDate || null,
        endDate: endDate || null,
        targetPeople: targetPeople ? Number(targetPeople) : null,
        description: description || null,
      });
      onSaved();
    } catch {
      setError("Could not save. Are you signed in as an organization member?");
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(90%, 340px)",
                  background: "white", borderLeft: "1px solid #ddd", padding: 16,
                  overflowY: "auto", zIndex: 2 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ margin: 0 }}>New activity</h3>

        <div>
          <div style={{ marginBottom: 6, fontWeight: 600 }}>Sectors</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {sectors.map((s) => (
              <button type="button" key={s.id} onClick={() => toggleSector(s.id)}
                style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer",
                         background: sectorIds.includes(s.id) ? "#2563eb" : "white",
                         color: sectorIds.includes(s.id) ? "white" : "black" }}>
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Start date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          End date
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Target people
          <input type="number" min={0} value={targetPeople}
                 onChange={(e) => setTargetPeople(e.target.value)} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
