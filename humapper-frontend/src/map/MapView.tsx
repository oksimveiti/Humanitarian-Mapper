import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import {
    TerraDraw,
    TerraDrawPointMode,
    TerraDrawPolygonMode,
    TerraDrawSelectMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { fetchActivities, type Activity } from "../api/activities";
import ActivityForm from "../activity/ActivityForm";
import Legend from "./Legend";
import FilterBar from "./FilterBar";
import { sectorColorExpression } from "./sectorColors";

// OpenFreeMap: free, no API key, no usage limits, attribution added automatically.
const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

type DrawnGeometry = { type: string; coordinates: unknown };

export default function MapView() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const drawRef = useRef<TerraDraw | null>(null);
    const activitiesByIdRef = useRef<Map<number, Activity>>(new Map());
    const [drawnGeometry, setDrawnGeometry] = useState<DrawnGeometry | null>(null);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [filterSector, setFilterSector] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    useEffect(() => {
        const map = new maplibregl.Map({
            container: containerRef.current!,
            style: BASEMAP_STYLE,
            center: [-123.12, 49.28], // Vancouver; deployers re-center as needed
            zoom: 11,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl());

        map.on("load", async () => {
            map.addSource("activities", {
                type: "geojson",
                data: { type: "FeatureCollection", features: [] },
            });
            map.addLayer({
                id: "activities-fill",
                type: "fill",
                source: "activities",
                filter: ["==", ["geometry-type"], "Polygon"],
                paint: { "fill-color": sectorColorExpression() as never, "fill-opacity": 0.4 },
            });
            map.addLayer({
                id: "activities-outline",
                type: "line",
                source: "activities",
                filter: ["==", ["geometry-type"], "Polygon"],
                paint: { "line-color": sectorColorExpression() as never, "line-width": 1.5 },
            });
            map.addLayer({
                id: "activities-point",
                type: "circle",
                source: "activities",
                filter: ["==", ["geometry-type"], "Point"],
                paint: {
                    "circle-radius": 6,
                    "circle-color": sectorColorExpression() as never,
                    "circle-opacity": 0.85,
                },
            });
            await reloadActivities(map, activitiesByIdRef);

            const showPopup = (e: maplibregl.MapLayerMouseEvent) => {
                const id = e.features?.[0]?.properties?.id;
                const activity = activitiesByIdRef.current.get(Number(id));
                if (!activity) return;
                const popup = new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(buildPopupHtml(activity))
                    .addTo(map);
                const editBtn = popup.getElement()?.querySelector(".popup-edit-btn");
                editBtn?.addEventListener("click", () => {
                    setEditingActivity(activity);
                    popup.remove();
                });
            };
            for (const layer of ["activities-fill", "activities-point"]) {
                map.on("click", layer, showPopup);
                map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
                map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
            }

            const draw = new TerraDraw({
                adapter: new TerraDrawMapLibreGLAdapter({ map }),
                modes: [
                    new TerraDrawPolygonMode(),
                    new TerraDrawPointMode(),
                    new TerraDrawSelectMode(),
                ],
            });
            draw.start();
            draw.setMode("select");

            draw.on("finish", (id) => {
                const feature = draw.getSnapshot().find((f) => f.id === id);
                if (feature) {
                    setDrawnGeometry(feature.geometry as DrawnGeometry);
                    draw.setMode("select");
                }
            });

            drawRef.current = draw;
        });

        return () => {
            drawRef.current?.stop();
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Apply sector/status filters to the activity layers whenever they change.
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.getLayer("activities-fill")) return;
        map.setFilter("activities-fill", buildFilter("Polygon", filterSector, filterStatus) as never);
        map.setFilter("activities-outline", buildFilter("Polygon", filterSector, filterStatus) as never);
        map.setFilter("activities-point", buildFilter("Point", filterSector, filterStatus) as never);
    }, [filterSector, filterStatus]);

    function closeForms() {
        drawRef.current?.clear();
        setDrawnGeometry(null);
        setEditingActivity(null);
    }

    async function handleSaved() {
        closeForms();
        if (mapRef.current) await reloadActivities(mapRef.current, activitiesByIdRef);
    }

    return (
        <div style={{ position: "absolute", inset: 0 }}>
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
            <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 8, zIndex: 1 }}>
                <button onClick={() => drawRef.current?.setMode("polygon")}>Draw area</button>
                <button onClick={() => drawRef.current?.setMode("point")}>Drop point</button>
                <button onClick={() => drawRef.current?.setMode("select")}>Pan</button>
            </div>
            <FilterBar
                sector={filterSector}
                status={filterStatus}
                onSectorChange={setFilterSector}
                onStatusChange={setFilterStatus}
            />
            <Legend />
            {drawnGeometry && (
                <ActivityForm geometry={drawnGeometry} onSaved={handleSaved} onCancel={closeForms} />
            )}
            {editingActivity && (
                <ActivityForm
                    geometry={editingActivity.geometry}
                    activity={editingActivity}
                    onSaved={handleSaved}
                    onCancel={closeForms}
                />
            )}
        </div>
    );
}

function buildFilter(geomType: string, sector: string, status: string): unknown[] {
    const parts: unknown[] = [["==", ["geometry-type"], geomType]];
    if (sector) parts.push(["in", sector, ["get", "sectorCodes"]]);
    if (status) parts.push(["==", ["get", "status"], status]);
    return ["all", ...parts];
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
            ${a.description ? `<div style="margin-top:4px">${escapeHtml(a.description)}</div>` : ""}
            <button class="popup-edit-btn" style="margin-top:8px; cursor:pointer">Edit</button>
        </div>`;
}

async function reloadActivities(
    map: maplibregl.Map,
    byId: React.MutableRefObject<Map<number, Activity>>
) {
    const activities = await fetchActivities();
    byId.current = new Map(activities.map((a) => [a.id, a]));
    const featureCollection = {
        type: "FeatureCollection",
        features: activities.map((a) => ({
            type: "Feature",
            geometry: a.geometry,
            properties: {
                id: a.id,
                status: a.status,
                primarySector: a.sectors[0]?.code ?? null,
                sectorCodes: a.sectors.map((s) => s.code),
            },
        })),
    };
    (map.getSource("activities") as maplibregl.GeoJSONSource).setData(featureCollection as never);
}
