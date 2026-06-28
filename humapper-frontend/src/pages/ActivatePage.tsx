import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { activateAccount } from "../api/client";

export default function ActivatePage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("This link is missing its invite token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      await activateAccount(token, password);
      setDone(true);
    } catch {
      setError("This invite link is invalid or has expired. Ask your coordinator for a new one.");
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(90%, 360px)", padding: 24, border: "1px solid #ddd", borderRadius: 12 }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ marginTop: 0 }}>Account activated 🎉</h2>
            <p>You can now sign in with your email and new password.</p>
            <button onClick={() => navigate("/")}>Go to sign in</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0 }}>Set your password</h2>
            <p style={{ margin: 0, color: "#555", fontSize: 14 }}>
              Welcome! Choose a password to activate your organization's account.
            </p>
            <input type="password" placeholder="New password" value={password}
                   onChange={(e) => setPassword(e.target.value)} required />
            <input type="password" placeholder="Confirm password" value={confirm}
                   onChange={(e) => setConfirm(e.target.value)} required />
            {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
            <button type="submit" disabled={saving}>{saving ? "Activating..." : "Activate account"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
