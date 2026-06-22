import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";

// OpenFreeMap: free, no API key, no usage limits, attribution added automatically.
// Fully open-source and self-hostable if data sovereignty is ever required.
const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

export default function MapView() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const map = new maplibregl.Map({
            container: containerRef.current!,
            style: BASEMAP_STYLE,
            center: [-123.12, 49.28], // Vancouver; deployers re-center as needed
            zoom: 11,
        });
        map.addControl(new maplibregl.NavigationControl());

        return () => {
            map.remove();
        };
    }, []);

    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
