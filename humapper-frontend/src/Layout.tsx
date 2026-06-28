import { Outlet, Link } from "react-router-dom";
import { setToken, getUserRole } from "./api/client";

export default function Layout({ onSignOut }: { onSignOut: () => void }) {
    const isCoordinator = getUserRole() === "COORDINATOR";

    function handleSignOut() {
        setToken(null);
        onSignOut();
    }
    return (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
            <header style={{ display: "flex", alignItems: "center", gap: 16,
                padding: "10px 16px", borderBottom: "1px solid #ddd" }}>
                <strong>Humanitarian Mapper</strong>
                <nav style={{ display: "flex", gap: 12 }}>
                    <Link to="/">Map</Link>
                    {isCoordinator && <Link to="/organizations">Organizations</Link>}
                </nav>
                <button onClick={handleSignOut} style={{ marginLeft: "auto" }}>Sign out</button>
            </header>
            <main style={{ flex: 1, position: "relative" }}>
                <Outlet />
            </main>
        </div>
    );
}