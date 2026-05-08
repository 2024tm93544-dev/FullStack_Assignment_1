import { useState, useEffect } from "react";
import { api, loadSession } from "../api";

interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
}

interface DiagnoseResult {
  probable_cause: string;
  recommended_action: string;
}

 export function Diagnose() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [beforePhoto, setBeforePhoto] = useState<string>("");
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const session = loadSession();

  useEffect(() => {
    fetchVehicles();
    fetchHistory();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles");
      setVehicles(res.data);
    } catch (err) {
      console.error("Failed to fetch vehicles", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/diagnosis/reports");
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleDiagnose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || (!code && !symptoms)) {
      alert("Select vehicle and enter code or symptoms");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/diagnosis/reports", {
        vehicle_id: selectedVehicle,
        dtc: code || undefined,
        symptoms: symptoms || undefined,
        before_photo: beforePhoto || undefined,
      });

      setResult({
        probable_cause: res.data.probable_cause,
        recommended_action: res.data.recommended_action,
      });

      // Clear form
      setCode("");
      setSymptoms("");
      setBeforePhoto("");

      // Refresh history
      fetchHistory();
    } catch (err) {
      console.error("Diagnosis failed", err);
      alert("Failed to get diagnosis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Vehicle Diagnosis</h2>

      <form onSubmit={handleDiagnose} className="card">
        <div>
          <label>Select Vehicle:</label>
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            required
          >
            <option value="">-- Choose a vehicle --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year} {v.make} {v.model} ({v.vin})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <label>Trouble Code (e.g., P0301):</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label>Symptoms (e.g., engine shaking):</label>
          <input
            type="text"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <label>Before Photo (issue proof):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                  setBeforePhoto(evt.target?.result as string);
                };
                reader.readAsDataURL(e.target.files[0]);
              }
            }}
          />
          {beforePhoto && (
            <img
              src={beforePhoto}
              alt="preview"
              style={{ maxWidth: 150, marginTop: 10 }}
            />
          )}
        </div>

        <button
          className="primary"
          type="submit"
          disabled={loading}
          style={{ marginTop: 20 }}
        >
          {loading ? "Getting suggestion..." : "Get Suggestion"}
        </button>
      </form>

      {result && (
        <div className="card" style={{ marginTop: 24, borderLeft: "4px solid var(--success)", backgroundColor: "var(--bg-light)" }}>
          <h3 style={{ marginTop: 0, color: "var(--success)" }}>✓ Diagnosis Result</h3>
          <p style={{ marginBottom: 0 }}>
            <strong>Probable Cause:</strong> {result.probable_cause}
          </p>
          <p style={{ marginTop: 12 }}>
            <strong>Recommended Action:</strong> {result.recommended_action}
          </p>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h3>History</h3>
        {history.length === 0 ? (
          <p>No diagnosis history</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Symptoms</th>
                <th>Cause</th>
                <th>Action</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{h.dtc || "-"}</td>
                  <td>{h.symptoms || "-"}</td>
                  <td>{h.probable_cause}</td>
                  <td>{h.recommended_action}</td>
                  <td>{new Date(h.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

