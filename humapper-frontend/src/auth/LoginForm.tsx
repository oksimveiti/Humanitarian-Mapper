import { useState } from "react";
import { login } from "../api/client";

export default function LoginForm({onLoggedIn} : {onLoggedIn : () => void}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            onLoggedIn();
        } catch {
            setError("Login failed. Check your email and password");
        }
    }

    return (
        <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center"}}>
            <form onSubmit={handleSubmit}
                style={{display: "flex", flexDirection: "column", gap: 12, width: "min(90%, 360px)",
                        padding: 24, border: "1px solid #ddd", borderRadius: 12}}>
                <h2 style={{ margin: 0 }}>Humanitarian Mapper</h2>
                <input type="email" placeholder="Email" value={email}
                       onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password}
                       onChange={(e) => setPassword(e.target.value)} required />
                {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
                <button type="submit">Sign in</button>
            </form>
        </div>
    )
}