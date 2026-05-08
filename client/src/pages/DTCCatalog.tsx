import { useEffect, useState } from "react";
import { api, Session } from "../api";

type DTC = {
  code: string;
  title: string;
  probable_cause: string;
  recommended_action: string;
};

const empty: DTC = { code: "", title: "", probable_cause: "", recommended_action: "" };

export default function DTCCatalog({ session }: { session: Session }) {
  const isAdmin = session.role === "admin";
  const [items, setItems] = useState<DTC[]>([]);
  const [draft, setDraft] = useState<DTC>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const r = await api.get<DTC[]>("/diagnosis/dtc");
      setItems(r.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/diagnosis/dtc/${editing}`, draft);
      } else {
        await api.post("/diagnosis/dtc", draft);
      }
      setDraft(empty);
      setEditing(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  async function remove(code: string) {
    if (!confirm(`Delete ${code}?`)) return;
    try {
      await api.delete(`/diagnosis/dtc/${code}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }

  function startEdit(d: DTC) {
    setEditing(d.code);
    setDraft(d);
  }

  return (
    <div>
      <h2>DTC catalog</h2>

      {isAdmin && (
        <div className="card">
          <h3>{editing ? `Edit ${editing}` : "Add a code"}</h3>
          <form onSubmit={save}>
            <label>Code</label>
            <input
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              disabled={!!editing}
              required
            />
            <label>Title</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
            <label>Probable cause</label>
            <textarea
              rows={2}
              value={draft.probable_cause}
              onChange={(e) => setDraft({ ...draft, probable_cause: e.target.value })}
              required
            />
            <label>Recommended action</label>
            <textarea
              rows={2}
              value={draft.recommended_action}
              onChange={(e) => setDraft({ ...draft, recommended_action: e.target.value })}
              required
            />
            {error && <p className="error">{error}</p>}
            <div style={{ marginTop: 12 }}>
              <button className="primary">{editing ? "Save" : "Add"}</button>{" "}
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setDraft(empty); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {items.length === 0 ? (
          <p className="muted">Catalog is empty. Run the seed script.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Probable cause</th>
                <th>Recommended action</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.code}>
                  <td>{d.code}</td>
                  <td>{d.title}</td>
                  <td>{d.probable_cause}</td>
                  <td>{d.recommended_action}</td>
                  {isAdmin && (
                    <td>
                      <button onClick={() => startEdit(d)}>Edit</button>{" "}
                      <button onClick={() => remove(d.code)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
