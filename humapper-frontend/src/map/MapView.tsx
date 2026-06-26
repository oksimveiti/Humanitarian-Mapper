import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import {
    TerraDraw,
    TerraDrawPointMode,
    TerraDrawPolygonMode,
    TerraDrawSelectMode,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { fetchActivities } from "../api/activities";
import ActivityForm from "../activity/ActivityForm";

// OpenFreeMap: free, no API key, no usage limits, attribution added automatically.
const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

type DrawnGeometry = { type: string; coordinates: unknown };

export default function MapView() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const drawRef = useRef<TerraDraw | null>(null);
    const [drawnGeometry, setDrawnGeometry] = useState<DrawnGeometry | null>(null);

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
                paint: { "fill-color": "#2563eb", "fill-opacity": 0.3 },
            });
            map.addLayer({
                id: "activities-outline",
                type: "line",
                source: "activities",
                filter: ["==", ["geometry-type"], "Polygon"],
                paint: { "line-color": "#2563eb", "line-width": 1.5 },
            });
            map.addLayer({
                id: "activities-point",
                type: "circle",
                source: "activities",
                filter: ["==", ["geometry-type"], "Point"],
                paint: { "circle-radius": 6, "circle-color": "#2563eb", "circle-opacity": 0.8 },
            });
            await reloadActivities(map);

            const draw = new TerraDraw({
                adapter: new TerraDrawMapLibreGLAdapter({ map, lib: maplibregl }),
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

    function closeForm() {
        drawRef.current?.clear();
        setDrawnGeometry(null);
    }

    async function handleSaved() {
        closeForm();
        if (mapRef.current) await reloadActivities(mapRef.current);
    }

    return (
        <div style={{ position: "absolute", inset: 0 }}>
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
            <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 8, zIndex: 1 }}>
                <button onClick={() => drawRef.current?.setMode("polygon")}>Draw area</button>
                <button onClick={() => drawRef.current?.setMode("point")}>Drop point</button>
                <button onClick={() => drawRef.current?.setMode("select")}>Pan</button>
            </div>
            {drawnGeometry && (
                <ActivityForm geometry={drawnGeometry} onSaved={handleSaved} onCancel={closeForm} />
            )}
        </div>
    );
}

async function reloadActivities(map: maplibregl.Map) {
    const activities = await fetchActivities();
    const featureCollection = {
        type: "FeatureCollection",
        features: activities.map((a) => ({
            type: "Feature",
            geometry: a.geometry,
            properties: { id: a.id, status: a.status },
        })),
    };
    (map.getSource("activities") as maplibregl.GeoJSONSource).setData(featureCollection as never);
}
