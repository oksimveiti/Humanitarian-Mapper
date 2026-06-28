const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export function getToken(): string | null {
    return localStorage.getItem("token");
}

export function setToken(token: string | null): void {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
}

// Reads the `role` claim from the JWT payload (base64url-encoded, not encrypted).
// Used only for UI gating (showing coordinator-only pages/links); the backend always
// re-checks the role on every request, so this is convenience, not security.
export function getUserRole(): string | null {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(payload)).role ?? null;
    } catch {
        return null;
    }
}

export async function login(email: string, password: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    setToken(data.token);
}

// Public (no auth): an invited user sets their password via their invite token.
export async function activateAccount(token: string, newPassword: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/auth/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
    });
    if (!res.ok) throw new Error("Activation failed");
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    // Expired or invalid token: clear it and send the user back to the login screen,
    // so they get a clear "please sign in again" instead of a silent failure.
    if (res.status === 401) {
        setToken(null);
        window.location.reload();
        throw new Error("Session expired");
    }

    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res;
}
