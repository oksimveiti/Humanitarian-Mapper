import { useEffect, useState } from "react";
import { fetchSectors, type Sector } from "../api/sectors";
import { createActivity, updateActivity, deleteActivity, type Activity } from "../api/activities";

interface Props {
  geometry: { type: string; coordinates: unknown };
  activity?: Activity; // present = edit mode (pre-fill + PUT); absent = create (POST)
  onSaved: () => void;
  onCancel: () => void;
}

const STATUSES = ["PLANNING", "IMPLEMENTATION", "COMPLETED"];

export default function ActivityForm({ geometry, activity, onSaved, onCancel }: Props) {
  const isEdit = activity != null;

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [sectorIds, setSectorIds] = useState<number[]>(activity?.sectors.map((s) => s.id) ?? []);
  const [status, setStatus] = useState(activity?.status ?? "PLANNING");
  const [startDate, setStartDate] = useState(activity?.startDate ?? "");
  const [endDate, setEndDate] = useState(activity?.endDate ?? "");
  const [targetPeople, setTargetPeople] = useState(
    activity?.targetPeople != null ? String(activity.targetPeople) : ""
  );
  const [reachedPeople, setReachedPeople] = useState(
    activity?.reachedPeople != null ? String(activity.reachedPeople) : ""
  );
  const [budget, setBudget] = useState(activity?.budget != null ? String(activity.budget) : "");
  const [currency, setCurrency] = useState(activity?.currency ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
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
    const input = {
      geometry,
      sectorIds,
      status,
      startDate: startDate || null,
      endDate: endDate || null,
      targetPeople: targetPeople ? Number(targetPeople) : null,
      reachedPeople: reachedPeople ? Number(reachedPeople) : null,
      budget: budget ? Number(budget) : null,
      currency: currency.trim() ? currency.trim().toUpperCase() : null,
      description: description || null,
    };
    try {
      if (isEdit) {
        await updateActivity(activity!.id, input);
      } else {
        await createActivity(input);
      }
      onSaved();
    } catch {
      setError("Could not save. Are you signed in as the organization that owns this activity?");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!activity) return;
    if (!window.confirm("Delete this activity? This cannot be undone.")) return;
    setSaving(true);
    try {
      await deleteActivity(activity.id);
      onSaved();
    } catch {
      setError("Could not delete. Are you signed in as the organization that owns this activity?");
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "min(90%, 340px)",
                  background: "white", borderLeft: "1px solid #ddd", padding: 16,
                  overflowY: "auto", zIndex: 2 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ margin: 0 }}>{isEdit ? "Edit activity" : "New activity"}</h3>

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
          <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value)} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          End date
          <input type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value)} />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            Target people
            <input type="number" min={0} value={targetPeople}
                   onChange={(e) => setTargetPeople(e.target.value)} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            Reached people
            <input type="number" min={0} value={reachedPeople}
                   onChange={(e) => setReachedPeople(e.target.value)} />
          </label>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 2 }}>
            Budget
            <input type="number" min={0} step="0.01" value={budget}
                   onChange={(e) => setBudget(e.target.value)} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            Currency
            <input type="text" maxLength={3} placeholder="USD" value={currency}
                   onChange={(e) => setCurrency(e.target.value)} />
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Description
          <textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onCancel}>Cancel</button>
          {isEdit && (
            <button type="button" onClick={handleDelete} disabled={saving}
                    style={{ marginLeft: "auto", color: "crimson" }}>
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
