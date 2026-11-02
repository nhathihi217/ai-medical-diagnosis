import { useState } from "react";
import { MOCK_USERS, MOCK_CASES, MOCK_AUDIT_LOGS, MOCK_SYSTEM_CONFIG, User, ShiftStatus } from "../data/mockData";

interface Props {
  user: User;
  onBack: () => void;
}

type Tab = "dashboard" | "users" | "config" | "system";

const weekData = [42, 58, 51, 73, 66, 84, 91, 78, 95, 88, 72, 64, 81, 93];

export default function AdminPortal({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [config, setConfig] = useState(MOCK_SYSTEM_CONFIG);
  const [editingConfig, setEditingConfig] = useState(false);
  const [configDraft, setConfigDraft] = useState(MOCK_SYSTEM_CONFIG);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", full_name: "", role: "doctor" as "doctor" | "admin", department: "" });

  const totalCases = MOCK_CASES.length;
  const confirmedCases = MOCK_CASES.filter(c => c.review_status === "confirmed").length;
  const emergencyCases = MOCK_CASES.filter(c => c.priority_level === "emergency").length;
  const confirmRate = Math.round((confirmedCases / totalCases) * 100);

  function toggleShift(userId: string) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, shift_status: u.shift_status === "on_duty" ? "off_duty" : "on_duty" as ShiftStatus } : u));
  }

  function toggleActive(userId: string) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u));
  }

  function handleSaveConfig() {
    setConfig(configDraft);
    setEditingConfig(false);
  }

  function handleAddUser() {
    if (!newUser.username || !newUser.full_name) return;
    const u: User = {
      id: `u${users.length + 1}`,
      ...newUser,
      password_hash: "",
      shift_status: "off_duty",
      is_active: true,
      created_at: new Date().toISOString().slice(0, 10),
    } as User;
    setUsers(prev => [...prev, u]);
    setNewUser({ username: "", full_name: "", role: "doctor", department: "" });
    setShowAddUser(false);
  }

  const onDutyDoctors = users.filter(u => u.role === "doctor" && u.shift_status === "on_duty" && u.is_active);

  return (
    <div className="min-h-screen bg-[#04091a] text-[#e8edf5] flex flex-col">
      <header className="border-b border-[#1a2e4a] bg-[#04091a]/95 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <button onClick={onBack} className="text-[#64849e] hover:text-[#e8edf5] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="h-4 w-px bg-[#1a2e4a]" />
          <span className="font-display text-lg">NeuraScan<span className="text-[#0ea5e9]">AI</span></span>
          <div className="ml-2 px-2 py-0.5 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 text-[#f97316] font-mono-data text-xs">Admin</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="font-mono-data text-xs text-[#22c55e]">{onDutyDoctors.length} bác sỹ đang trực</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#f97316]/20 border border-[#f97316]/30 flex items-center justify-center text-[#f97316] text-sm font-semibold">H</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex gap-0">
          {([
            { key: "dashboard", label: "Thống kê (F14)" },
            { key: "users", label: "Người dùng (F3)" },
            { key: "config", label: "Cấu hình (F13)" },
            { key: "system", label: "Hệ thống (F17/F18)" },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-3 text-sm border-b-2 transition-colors ${tab === t.key ? "border-[#f97316] text-[#f97316]" : "border-transparent text-[#64849e] hover:text-[#94aec8]"}`}>{t.label}</button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {tab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl">Thống kê hệ thống</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Tổng Ca hôm nay", value: String(totalCases), sub: "+3 so với hôm qua", color: "text-[#e8edf5]" },
                { label: "Ca Khẩn cấp", value: String(emergencyCases), sub: "Vượt ngư���ng cấu hình", color: "text-[#ef4444]" },
                { label: "Tỷ lệ xác nhận", value: `${confirmRate}%`, sub: `${confirmedCases}/${totalCases} Ca`, color: "text-[#22c55e]" },
                { label: "Thời gian phản hồi", value: "18 phút", sub: "Từ cảnh báo → xác nhận", color: "text-[#0ea5e9]" },
              ].map(k => (
                <div key={k.label} className="border border-[#1a2e4a] rounded-xl p-5 bg-[#0b1229]">
                  <div className="font-mono-data text-xs text-[#64849e] mb-2">{k.label.toUpperCase()}</div>
                  <div className={`font-display text-3xl mb-1 ${k.color}`}>{k.value}</div>
                  <div className="text-xs text-[#64849e]">{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 border border-[#1a2e4a] rounded-xl p-5 bg-[#0b1229]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-mono-data text-xs text-[#64849e] mb-1">SỐ CA / NGÀY</div>
                    <div className="font-display text-2xl">14 ngày qua</div>
                  </div>
                  <div className="font-mono-data text-xs text-[#22c55e]">↑ Tăng 12%</div>
                </div>
                <div className="flex items-end gap-1.5 h-40">
                  {weekData.map((v, i) => (
                    <div key={i} className="flex-1 group relative">
                      <div className="w-full rounded-sm bg-[#0ea5e9] hover:bg-[#38bdf8] transition-colors cursor-pointer" style={{ height: `${(v / 100) * 140}px`, opacity: 0.55 + (i / weekData.length) * 0.45 }} />
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#0b1229] border border-[#1a2e4a] rounded px-1.5 py-0.5 text-xs font-mono-data text-[#e8edf5]">{v} ca</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-mono-data text-xs text-[#64849e]">07/11</span>
                  <span className="font-mono-data text-xs text-[#64849e]">21/11</span>
                </div>
              </div>

              <div className="border border-[#1a2e4a] rounded-xl p-5 bg-[#0b1229]">
                <div className="font-mono-data text-xs text-[#64849e] mb-4">PHÂN BỐ MỨC ƯU TIÊN</div>
                <div className="space-y-3">
                  {[
                    { label: "Khẩn cấp (Emergency)", count: MOCK_CASES.filter(c => c.priority_level === "emergency").length, color: "#ef4444" },
                    { label: "Xem xét (Review)", count: MOCK_CASES.filter(c => c.priority_level === "review").length, color: "#f97316" },
                    { label: "Bình thường (None)", count: MOCK_CASES.filter(c => c.priority_level === "none").length, color: "#22c55e" },
                  ].map(t => (
                    <div key={t.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: t.color }}>{t.label}</span>
                        <span className="font-mono-data text-[#64849e]">{t.count} Ca</span>
                      </div>
                      <div className="h-1.5 bg-[#04091a] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(t.count / totalCases) * 100}%`, backgroundColor: t.color, opacity: 0.8 }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-[#1a2e4a]">
                  <div className="font-mono-data text-xs text-[#64849e] mb-3">TRẠNG THÁI XÉT DUYỆT</div>
                  <div className="space-y-2">
                    {[
                      { label: "Chờ xác nhận", count: MOCK_CASES.filter(c => c.review_status === "pending").length, color: "#f97316" },
                      { label: "Đã xác nhận", count: confirmedCases, color: "#22c55e" },
                      { label: "Từ chối", count: MOCK_CASES.filter(c => c.review_status === "rejected").length, color: "#64849e" },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-[#94aec8]">{s.label}</span>
                        </div>
                        <span className="font-mono-data" style={{ color: s.color }}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl">Quản lý tài khoản</h2>
                <p className="text-xs text-[#64849e] mt-1">Tạo/sửa/khoá tài khoản · Quản lý trạng thái trực ca (shift_status)</p>
              </div>
              <button onClick={() => setShowAddUser(true)} className="px-4 py-2 bg-[#0ea5e9] text-white text-sm rounded-lg hover:bg-[#0284c7] transition-colors">+ Thêm tài khoản</button>
            </div>

            <div className="border border-[#22c55e]/20 bg-[#22c55e]/5 rounded-xl p-3 mb-4 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shrink-0" />
              <span className="text-sm text-[#22c55e]">Đang trực ca: {onDutyDoctors.map(u => u.full_name).join(", ") || "Không có bác sỹ nào đang trực"}</span>
              {onDutyDoctors.length === 0 && <span className="text-xs text-[#f97316] ml-2">⚠ Cảnh báo sẽ fallback gửi toàn bộ khoa</span>}
            </div>

            <div className="border border-[#1a2e4a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2e4a] bg-[#0b1229]">
                    {['Họ tên', 'Username', 'Vai trò', 'Khoa', 'Trạng thái trực', 'Tài khoản', 'Thao tác'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-mono-data text-xs text-[#64849e]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={`border-b border-[#1a2e4a] transition-colors ${!u.is_active ? "opacity-50" : "hover:bg-[#0b1229]"} ${i === users.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${u.role === "admin" ? "bg-[#f97316]/20 text-[#f97316]" : "bg-[#0ea5e9]/20 text-[#0ea5e9]"}`}>{u.full_name.split(" ").pop()![0]}</div>
                          <span className="text-sm font-medium">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono-data text-xs text-[#64849e]">{u.username}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${u.role === "admin" ? "text-[#f97316] border-[#f97316]/30 bg-[#f97316]/5" : "text-[#0ea5e9] border-[#0ea5e9]/30 bg-[#0ea5e9]/5"}`}>{u.role === "admin" ? "Admin" : "Bác sỹ"}</span></td>
                      <td className="px-4 py-3 text-sm text-[#94aec8]">{u.department}</td>
                      <td className="px-4 py-3">{u.role === "doctor" ? <button onClick={() => toggleShift(u.id)} className={`text-xs px-2 py-1 rounded-full border transition-all ${u.shift_status === "on_duty" ? "text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/5 hover:bg-[#22c55e]/10" : "text-[#64849e] border-[#1a2e4a] hover:border-[#0ea5e9]/30"}`}>{u.shift_status === "on_duty" ? "● Đang trực" : "○ Không trực"}</button> : <span className="text-xs text-[#64849e]">—</span>}</td>
                      <td className="px-4 py-3"><button onClick={() => toggleActive(u.id)} className={`text-xs px-2 py-0.5 rounded border transition-colors ${u.is_active ? "text-[#22c55e] border-[#22c55e]/30 hover:bg-[#ef4444]/10 hover:text-[#ef4444] hover:border-[#ef4444]/30" : "text-[#64849e] border-[#1a2e4a]"}`}>{u.is_active ? "Hoạt động" : "Đã khoá"}</button></td>
                      <td className="px-4 py-3"><button className="text-xs text-[#0ea5e9] hover:underline">Sửa</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showAddUser && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
                <div className="bg-[#0b1229] border border-[#1a2e4a] rounded-xl p-6 max-w-md w-full">
                  <div className="font-display text-xl mb-4">Thêm tài khoản mới</div>
                  <div className="space-y-3 mb-4">
                    {[
                      { label: "Họ tên", key: "full_name", placeholder: "BS. Nguyễn Văn X" },
                      { label: "Username", key: "username", placeholder: "bs.nguyen.x" },
                      { label: "Khoa", key: "department", placeholder: "Thần kinh" },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="font-mono-data text-xs text-[#64849e] mb-1 block">{f.label}</label>
                        <input value={newUser[f.key as keyof typeof newUser]} onChange={e => setNewUser(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none focus:border-[#0ea5e9]/50" />
                      </div>
                    ))}
                    <div>
                      <label className="font-mono-data text-xs text-[#64849e] mb-1 block">Vai trò</label>
                      <select value={newUser.role} onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value as "doctor" | "admin" }))} className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#94aec8] focus:outline-none">
                        <option value="doctor">Bác sỹ</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleAddUser} className="flex-1 py-2.5 bg-[#0ea5e9] text-white text-sm rounded-lg hover:bg-[#0284c7] transition-colors">Tạo tài khoản</button>
                    <button onClick={() => setShowAddUser(false)} className="flex-1 py-2.5 border border-[#1a2e4a] text-[#64849e] text-sm rounded-lg hover:text-[#e8edf5] transition-colors">Huỷ</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "config" && (
          <div className="max-w-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-2xl">Cấu hình ngưỡng cảnh báo</h2>
              {!editingConfig && <button onClick={() => { setConfigDraft(config); setEditingConfig(true); }} className="px-4 py-2 border border-[#1a2e4a] text-[#94aec8] text-sm rounded-lg hover:text-[#e8edf5] hover:border-[#0ea5e9]/30 transition-colors">Chỉnh sửa</button>}
            </div>
            <p className="text-xs text-[#64849e] mb-6">Lưu vào SystemConfig · Không hardcode · Được đọc tại bước F7 khi tổng hợp priority_level</p>

            <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1a2e4a] bg-[#04091a]">
                <div className="font-mono-data text-xs text-[#64849e]">SystemConfig · 4 khoá</div>
              </div>

              <div className="divide-y divide-[#1a2e4a]">
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-mono-data text-sm text-[#0ea5e9] mb-0.5">confidence_threshold</div>
                      <div className="text-xs text-[#64849e]">Ngưỡng confidence tối thiểu để tính Ca là "review". Dưới ngưỡng → priority = none.</div>
                    </div>
                    <div className="text-right">
                      {editingConfig ? <input type="number" min={50} max={99} value={configDraft.confidence_threshold} onChange={e => setConfigDraft(prev => ({ ...prev, confidence_threshold: Number(e.target.value) }))} className="w-20 bg-[#04091a] border border-[#0ea5e9]/40 rounded-md px-2 py-1 text-right font-mono-data text-sm text-[#e8edf5] focus:outline-none" /> : <div className="font-mono-data text-xl text-[#e8edf5]">{config.confidence_threshold}<span className="text-sm text-[#64849e]">%</span></div>}
                    </div>
                  </div>
                  {editingConfig && <input type="range" min={50} max={99} value={configDraft.confidence_threshold} onChange={e => setConfigDraft(prev => ({ ...prev, confidence_threshold: Number(e.target.value) }))} className="w-full mt-3 accent-[#0ea5e9]" />}
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-mono-data text-sm text-[#ef4444] mb-0.5">emergency_threshold</div>
                      <div className="text-xs text-[#64849e]">Ngưỡng confidence để nâng priority_level = emergency → trigger alert WebSocket ngay (F8).</div>
                    </div>
                    <div className="text-right">
                      {editingConfig ? <input type="number" min={70} max={99} value={configDraft.emergency_threshold} onChange={e => setConfigDraft(prev => ({ ...prev, emergency_threshold: Number(e.target.value) }))} className="w-20 bg-[#04091a] border border-[#ef4444]/40 rounded-md px-2 py-1 text-right font-mono-data text-sm text-[#e8edf5] focus:outline-none" /> : <div className="font-mono-data text-xl text-[#ef4444]">{config.emergency_threshold}<span className="text-sm text-[#64849e]">%</span></div>}
                    </div>
                  </div>
                  {editingConfig && <input type="range" min={70} max={99} value={configDraft.emergency_threshold} onChange={e => setConfigDraft(prev => ({ ...prev, emergency_threshold: Number(e.target.value) }))} className="w-full mt-3 accent-[#ef4444]" />}
                </div>

                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono-data text-sm text-[#0ea5e9] mb-0.5">auto_alert</div>
                    <div className="text-xs text-[#64849e]">Tự động gửi WebSocket alert khi phát hiện emergency (F8).</div>
                  </div>
                  <button onClick={() => editingConfig && setConfigDraft(prev => ({ ...prev, auto_alert: !prev.auto_alert }))} className={`w-11 h-6 rounded-full transition-colors relative ${(editingConfig ? configDraft.auto_alert : config.auto_alert) ? "bg-[#0ea5e9]" : "bg-[#1a2e4a]"}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${(editingConfig ? configDraft.auto_alert : config.auto_alert) ? "translate-x-5" : "translate-x-0"}`} /></button>
                </div>

                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono-data text-sm text-[#0ea5e9] mb-0.5">fallback_on_no_duty</div>
                    <div className="text-xs text-[#64849e]">Nếu không có bác sỹ on_duty → gửi alert tới toàn bộ department (F8 edge case).</div>
                  </div>
                  <button onClick={() => editingConfig && setConfigDraft(prev => ({ ...prev, fallback_on_no_duty: !prev.fallback_on_no_duty }))} className={`w-11 h-6 rounded-full transition-colors relative ${(editingConfig ? configDraft.fallback_on_no_duty : config.fallback_on_no_duty) ? "bg-[#0ea5e9]" : "bg-[#1a2e4a]"}`}><div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${(editingConfig ? configDraft.fallback_on_no_duty : config.fallback_on_no_duty) ? "translate-x-5" : "translate-x-0"}`} /></button>
                </div>
              </div>
            </div>

            {editingConfig && (
              <div className="flex gap-3 mt-4">
                <button onClick={handleSaveConfig} className="px-5 py-2.5 bg-[#0ea5e9] text-white text-sm rounded-lg hover:bg-[#0284c7] transition-colors">Lưu cấu hình</button>
                <button onClick={() => setEditingConfig(false)} className="px-5 py-2.5 border border-[#1a2e4a] text-[#64849e] text-sm rounded-lg hover:text-[#e8edf5] transition-colors">Huỷ</button>
              </div>
            )}
          </div>
        )}

        {tab === "system" && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl">Hệ thống & Kiểm tra</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "API Server", status: "ok", detail: "200 OK · 42ms", endpoint: "GET /api/health" },
                { label: "Model Service (Hướng A)", status: "ok", detail: "Inference ready · GPU 71%", endpoint: "ResNet50 + Bi-LSTM" },
                { label: "WebSocket", status: "ok", detail: `${onDutyDoctors.length} client kết nối`, endpoint: "ws://neura/ws" },
                { label: "Database", status: "ok", detail: "PostgreSQL · 58ms", endpoint: "pg · 5432" },
                { label: "Message Queue", status: "ok", detail: "0 job pending", endpoint: "Redis Queue" },
                { label: "BV Đà Nẵng Node", status: "warn", detail: "Latency 340ms (bình thường <100ms)", endpoint: "node-danang-01" },
              ].map(s => (
                <div key={s.label} className={`border rounded-xl p-4 ${s.status === "warn" ? "border-[#f97316]/30 bg-[#f97316]/5" : "border-[#1a2e4a] bg-[#0b1229]"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${s.status === "ok" ? "bg-[#22c55e]" : "bg-[#f97316]"} animate-pulse`} />
                    <span className="font-mono-data text-xs text-[#64849e]">{s.label}</span>
                  </div>
                  <div className={`text-sm font-medium mb-0.5 ${s.status === "warn" ? "text-[#f97316]" : "text-[#e8edf5]"}`}>{s.detail}</div>
                  <div className="font-mono-data text-xs text-[#64849e]">{s.endpoint}</div>
                </div>
              ))}
            </div>

            <div className="border border-[#1a2e4a] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#1a2e4a] bg-[#0b1229] flex items-center justify-between">
                <div className="font-mono-data text-xs text-[#64849e]">AUDIT LOG (F18) · AuditLog table</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="font-mono-data text-xs text-[#22c55e]">LIVE</span>
                </div>
              </div>
              <div className="divide-y divide-[#1a2e4a] font-mono-data text-xs">
                {MOCK_AUDIT_LOGS.map(log => {
                  const user = MOCK_USERS.find(u => u.id === log.user_id);
                  return (
                    <div key={log.id} className="px-5 py-2.5 flex items-start gap-4 hover:bg-[#0b1229] transition-colors">
                      <span className="text-[#64849e] shrink-0 whitespace-nowrap">{new Date(log.created_at).toLocaleString("vi-VN")}</span>
                      <span className={`shrink-0 ${log.action.includes("CONFIRM") || log.action === "LOGIN" ? "text-[#22c55e]" : log.action.includes("CONFIG") ? "text-[#0ea5e9]" : "text-[#f97316]"}`}>[{log.action}]</span>
                      <span className="text-[#94aec8]">{user?.full_name ?? log.user_id}</span>
                      <span className="text-[#64849e] truncate">{JSON.stringify(log.detail)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-[#1a2e4a] rounded-xl p-5 bg-[#0b1229]">
              <div className="font-mono-data text-xs text-[#64849e] mb-3">API ENDPOINTS (F20 — Tham chiếu)</div>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  ['POST', '/api/cases', 'Tạo Ca mới'],
                  ['POST', '/api/cases/{id}/scans', 'Upload ảnh vào Ca'],
                  ['GET', '/api/cases/{id}', 'Chi tiết Ca'],
                  ['GET', '/api/cases?review_status=pending', 'Hàng chờ xử lý'],
                  ['PATCH', '/api/cases/{id}/review', 'Bác sỹ xác nhận/từ chối'],
                  ['GET', '/api/dashboard', 'Thống kê'],
                  ['GET|PATCH', '/api/config', 'Ngưỡng cảnh báo'],
                  ['GET', '/api/health', 'Health check'],
                  ['POST', '/api/auth/login', 'Đăng nhập'],
                  ['POST', '/api/auth/logout', 'Đăng xuất'],
                ].map(([method, path, desc]) => (
                  <div key={path} className="flex items-baseline gap-2">
                    <span className={`text-xs font-bold shrink-0 ${method === "GET" ? "text-[#22c55e]" : method === "POST" ? "text-[#0ea5e9]" : method === "PATCH" ? "text-[#f97316]" : "text-[#94aec8]"}`}>{method}</span>
                    <span className="font-mono-data text-xs text-[#94aec8]">{path}</span>
                    <span className="text-xs text-[#64849e]">— {desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
