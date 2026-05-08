import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [status, setStatus] = useState<string>("checking...");

  useEffect(() => {
    api
      .get("/health")
      .then((r) => setStatus(`gateway: ${r.data.status}`))
      .catch((e) => setStatus(`gateway: unreachable (${e.message})`));
  }, []);

  return (
    <div className="container">
      <h1>Smart Car Diagnosis</h1>
      <p className="muted">Scaffold build. Backend integration check below.</p>
      <div className="card">
        <strong>{status}</strong>
      </div>
    </div>
  );
}
