import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { setToken, getUserRole } from "./api/client";
import { fetchSettings } from "./api/settings";

export default function Layout({ onSignOut }: { onSignOut: () => void }) {
    const isCoordinator = getUserRole() === "COORDINATOR";
    const [needsSetup, setNeedsSetup] = useState(false);

    useEffect(() => {
        if (!isCoordinator) return;
        fetchSettings().then((s) => setNeedsSetup(!s.configured)).catch(() => {});
    }, [isCoordinator]);

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
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/activities">Activities</Link>
                    {isCoordinator && <Link to="/review">Review</Link>}
                    {isCoordinator && <Link to="/organizations">Organizations</Link>}
                    {isCoordinator && <Link to="/settings">Settings</Link>}
                </nav>
                <button onClick={handleSignOut} style={{ marginLeft: "auto" }}>Sign out</button>
            </header>

            {needsSetup && (
                <div style={{ padding: "8px 16px", background: "#fef9c3", color: "#854d0e",
                    borderBottom: "1px solid #fde68a", fontSize: 14, display: "flex", gap: 10, alignItems: "center" }}>
                    <span>Finish setting up your instance — choose how activities appear on the shared map.</span>
                    <Link to="/settings" style={{ fontWeight: 600 }}>Go to Settings →</Link>
                </div>
            )}

            <main style={{ flex: 1, position: "relative" }}>
                <Outlet />
            </main>
        </div>
    );
}
