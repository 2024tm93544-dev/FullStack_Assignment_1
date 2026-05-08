import { useState } from "react";
import { api, saveSession, Session } from "../api";

export default function Login({ onLoggedIn }: { onLoggedIn: (s: Session) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"driver" | "mechanic" | "admin">("driver");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Password validation regex patterns
  const passwordRules = {
    minLength: { pattern: /.{8,}/, label: "At least 8 characters" },
    uppercase: { pattern: /[A-Z]/, label: "One uppercase letter (A-Z)" },
    lowercase: { pattern: /[a-z]/, label: "One lowercase letter (a-z)" },
    number: { pattern: /\d/, label: "One number (0-9)" },
    special: { pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, label: "One special character (!@#$%...)" },
  };

  const validatePassword = (pwd: string) => {
    const results: { [key: string]: boolean } = {};
    Object.entries(passwordRules).forEach(([key, rule]) => {
      results[key] = rule.pattern.test(pwd);
    });
    return results;
  };

  const passwordValidation = validatePassword(password);
  const isPasswordValid = mode === "login" ? password.length >= 6 : Object.values(passwordValidation).every(v => v);
  const passwordsMatch = confirmPassword === password;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate on submit
    if (mode === "register") {
      if (!name.trim()) {
        setError("Name is required");
        return;
      }
      if (!isPasswordValid) {
        setError("Password does not meet all requirements");
        return;
      }
      if (!passwordsMatch) {
        setError("Passwords do not match");
        return;
      }
    }

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

  const inputIcon = (icon: string) => <i className={`fas fa-${icon}`} style={{ marginRight: 8, color: "var(--primary)" }} />;
  
  const ValidationRule = ({ rule, isValid }: { rule: string; isValid: boolean }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 6, color: isValid ? "var(--success)" : "var(--text-muted)" }}>
      <i className={`fas fa-${isValid ? "check-circle" : "circle"}`} style={{ width: 16, textAlign: "center" }}></i>
      <span>{rule}</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="container" style={{ maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32, color: "#fff" }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: "#fff" }}>
            <i className="fas fa-car-alt"></i>
          </div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 28, fontWeight: 700 }}>Smart Diagnosis</h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>{mode === "login" ? "Welcome back to your garage" : "Join the diagnostic network"}</p>
        </div>

        <div className="card" style={{ boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)" }}>
          <form onSubmit={submit}>
            {mode === "register" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", marginBottom: 8, fontWeight: 600, color: "var(--text-primary)" }}>
                    {inputIcon("user")}
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    minLength={2}
                    style={{ paddingLeft: 12 }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", marginBottom: 8, fontWeight: 600, color: "var(--text-primary)" }}>
                    <i className="fas fa-briefcase" style={{ marginRight: 8, color: "var(--primary)" }}></i>
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    style={{
                      background: `linear-gradient(135deg, var(--bg-default) 0%, #f0f9ff 100%)`,
                      border: "2px solid var(--border-medium)",
                    }}
                  >
                    <option value="driver">Driver</option>
                    <option value="mechanic">Mechanic</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", marginBottom: 8, fontWeight: 600, color: "var(--text-primary)" }}>
                {inputIcon("envelope")}
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ paddingLeft: 12 }}
              />
            </div>

            <div style={{ marginBottom: mode === "register" ? 12 : 20 }}>
              <label style={{ display: "flex", alignItems: "center", marginBottom: 8, fontWeight: 600, color: "var(--text-primary)" }}>
                {inputIcon("lock")}
                Password
                {mode === "register" && password && (isPasswordValid ? <i className="fas fa-check" style={{ marginLeft: "auto", color: "var(--success)" }}></i> : <i className="fas fa-times" style={{ marginLeft: "auto", color: "var(--error)" }}></i>)}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={mode === "login" ? 6 : 8}
                required
                style={{ paddingLeft: 12, borderColor: mode === "register" && password ? (isPasswordValid ? "var(--success)" : "var(--error)") : undefined }}
              />
              {mode === "register" && password && (
                <div style={{ marginTop: 12, padding: 12, background: "var(--bg-light)", borderRadius: 6, fontSize: 12 }}>
                  {Object.entries(passwordRules).map(([key, rule]) => (
                    <ValidationRule key={key} rule={rule.label} isValid={passwordValidation[key]} />
                  ))}
                </div>
              )}
            </div>

            {mode === "register" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "flex", alignItems: "center", marginBottom: 8, fontWeight: 600, color: "var(--text-primary)" }}>
                  {inputIcon("lock")}
                  Confirm Password
                  {password && confirmPassword && (passwordsMatch ? <i className="fas fa-check" style={{ marginLeft: "auto", color: "var(--success)" }}></i> : <i className="fas fa-times" style={{ marginLeft: "auto", color: "var(--error)" }}></i>)}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={8}
                  required
                  style={{ paddingLeft: 12, borderColor: confirmPassword ? (passwordsMatch ? "var(--success)" : "var(--error)") : undefined }}
                />
              </div>
            )}

            {error && (
              <div className="error" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button
                className="primary"
                disabled={busy || (mode === "register" && (!isPasswordValid || !passwordsMatch || !name.trim()))}
                type="submit"
                style={{
                  flex: 1,
                  background: busy ? "var(--primary)" : "linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)",
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "12px 16px",
                  opacity: busy || (mode === "register" && (!isPasswordValid || !passwordsMatch || !name.trim())) ? 0.6 : 1,
                }}
              >
                <i className={`fas fa-${mode === "login" ? "sign-in-alt" : "user-plus"}`} style={{ marginRight: 8 }}></i>
                {busy ? "..." : mode === "login" ? "Sign In" : "Register"}
              </button>
            </div>

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                  setPassword("");
                  setConfirmPassword("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "underline",
                  padding: 0,
                  paddingTop: 8,
                }}
              >
                <i className="fas fa-arrow-right" style={{ marginRight: 6 }}></i>
                {mode === "login" ? "Don't have an account? Register" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "#fff", fontSize: 12, marginTop: 20, opacity: 0.8 }}>
          <i className="fas fa-lock" style={{ marginRight: 6 }}></i>
          Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}
