import MapView from "./map/MapView";
import "maplibre-gl/dist/maplibre-gl.css";

export default function App() {
  return (
      <div style={{ position: "absolute", inset: 0 }}>
        <MapView />
      </div>
  );
}