import { useEffect, useState, type ReactNode } from "react";
import HomePage from "./pages/HomePage";
import DoctorPortal from "./pages/DoctorPortal";
import AdminPortal from "./pages/AdminPortal";
import AuthPage from "./pages/AuthPage";
import type { User } from "./data/mockData";
import "./portal-theme.css";

export type Page = "home" | "auth-doctor" | "auth-admin" | "doctor" | "admin";
type Theme = "light" | "dark";

function PortalShell({ children, theme, onToggleTheme }: { children: ReactNode; theme: Theme; onToggleTheme: () => void }) {
  return (
    <div className="portal-shell" data-theme={theme}>
      {children}
      <button
        type="button"
        className="portal-theme-toggle"
        onClick={onToggleTheme}
        aria-label={theme === "light" ? "Bật giao diện tối" : "Bật giao diện sáng"}
        title={theme === "light" ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng"}
      >
        <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
        <span>{theme === "light" ? "Giao diện tối" : "Giao diện sáng"}</span>
      </button>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    try { return window.localStorage.getItem("neurascan-portal-theme") === "dark" ? "dark" : "light"; }
    catch { return "light"; }
  });

  useEffect(() => {
    try { window.localStorage.setItem("neurascan-portal-theme", theme); } catch { /* Storage may be unavailable. */ }
  }, [theme]);

  function handleLogin(user: User) {
    setCurrentUser(user);
    setPage(user.role === "admin" ? "admin" : "doctor");
  }

  function handleLogout() {
    setCurrentUser(null);
    setPage("home");
  }

  const toggleTheme = () => setTheme(value => value === "light" ? "dark" : "light");

  if (page === "auth-doctor") return <AuthPage role="doctor" onLogin={handleLogin} onBack={() => setPage("home")} />;
  if (page === "auth-admin") return <AuthPage role="admin" onLogin={handleLogin} onBack={() => setPage("home")} />;
  if (page === "doctor" && currentUser) return <PortalShell theme={theme} onToggleTheme={toggleTheme}><DoctorPortal user={currentUser} onBack={handleLogout} /></PortalShell>;
  if (page === "admin" && currentUser) return <PortalShell theme={theme} onToggleTheme={toggleTheme}><AdminPortal user={currentUser} onBack={handleLogout} /></PortalShell>;
  return <HomePage onNavigate={setPage} />;
}
