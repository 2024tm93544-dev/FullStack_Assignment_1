import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearSession, loadSession, Session } from "./api";
import Login from "./pages/Login";
import Vehicles from "./pages/Vehicles";
import DTCCatalog from "./pages/DTCCatalog";
import {Diagnose} from "./pages/Diagnose";
import { Reports } from "./pages/Reports";

function TopBar({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const loc = useLocation();
  const cls = (path: string) => (loc.pathname.startsWith(path) ? "active" : "");
  return (
    <nav className="topbar">
      <strong>Smart Car Diagnosis</strong>
      <Link to="/vehicles" className={cls("/vehicles")}>Vehicles</Link>
      <Link to="/diagnose" className={cls("/diagnose")}>Diagnose</Link>
      <Link to="/catalog" className={cls("/catalog")}>Catalog</Link>
      <a href="/reports">Reports</a>
      <span className="spacer" />
      <span className="who">{session.name} ({session.role})</span>
      <button onClick={onLogout}>Logout</button>
    </nav>
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
    <>
      <TopBar session={session} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/diagnose" element={<Diagnose />} />
          <Route path="/catalog" element={<DTCCatalog session={session} />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/vehicles" replace />} />
        </Routes>
      </div>
    </>
  );
}
