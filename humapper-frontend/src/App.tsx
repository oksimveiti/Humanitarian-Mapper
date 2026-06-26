import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./auth/LoginForm";
import Layout from "./Layout";
import MapPage from "./pages/MapPage";
import { getToken } from "./api/client";

export default function App() {
    const [loggedIn, setLoggedIn] = useState(!!getToken());

    if (!loggedIn) {
        return <LoginForm onLoggedIn={() => setLoggedIn(true)} />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout onSignOut={() => setLoggedIn(false)} />}>
                    <Route path="/" element={<MapPage />} />
                    {/* ileride: <Route path="/organizations" element={<OrganizationsPage />} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}