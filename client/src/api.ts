import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type Role = "driver" | "mechanic" | "admin";

export type Session = {
  token: string;
  user_id: string;
  role: Role;
  name: string;
};

export function loadSession(): Session | null {
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("session");
  if (!token || !raw) return null;
  try {
    return { token, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  localStorage.setItem("token", s.token);
  localStorage.setItem(
    "session",
    JSON.stringify({ user_id: s.user_id, role: s.role, name: s.name })
  );
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("session");
}
