import { useState } from "react";
import { api, saveSession, Session } from "../api";

export default function Login({ onLoggedIn }: { onLoggedIn: (s: Session) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"driver" | "mechanic" | "admin">("driver");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "register") {
        await api.post("/auth/register", { email, password, name, role });
      }
      const res = await api.post("/auth/login", { email, password });
      const session: Session = {
        token: res.data.access_token,
        user_id: res.data.user_id,
        role: res.data.role,
        name: res.data.name,
      };
      saveSession(session);
      onLoggedIn(session);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
      <div className="card">
        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <label>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="driver">Driver</option>
                <option value="mechanic">Mechanic</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error && <p className="error">{error}</p>}
          <div style={{ marginTop: 12 }}>
            <button className="primary" disabled={busy} type="submit">
              {busy ? "..." : mode === "login" ? "Sign in" : "Register"}
            </button>{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Need an account?" : "Have an account?"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
