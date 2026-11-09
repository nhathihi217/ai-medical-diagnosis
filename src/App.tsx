import { useState } from "react";
import HomePage from "./pages/HomePage";
import DoctorPortal from "./pages/DoctorPortal";
import AdminPortal from "./pages/AdminPortal";
import AuthPage from "./pages/AuthPage";
import { User } from "./data/mockData";
import "./portal-theme.css";

export type Page = "home" | "auth-doctor" | "auth-admin" | "doctor" | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  function handleLogin(user: User) {
    setCurrentUser(user);
    setPage(user.role === "admin" ? "admin" : "doctor");
  }

  function handleLogout() {
    setCurrentUser(null);
    setPage("home");
  }

  if (page === "auth-doctor") return <AuthPage role="doctor" onLogin={handleLogin} onBack={() => setPage("home")} />;
  if (page === "auth-admin") return <AuthPage role="admin" onLogin={handleLogin} onBack={() => setPage("home")} />;
  if (page === "doctor" && currentUser) {
    return <div className="portal-shell"><DoctorPortal user={currentUser} onBack={handleLogout} /></div>;
  }
  if (page === "admin" && currentUser) {
    return <div className="portal-shell"><AdminPortal user={currentUser} onBack={handleLogout} /></div>;
  }

  return <HomePage onNavigate={setPage} />;
}
