import { useState, useEffect } from "react";
import { api, loadSession } from "../api";

interface Report {
  id: string;
  vehicle_id: string;
  owner_id: string;
  dtc?: string;
  symptoms?: string;
  probable_cause: string;
  recommended_action: string;
  status: "pending" | "mechanic_assigned" | "in_progress" | "completed";
  mechanic_id?: string;
  before_photo?: string;
  after_photo?: string;
  mechanic_notes?: string;
  created_at: string;
  updated_at?: string;
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const session = loadSession();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/diagnosis/reports");
      setReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      await api.put(`/diagnosis/reports/${reportId}`, { status });
      fetchReports();
    } catch (err) {
      console.error("Failed to update report", err);
    }
  };

  const uploadPhoto = async (
    reportId: string,
    file: File,
    type: "before" | "after"
  ) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        await api.put(`/diagnosis/reports/${reportId}`, {
          [type === "before" ? "before_photo" : "after_photo"]: base64,
        });
        fetchReports();
      } catch (err) {
        console.error("Failed to upload photo", err);
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="muted-container">
      <h2>Repair Status & History</h2>
      {reports.length === 0 ? (
        <p>No reports yet</p>
      ) : (
        <div>
          {reports.map((report) => (
            <div key={report.id} className="card" style={{ marginBottom: 20 }}>
              <h3>Report {report.dtc || report.symptoms}</h3>
              <p>
                <strong>Status:</strong> {report.status}
              </p>
              <p>
                <strong>Cause:</strong> {report.probable_cause}
              </p>
              <p>
                <strong>Recommendation:</strong> {report.recommended_action}
              </p>

              {/* Before Photo */}
              <div style={{ marginTop: 10 }}>
                <strong>Before Photo:</strong>
                {report.before_photo ? (
                  <img
                    src={report.before_photo}
                    alt="before"
                    style={{ maxWidth: 200, marginTop: 5 }}
                  />
                ) : (
                  <p>Not uploaded</p>
                )}
                {(session?.role === "driver" || session?.role === "admin") && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files &&
                      uploadPhoto(report.id, e.target.files[0], "before")
                    }
                  />
                )}
              </div>

              {/* After Photo */}
              <div style={{ marginTop: 10 }}>
                <strong>After Photo:</strong>
                {report.after_photo ? (
                  <img
                    src={report.after_photo}
                    alt="after"
                    style={{ maxWidth: 200, marginTop: 5 }}
                  />
                ) : (
                  <p>Not uploaded</p>
                )}
                {(session?.role === "mechanic" || session?.role === "admin") && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files &&
                      uploadPhoto(report.id, e.target.files[0], "after")
                    }
                  />
                )}
              </div>

              {/* Status Update */}
              {(session?.role === "mechanic" || session?.role === "admin") && (
                <div style={{ marginTop: 10 }}>
                  <button
                    onClick={() =>
                      updateReportStatus(report.id, "in_progress")
                    }
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() =>
                      updateReportStatus(report.id, "completed")
                    }
                  >
                    Mark Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}