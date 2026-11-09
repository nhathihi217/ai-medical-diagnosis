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

  return (
    <>
      <HomePage onNavigate={setPage} />
      <button className="home-admin-entry" onClick={() => setPage("auth-admin")}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 19 6v5c0 4.4-2.8 8.2-7 10-4.2-1.8-7-5.6-7-10V6l7-3Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
        </svg>
        Cổng quản trị
      </button>
    </>
  );
}
