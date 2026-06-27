import { useEffect, useState } from "react";
import { fetchSectors, type Sector } from "../api/sectors";
import { SECTOR_COLORS, DEFAULT_COLOR } from "./sectorColors";

export default function Legend() {
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    fetchSectors().then(setSectors).catch(() => {});
  }, []);

  return (
    <div style={{ position: "absolute", bottom: 24, left: 10, background: "white",
                  border: "1px solid #ddd", borderRadius: 8, padding: 10, zIndex: 1,
                  fontSize: 12, maxHeight: "45%", overflowY: "auto" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Sectors</div>
      {sectors.map((s) => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, display: "inline-block",
                         background: SECTOR_COLORS[s.code] ?? DEFAULT_COLOR }} />
          {s.name}
        </div>
      ))}
    </div>
  );
}
