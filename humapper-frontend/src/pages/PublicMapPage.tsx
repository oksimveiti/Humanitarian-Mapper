import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import maplibregl from "maplibre-gl";
import { fetchPublicActivities } from "../api/public";
import type { Activity } from "../api/activities";
import { sectorColorExpression } from "../map/sectorColors";

const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export default function PublicMapPage() {
  const { token = "" } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPublicActivities(token)
      .then((data) => {
        if (cancelled) return;
        setCount(data.length);
        initMap(data);
      })
      .catch(() => !cancelled && setError("This share link is not valid or has been disabled."));

    function initMap(acts: Activity[]) {
      if (!containerRef.current) return;
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: BASEMAP_STYLE,
        center: [0, 20],
        zoom: 1.5,
      });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl());

      map.on("load", () => {
        const features = acts.map((a) => ({
          type: "Feature",
          geometry: a.geometry,
          properties: { primarySector: a.sectors[0]?.code ?? null, popup: buildPopupHtml(a) },
        }));
        map.addSource("activities", {
          type: "geojson",
          data: { type: "FeatureCollection", features } as never,
        });
        map.addLayer({ id: "fill", type: "fill", source: "activities",
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: { "fill-color": sectorColorExpression() as never, "fill-opacity": 0.4 } });
        map.addLayer({ id: "outline", type: "line", source: "activities",
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: { "line-color": sectorColorExpression() as never, "line-width": 1.5 } });
        map.addLayer({ id: "point", type: "circle", source: "activities",
          filter: ["==", ["geometry-type"], "Point"],
          paint: { "circle-radius": 6, "circle-color": sectorColorExpression() as never, "circle-opacity": 0.85 } });

        const pts: [number, number][] = [];
        for (const a of acts) collectCoords((a.geometry as { coordinates: unknown }).coordinates, pts);
        if (pts.length) {
          let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
          for (const [lng, lat] of pts) {
            minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
          }
          map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 60, maxZoom: 13, duration: 0 });
        }

        const showPopup = (e: maplibregl.MapLayerMouseEvent) => {
          const html = e.features?.[0]?.properties?.popup;
          if (html) new maplibregl.Popup().setLngLat(e.lngLat).setHTML(String(html)).addTo(map);
        };
        for (const layer of ["fill", "point"]) {
          map.on("click", layer, showPopup);
          map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
          map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
        }
      });
    }

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  if (error) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <h2>Link unavailable</h2>
          <p style={{ color: "#555" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", top: 10, left: 10, background: "white", padding: "6px 12px",
        borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.2)", zIndex: 1, fontSize: 13 }}>
        <strong>Humanitarian Mapper</strong> — public view
        {count != null ? ` · ${count} approved ${count === 1 ? "activity" : "activities"}` : ""}
      </div>
    </div>
  );
}

function collectCoords(coords: unknown, out: [number, number][]) {
  if (Array.isArray(coords) && typeof coords[0] === "number") {
    out.push([coords[0], coords[1] as number]);
    return;
  }
  if (Array.isArray(coords)) for (const c of coords) collectCoords(c, out);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string
  );
}

function buildPopupHtml(a: Activity): string {
  const sectors = a.sectors.map((s) => escapeHtml(s.name)).join(", ");
  const dates = [a.startDate, a.endDate].filter(Boolean).join(" → ");
  return `
    <div style="font-size:13px; max-width:240px; line-height:1.4">
      <strong>${escapeHtml(a.organizationName)}</strong>
      <div style="margin-top:4px"><b>Sectors:</b> ${sectors}</div>
      <div><b>Status:</b> ${escapeHtml(a.status)}</div>
      ${dates ? `<div><b>Dates:</b> ${escapeHtml(dates)}</div>` : ""}
      ${a.targetPeople != null ? `<div><b>Target people:</b> ${a.targetPeople}</div>` : ""}
    </div>`;
}
