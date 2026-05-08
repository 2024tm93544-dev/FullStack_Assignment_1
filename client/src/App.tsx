import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearSession, loadSession, Session } from "./api";
import Login from "./pages/Login";

function Home({ session, onLogout }: { session: Session; onLogout: () => void }) {
  return (
    <div className="container">
      <h2>Signed in as {session.name} ({session.role})</h2>
      <p className="muted">More features arrive in later commits.</p>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession());
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) navigate("/login", { replace: true });
  }, [session, navigate]);

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoggedIn={setSession} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="*" element={<Home session={session} onLogout={handleLogout} />} />
    </Routes>
  );
}
