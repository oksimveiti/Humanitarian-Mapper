import { useEffect, useState } from "react";
import { fetchSectors, type Sector } from "../api/sectors";

interface Props {
  sector: string;
  status: string;
  onSectorChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const STATUSES = ["PLANNING", "IMPLEMENTATION", "COMPLETED"];

export default function FilterBar({ sector, status, onSectorChange, onStatusChange }: Props) {
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    fetchSectors().then(setSectors).catch(() => {});
  }, []);

  return (
    <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
                  display: "flex", gap: 12, background: "white", padding: "6px 12px",
                  border: "1px solid #ddd", borderRadius: 8, zIndex: 1, fontSize: 13 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
        Sector
        <select value={sector} onChange={(e) => onSectorChange(e.target.value)}>
          <option value="">All</option>
          {sectors.map((s) => <option key={s.id} value={s.code}>{s.name}</option>)}
        </select>
      </label>
      <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
        Status
        <select value={status} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
    </div>
  );
}
