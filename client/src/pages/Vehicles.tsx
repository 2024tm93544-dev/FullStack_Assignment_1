import { useEffect, useState } from "react";
import { api } from "../api";

type Vehicle = {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
};

export default function Vehicles() {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [vin, setVin] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setError(null);
    try {
      const res = await api.get<Vehicle[]>("/vehicles");
      setItems(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/vehicles", { vin, make, model, year });
      setVin("");
      setMake("");
      setModel("");
      await load();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  return (
    <div>
      <h2>My vehicles</h2>

      <div className="card">
        <h3>Add a vehicle</h3>
        <form onSubmit={add}>
          <div className="row">
            <div>
              <label>VIN</label>
              <input value={vin} onChange={(e) => setVin(e.target.value)} required />
            </div>
            <div>
              <label>Make</label>
              <input value={make} onChange={(e) => setMake(e.target.value)} required />
            </div>
            <div>
              <label>Model</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} required />
            </div>
            <div>
              <label>Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1950}
                max={2100}
                required
              />
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <div style={{ marginTop: 12 }}>
            <button className="primary" disabled={busy}>{busy ? "..." : "Add"}</button>
          </div>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="muted">No vehicles yet. Add your first one above.</p>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>VIN</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td>{v.vin}</td>
                  <td>{v.make}</td>
                  <td>{v.model}</td>
                  <td>{v.year}</td>
                  <td>
                    <button onClick={() => remove(v.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
