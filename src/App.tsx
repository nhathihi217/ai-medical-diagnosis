import { useState } from "react";
import HomePage from "./pages/HomePage";
import AdminPortal from "./pages/AdminPortal";
import LiveAuthPage from "./pages/LiveAuthPage";
import LiveDoctorPortal from "./pages/LiveDoctorPortal";
import { logout, sessionUser } from "./services/api";
import type { User } from "./data/mockData";
import "./portal-theme.css";

export type Page = "home" | "auth-doctor" | "auth-admin" | "doctor" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function handleLogin(user: User) {
    setCurrentUser(user);
    setPage(user.role === "admin" ? "admin" : "doctor");
  }

  async function handleLogout() {
    try { await logout(); } catch { /* Leave the UI logged out even if the server is unreachable. */ }
    setCurrentUser(null);
    setPage("home");
  }

  if (page === "auth-doctor") return <LiveAuthPage role="doctor" onLogin={handleLogin} onBack={() => setPage("home")} />;
  if (page === "auth-admin") return <LiveAuthPage role="admin" onLogin={handleLogin} onBack={() => setPage("home")} />;
  if (page === "doctor" && currentUser) return <div className="portal-shell"><LiveDoctorPortal user={currentUser} onBack={() => void handleLogout()} /></div>;
  if (page === "admin" && currentUser) return <div className="portal-shell"><AdminPortal user={currentUser} onBack={() => void handleLogout()} /></div>;
  return <HomePage onNavigate={setPage} />;
}
