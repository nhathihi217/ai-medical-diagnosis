import type { Page } from "../App";

interface Props {
  onNavigate: (page: Page) => void;
}

const features = [
  "Phân tích CT Scan AI",
  "Tra cứu y khoa thông minh",
  "Quản lý hồ sơ bệnh án",
  "Báo cáo và phân tích",
];

export default function HomePage({ onNavigate }: Props) {
  return (
    <main className="min-h-screen bg-[#04091a] text-[#e8edf5]">
      <nav className="flex items-center justify-between border-b border-[#1a2e4a] px-6 py-4">
        <span className="text-xl font-semibold">NeuraScan<span className="text-[#0ea5e9]">AI</span></span>
        <div className="flex gap-3">
          <button onClick={() => onNavigate("auth-doctor")} className="rounded-md border border-[#0ea5e9]/40 px-4 py-2 text-[#0ea5e9]">Cổng bác sĩ</button>
          <button onClick={() => onNavigate("auth-admin")} className="rounded-md bg-[#0ea5e9] px-4 py-2 text-white">Quản trị</button>
        </div>
      </nav>
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="mb-4 text-sm uppercase tracking-widest text-[#0ea5e9]">Nền tảng hỗ trợ chẩn đoán</p>
        <h1 className="mb-6 text-4xl font-bold md:text-6xl">Chăm sóc thần kinh<br />thông minh hơn</h1>
        <p className="mx-auto mb-8 max-w-2xl text-[#94aec8]">Phân tích hình ảnh CT, tra cứu thông tin y khoa và quản lý ca bệnh trên một nền tảng.</p>
        <button onClick={() => onNavigate("auth-doctor")} className="rounded-md bg-[#0ea5e9] px-6 py-3 font-medium text-white">Bắt đầu sử dụng</button>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-20 md:grid-cols-2">
        {features.map((feature) => <div key={feature} className="rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-6">{feature}</div>)}
      </section>
    </main>
  );
}
