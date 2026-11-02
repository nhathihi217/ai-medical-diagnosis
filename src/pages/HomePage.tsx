import { Page } from "../App";

interface Props {
  onNavigate: (p: Page) => void;
}

const stats = [
  { label: "Độ chính xác", value: "97.4%", sub: "Phát hiện xuất huyết não" },
  { label: "Ca phân tích", value: "142K+", sub: "Hình ảnh CT đã xử lý" },
  { label: "Thời gian", value: "< 8s", sub: "Kết quả trung bình" },
  { label: "Cơ sở y tế", value: "38", sub: "Bệnh viện đối tác" },
];

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .[...]
      </svg>
    ),
    title: "Phân tích CT Scan AI",
    desc: "Mô hình deep learning phát hiện 6 loại xuất huyết não với độ nhạy 97.4%, hỗ trợ bác sỹ chẩn đoán chính xác và nhanh chóng.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0[...]
      </svg>
    ),
    title: "Tra cứu Y khoa Thông minh",
    desc: "Cơ sở dữ liệu y khoa tích hợp AI — tìm kiếm ngữ nghĩa theo triệu chứng, thuốc, phác đồ điều trị và tương tác dược phẩm.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3[...]
      </svg>
    ),
    title: "Báo cáo & Phân tích",
    desc: "Dashboard thống kê theo thời gian thực — theo dõi ca bệnh, xu hướng chẩn đoán, hiệu suất hệ thống và xuất báo cáo lâm sàng.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9[...]
      </svg>
    ),
    title: "Bảo mật & Tuân thủ",
    desc: "Mã hoá đầu cuối, tuân thủ HIPAA và quy định bảo vệ dữ liệu y tế Việt Nam. Nhật ký kiểm toán đầy đủ cho mọi truy cập.",
  },
];

const hemorrhageTypes = [
  { name: "Epidural", color: "#ef4444", risk: "Cao" },
  { name: "Subdural", color: "#f97316", risk: "Cao" },
  { name: "Subarachnoid", color: "#eab308", risk: "Trung bình" },
  { name: "Intraparenchymal", color: "#ef4444", risk: "Cao" },
  { name: "Intraventricular", color: "#f97316", risk: "Trung bình" },
  { name: "Mixed", color: "#dc2626", risk: "Rất cao" },
];

export default function HomePage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-[#04091a] text-[#e8edf5]">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a2e4a] bg-[#04091a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0ea5e9] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 ." />
              </svg>
            </div>
            <span className="font-display text-xl tracking-tight">NeuraScan<span className="text-[#0ea5e9]">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#64849e]">
            <a href="#features" className="hover:text-[#e8edf5] transition-colors">Tính năng</a>
            <a href="#how" className="hover:text-[#e8edf5] transition-colors">Cách hoạt động</a>
            <a href="#stats" className="hover:text-[#e8edf5] transition-colors">Thống kê</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("auth-doctor")} className="px-4 py-2 text-sm text-[#0ea5e9] border border-[#0ea5e9]/30 rounded-md hover:bg-[#0ea5e9]/10 transition-all">Bác sỹ</button>
            <button onClick={() => onNavigate("auth-admin")} className="px-4 py-2 text-sm bg-[#0ea5e9] text-white rounded-md hover:bg-[#0284c7] transition-all">Quản trị</button>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ef4444]/30 bg-[#ef4444]/5 text-[#ef4444] text-xs font-mono-data mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
              AI đang hoạt động — 38 cơ sở kết nối
            </div>
            <h1 className="font-display text-5xl lg:text-6xl leading-[1.1] mb-6">
              Phát hiện<br />
              <span className="text-[#0ea5e9]">xuất huyết não</span><br />
              bằng trí tuệ nhân tạo
            </h1>
            <p className="text-[#94aec8] text-lg leading-relaxed mb-10 max-w-lg">
              Nền tảng chẩn đoán hỗ trợ AI — phân tích CT scan, tra cứu y khoa và quản lý ca bệnh thần kinh học toàn diện cho các bệnh viện Việt Nam.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate("auth-doctor")} className="px-6 py-3 bg-[#0ea5e9] text-white rounded-md text-sm font-medium hover:bg-[#0284c7] transition-all flex items-center gap-2">
                Vào cổng Bác sỹ
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <button onClick={() => onNavigate("auth-admin")} className="px-6 py-3 border border-[#1a2e4a] text-[#94aec8] rounded-md text-sm hover:border-[#0ea5e9]/40 hover:text-[#e8edf5] transition-all">Bảng điều khiển Admin</button>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-xl border border-[#1a2e4a] bg-[#0b1229] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1a2e4a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span className="font-mono-data text-xs text-[#64849e]">CT-20241121-0842 · Nguyễn Văn A · 58 tuổi</span>
                </div>
                <span className="font-mono-data text-xs text-[#0ea5e9]">PHÂN TÍCH</span>
              </div>
              <div className="p-4">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-square max-w-xs mx-auto">
                  <svg viewBox="0 0 280 280" className="w-full h-full">
                    <defs>
                      <radialGradient id="brain" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4a5568" />
                        <stop offset="60%" stopColor="#2d3748" />
                        <stop offset="100%" stopColor="#1a202c" />
                      </radialGradient>
                      <radialGradient id="hemo" cx="50%" cy="40%" r="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.3" />
                      </radialGradient>
                    </defs>
                    <ellipse cx="140" cy="140" rx="115" ry="120" fill="url(#brain)" />
                    <ellipse cx="140" cy="140" rx="85" ry="90" fill="#374151" opacity="0.5" />
                    <path d="M140 60 Q160 100 155 140 Q150 180 140 200 Q130 180 125 140 Q120 100 140 60Z" fill="#4b5563" opacity="0.4" />
                    <ellipse cx="105" cy="115" rx="18" ry="14" fill="url(#hemo)" />
                    <ellipse cx="105" cy="115" rx="10" ry="8" fill="#ef4444" opacity="0.7" />
                    {[0,1,2,3,4,5,6].map(i => (
                      <line key={`v${i}`} x1={40 + i*34} y1="20" x2={40 + i*34} y2="260" stroke="#0ea5e9" strokeWidth="0.2" opacity="0.3" />
                    ))}
                    {[0,1,2,3,4,5,6].map(i => (
                      <line key={`h${i}`} x1="20" y1={40 + i*34} x2="260" y2={40 + i*34} stroke="#0ea5e9" strokeWidth="0.2" opacity="0.3" />
                    ))}
                    <rect x="83" y="97" width="44" height="36" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" rx="2" />
                    <text x="83" y="93" fill="#ef4444" fontSize="8" fontFamily="JetBrains Mono">HEMORRHAGE</text>
                    <path d="M15 15 L30 15 M15 15 L15 30" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M265 15 L250 15 M265 15 L265 30" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M15 265 L30 265 M15 265 L15 250" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M265 265 L250 265 M265 265 L265 250" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-[#04091a] rounded-lg p-3 border border-[#ef4444]/20">
                    <div className="font-mono-data text-xs text-[#64849e] mb-1">PHÁT HIỆN</div>
                    <div className="text-[#ef4444] font-semibold text-sm">Epidural Hemorrhage</div>
                    <div className="font-mono-data text-xs text-[#64849e] mt-1">Tin cậy: 94.2%</div>
                  </div>
                  <div className="bg-[#04091a] rounded-lg p-3 border border-[#1a2e4a]">
                    <div className="font-mono-data text-xs text-[#64849e] mb-1">VỊ TRÍ</div>
                    <div className="text-[#e8edf5] font-semibold text-sm">Thuỳ trán trái</div>
                    <div className="font-mono-data text-xs text-[#64849e] mt-1">Thể tích: ~4.2 mL</div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-lg flex items-center gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} className="w-4 h-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032" />
                  </svg>
                  <span className="text-xs text-[#ef4444]">Khuyến nghị hội chẩn thần kinh khẩn cấp</span>
                </div>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-[#0b1229] border border-[#1a2e4a] rounded-lg px-3 py-2 shadow-xl">
              <div className="font-mono-data text-xs text-[#64849e]">Thời gian phân tích</div>
              <div className="font-display text-2xl text-[#0ea5e9]">6.3s</div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="py-16 border-y border-[#1a2e4a]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1a2e4a]">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#04091a] px-8 py-8 text-center">
              <div className="font-display text-4xl text-[#0ea5e9] mb-1">{s.value}</div>
              <div className="text-sm font-medium text-[#e8edf5] mb-0.5">{s.label}</div>
              <div className="text-xs text-[#64849e]">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="font-mono-data text-xs text-[#0ea5e9] tracking-widest uppercase mb-4">Tính năng hệ thống</div>
            <h2 className="font-display text-4xl max-w-lg">Công nghệ y tế toàn diện trong một nền tảng</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group border border-[#1a2e4a] rounded-xl p-6 hover:border-[#0ea5e9]/30 hover:bg-[#0b1229]/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center mb-4 group-hover:bg-[#0ea5e9]/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#e8edf5] mb-2">{f.title}</h3>
                <p className="text-sm text-[#64849e] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24 px-6 bg-[#0b1229]/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="font-mono-data text-xs text-[#0ea5e9] tracking-widest uppercase mb-4">Phân loại xuất huyết</div>
              <h2 className="font-display text-4xl mb-6">6 loại xuất huyết não được nhận diện</h2>
              <p className="text-[#94aec8] leading-relaxed mb-8">Mô hình AI được huấn luyện trên hơn 200.000 ảnh CT scan lâm sàng, phân loại chính xác theo vị trí và mức độ nguy hiểm — hỗ trợ bác sỹ ưu tiên can thiệp nhanh.</p>
              <div className="space-y-3">
                {hemorrhageTypes.map((h) => (
                  <div key={h.name} className="flex items-center justify-between py-3 border-b border-[#1a2e4a]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                      <span className="font-mono-data text-sm text-[#e8edf5]">{h.name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: h.color, borderColor: `${h.color}40` }}>{h.risk}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-5">
                <div className="font-mono-data text-xs text-[#64849e] mb-3">TRA CỨU Y KHOA · AI SEARCH</div>
                <div className="flex gap-2 mb-4">
                  <input readOnly value="triệu chứng đau đầu dữ dội đột ngột" className="flex-1 bg-[#04091a] border border-[#1a2e4a] rounded-md px-3 py-2 text-sm text-[#e8edf5] font-mono-data focus:outline-none" />
                  <button className="px-3 py-2 bg-[#0ea5e9] rounded-md text-white text-sm">Tìm</button>
                </div>
                <div className="space-y-2">
                  {[
                    { title: "Xuất huyết dưới nhện (SAH)", match: "98%" },
                    { title: "Tăng huyết áp cấp cứu", match: "87%" },
                    { title: "Viêm màng não", match: "71%" },
                  ].map((r) => (
                    <div key={r.title} className="flex items-center justify-between p-3 rounded-lg bg-[#04091a] border border-[#1a2e4a] hover:border-[#0ea5e9]/30 cursor-pointer transition-colors">
                      <span className="text-sm text-[#e8edf5]">{r.title}</span>
                      <span className="font-mono-data text-xs text-[#0ea5e9]">{r.match}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-4">
                  <div className="font-mono-data text-xs text-[#64849e] mb-2">CA MỞ HÔM NAY</div>
                  <div className="font-display text-3xl text-[#e8edf5]">14</div>
                  <div className="text-xs text-[#0ea5e9] mt-1">+3 so với hôm qua</div>
                </div>
                <div className="border border-[#ef4444]/20 rounded-xl bg-[#ef4444]/5 p-4">
                  <div className="font-mono-data text-xs text-[#ef4444]/70 mb-2">KHẨN CẤP</div>
                  <div className="font-display text-3xl text-[#ef4444]">2</div>
                  <div className="text-xs text-[#64849e] mt-1">Cần hội chẩn ngay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-5xl mb-6">Bắt đầu chẩn đoán<br /><span className="text-[#0ea5e9]">thông minh hơn</span></h2>
          <p className="text-[#94aec8] mb-10 text-lg">Chọn vai trò để truy cập nền tảng NeuraScanAI</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => onNavigate("auth-doctor")} className="group px-8 py-4 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-[#0284c7] transition-all flex items-center justify-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 2" />
              </svg>
              Cổng Bác sỹ / Chuyên gia
            </button>
            <button onClick={() => onNavigate("auth-admin")} className="group px-8 py-4 border border-[#1a2e4a] text-[#94aec8] rounded-lg text-sm hover:border-[#0ea5e9]/40 hover:text-[#e8edf5] transition-all flex items-center justify-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m" />
              </svg>
              Bảng điều khiển Quản trị
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1a2e4a] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg">NeuraScan<span className="text-[#0ea5e9]">AI</span></span>
            <span className="text-[#64849e] text-sm">— Nền tảng y tế AI thế hệ mới</span>
          </div>
          <div className="font-mono-data text-xs text-[#64849e]">© 2026 NeuraScanAI · Phiên bản 2.4.1 · HIPAA Compliant</div>
        </div>
      </footer>
    </div>
  );
}
