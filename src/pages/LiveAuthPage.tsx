import { useState } from "react";
import { login, sessionUser } from "../services/api";
import type { User } from "../data/mockData";

interface Props {
  role: "doctor" | "admin";
  onLogin: (user: User) => void;
  onBack: () => void;
}

export default function LiveAuthPage({ role, onLogin, onBack }: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = role === "admin";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(name.trim(), password);
      onLogin(sessionUser(name.trim(), role));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#04091a] text-[#e8edf5] flex flex-col items-center justify-center px-4">
      <button onClick={onBack} className="absolute top-6 left-6 text-sm text-[#64849e] hover:text-[#e8edf5]">← Quay lại</button>
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${isAdmin ? "border-[#f97316]/30 bg-[#f97316]/10 text-[#f97316]" : "border-[#0ea5e9]/30 bg-[#0ea5e9]/10 text-[#0ea5e9]"}`} aria-hidden="true">{isAdmin ? "A" : "医"}</div>
          <div className="font-display text-2xl">NeuraScan<span className="text-[#0ea5e9]">AI</span></div>
          <p className="mt-2 text-sm text-[#64849e]">{isAdmin ? "Cổng Quản trị" : "Cổng Bác sỹ"}</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block font-mono-data text-xs text-[#64849e]">TÊN ĐĂNG NHẬP</span>
            <input required autoComplete="username" value={name} onChange={event => setName(event.target.value)} className="w-full rounded-lg border border-[#1a2e4a] bg-[#0b1229] px-4 py-3 text-sm outline-none focus:border-[#0ea5e9]/50" />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-mono-data text-xs text-[#64849e]">MẬT KHẨU</span>
            <input required type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-lg border border-[#1a2e4a] bg-[#0b1229] px-4 py-3 text-sm outline-none focus:border-[#0ea5e9]/50" />
          </label>
          {error && <div role="alert" className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5 p-3 text-sm text-[#ef4444]">{error}</div>}
          <button type="submit" disabled={loading || !name.trim() || !password} className={`w-full rounded-lg py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${isAdmin ? "bg-[#f97316] hover:bg-[#ea6c00]" : "bg-[#0ea5e9] hover:bg-[#0284c7]"}`}>
            {loading ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Đang xác thực…</span> : "Đăng nhập"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-[#64849e]">Xác thực qua máy chủ API. Không dùng tài khoản demo trong trình duyệt.</p>
      </div>
    </main>
  );
}
