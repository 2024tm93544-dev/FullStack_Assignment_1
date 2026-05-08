import { useEffect, useState } from "react";
import { api } from "../api";

type Vehicle = { id: string; vin: string; make: string; model: string; year: number };

type Report = {
  id: string;
  vehicle_id: string;
  dtc?: string | null;
  symptoms?: string | null;
  probable_cause: string;
  recommended_action: string;
  created_at: string;
};

export default function Diagnose() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [dtc, setDtc] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [latest, setLatest] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<Vehicle[]>("/vehicles").then((r) => {
      setVehicles(r.data);
      if (r.data.length > 0) setVehicleId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!vehicleId) return;
    api
      .get<Report[]>("/diagnosis/reports", { params: { vehicle_id: vehicleId } })
      .then((r) => setHistory(r.data))
      .catch(() => setHistory([]));
  }, [vehicleId, latest]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!vehicleId) {
      setError("Add a vehicle first");
      return;
    }
    if (!dtc.trim() && !symptoms.trim()) {
      setError("Enter a DTC or describe the symptoms");
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<Report>("/diagnosis/reports", {
        vehicle_id: vehicleId,
        dtc: dtc.trim() || null,
        symptoms: symptoms.trim() || null,
      });
      setLatest(res.data);
      setDtc("");
      setSymptoms("");
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2>Diagnose</h2>

      <div className="card">
        <form onSubmit={submit}>
          <label>Vehicle</label>
          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            {vehicles.length === 0 && <option value="">(no vehicles)</option>}
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year} {v.make} {v.model} ({v.vin})
              </option>
            ))}
          </select>

          <label>OBD-II code (optional)</label>
          <input
            placeholder="e.g. P0301"
            value={dtc}
            onChange={(e) => setDtc(e.target.value.toUpperCase())}
            maxLength={10}
          />

          <label>Symptoms (optional)</label>
          <textarea
            rows={3}
            placeholder="e.g. engine shaking at idle and check engine light on"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />

          {error && <p className="error">{error}</p>}
          <div style={{ marginTop: 12 }}>
            <button className="primary" disabled={busy}>
              {busy ? "..." : "Get suggestion"}
            </button>
          </div>
        </form>
      </div>

      {latest && (
        <div className="card">
          <h3>Latest result</h3>
          <p><strong>Probable cause:</strong> {latest.probable_cause}</p>
          <p><strong>Recommended action:</strong> {latest.recommended_action}</p>
        </div>
      )}

      <div className="card">
        <h3>History</h3>
        {history.length === 0 ? (
          <p className="muted">No reports yet for this vehicle.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>DTC</th>
                <th>Symptoms</th>
                <th>Cause</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td>{r.dtc || "-"}</td>
                  <td>{r.symptoms || "-"}</td>
                  <td>{r.probable_cause}</td>
                  <td>{r.recommended_action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
