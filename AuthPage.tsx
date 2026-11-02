import { useState } from "react";
import { MOCK_USERS, User } from "../data/mockData";

interface Props {
  role: "doctor" | "admin";
  onLogin: (user: User) => void;
  onBack: () => void;
}

const DEMO_CREDS = {
  doctor: { username: "bs.nguyen.ha", password: "demo1234" },
  admin: { username: "admin.pham.hai", password: "admin1234" },
};

export default function AuthPage({ role, onLogin, onBack }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demo = DEMO_CREDS[role];
  const isAdmin = role === "admin";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const user = MOCK_USERS.find(
        u => u.username === username && u.role === role && u.is_active
      );
      if (user && password.length >= 6) {
        onLogin(user);
      } else {
        setError("Sai tên đăng nhập hoặc mật khẩu. Thử tài khoản demo bên dưới.");
      }
      setLoading(false);
    }, 600);
  }

  function fillDemo() {
    setUsername(demo.username);
    setPassword(demo.password);
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#04091a] text-[#e8edf5] flex flex-col items-center justify-center px-4">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-[#64849e] hover:text-[#e8edf5] transition-colors text-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Quay lại
      </button>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isAdmin ? "bg-[#f97316]/20 border border-[#f97316]/30" : "bg-[#0ea5e9]/20 border border-[#0ea5e9]/30"}`}>
            {isAdmin ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth={1.5} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
          <div className="font-display text-2xl mb-1">NeuraScan<span className="text-[#0ea5e9]">AI</span></div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-data ${isAdmin ? "bg-[#f97316]/10 border border-[#f97316]/20 text-[#f97316]" : "bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[#0ea5e9]"}`}>
            {isAdmin ? "Cổng Quản trị" : "Cổng Bác sỹ"}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono-data text-xs text-[#64849e] mb-1.5">TÊN ĐĂNG NHẬP</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={demo.username}
              className="w-full bg-[#0b1229] border border-[#1a2e4a] rounded-lg px-4 py-3 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono-data text-xs text-[#64849e] mb-1.5">MẬT KHẨU</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0b1229] border border-[#1a2e4a] rounded-lg px-4 py-3 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none focus:border-[#0ea5e9]/50 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#ef4444]/5 border border-[#ef4444]/20 text-[#ef4444] text-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-all ${loading || !username || !password ? "opacity-50 cursor-not-allowed bg-[#0ea5e9]" : isAdmin ? "bg-[#f97316] hover:bg-[#ea6c00]" : "bg-[#0ea5e9] hover:bg-[#0284c7]"} text-white`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang xác thực…
              </span>
            ) : "Đăng nhập"}
          </button>
        </form>

        {/* Demo shortcut */}
        <div className="mt-6 p-4 rounded-xl border border-[#1a2e4a] bg-[#0b1229]">
          <div className="font-mono-data text-xs text-[#64849e] mb-2">TÀI KHOẢN DEMO</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[#94aec8]">{demo.username}</div>
              <div className="font-mono-data text-xs text-[#64849e]">{demo.password}</div>
            </div>
            <button
              onClick={fillDemo}
              className="px-3 py-1.5 border border-[#1a2e4a] text-[#64849e] text-xs rounded-lg hover:text-[#e8edf5] hover:border-[#0ea5e9]/30 transition-colors"
            >
              Điền
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
