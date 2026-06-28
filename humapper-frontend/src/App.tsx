import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./auth/LoginForm";
import Layout from "./Layout";
import MapPage from "./pages/MapPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import ActivatePage from "./pages/ActivatePage";
import { getToken } from "./api/client";

export default function App() {
    const [loggedIn, setLoggedIn] = useState(!!getToken());

    return (
        <BrowserRouter>
            <Routes>
                {/* Public: invited users set their password here (no login required). */}
                <Route path="/activate" element={<ActivatePage />} />

                {loggedIn ? (
                    <Route element={<Layout onSignOut={() => setLoggedIn(false)} />}>
                        <Route path="/" element={<MapPage />} />
                        <Route path="/organizations" element={<OrganizationsPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                ) : (
                    <Route path="*" element={<LoginForm onLoggedIn={() => setLoggedIn(true)} />} />
                )}
            </Routes>
        </BrowserRouter>
    );
}
