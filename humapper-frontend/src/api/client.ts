const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080";

export function getToken(): string | null {
    return localStorage.getItem("token");
}

export function setToken(token: string | null): void {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
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

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res;
}
