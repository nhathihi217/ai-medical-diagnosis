import type { Page } from "../App";

interface Props {
  onNavigate: (page: Page) => void;
}

function Mark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="13" fill="currentColor" />
      <path d="M20 9v22M9 20h22" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="20" r="7" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none">
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const features = [
  { number: "01", icon: "◉", title: "Phân tích CT hỗ trợ AI", copy: "Tổ chức ảnh chụp và kết quả phân tích trong cùng một quy trình để đội ngũ y tế dễ dàng xem xét.", tone: "mint" },
  { number: "02", icon: "⌕", title: "Tra cứu kiến thức y khoa", copy: "Tìm kiếm thông tin tham khảo có cấu trúc, hỗ trợ bác sĩ trong quá trình đánh giá lâm sàng.", tone: "blue" },
  { number: "03", icon: "▤", title: "Hồ sơ ca bệnh tập trung", copy: "Theo dõi thông tin bệnh nhân, lịch sử ca và ghi chú chuyên môn trên một giao diện thống nhất.", tone: "peach" },
  { number: "04", icon: "↗", title: "Theo dõi và báo cáo", copy: "Nắm bắt trạng thái xử lý, mức độ ưu tiên và hoạt động của hệ thống một cách trực quan.", tone: "lavender" },
];

const steps = [
  { title: "Tiếp nhận hình ảnh", detail: "Tập hợp dữ liệu CT và thông tin ca bệnh." },
  { title: "AI phân tích hỗ trợ", detail: "Xem kết quả gợi ý trong ngữ cảnh rõ ràng." },
  { title: "Bác sĩ đánh giá", detail: "Chuyên gia xem xét, xác nhận và ghi chú." },
];

export default function HomePage({ onNavigate }: Props) {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <a className="brand" href="#home" aria-label="NeuraScan AI - Trang chủ">
          <Mark className="brand-mark" />
          <span>NeuraScan<span className="brand-accent">AI</span></span>
        </a>
        <nav className="landing-nav" aria-label="Điều hướng chính">
          <a href="#features">Tính năng</a>
          <a href="#workflow">Quy trình</a>
          <a href="#about">Về nền tảng</a>
        </nav>
        <div className="header-actions">
          <button className="button button-quiet header-login" onClick={() => onNavigate("auth-doctor")}>Đăng nhập</button>
          <button className="button button-primary header-cta" onClick={() => onNavigate("auth-doctor")}>
            Cổng bác sĩ <Arrow />
          </button>
          <button className="button button-admin header-admin" onClick={() => onNavigate("auth-admin")}>
            Cổng quản trị
          </button>
        </div>
      </header>

      <section className="hero-section" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> NỀN TẢNG HỖ TRỢ CHẨN ĐOÁN THẦN KINH</div>
          <h1>Thêm góc nhìn.<br /><span>Vững tâm</span> chăm sóc.</h1>
          <p className="hero-description">NeuraScan AI hỗ trợ đội ngũ y tế tổ chức ca bệnh, tham khảo phân tích hình ảnh CT và theo dõi quy trình đánh giá — trong một không gian làm việc rõ ràng, tập trung.</p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={() => onNavigate("auth-doctor")}>Khám phá cổng bác sĩ <Arrow /></button>
            <a className="text-link" href="#features">Tìm hiểu nền tảng <span>↓</span></a>
          </div>
          <div className="hero-note"><span className="note-check">✓</span> Công cụ hỗ trợ chuyên môn, không thay thế quyết định của bác sĩ</div>
        </div>

        <div className="hero-visual" aria-label="Minh họa bảng theo dõi ca bệnh">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="scan-card">
            <div className="scan-topline"><span><i className="live-dot" /> MINH HỌA PHÂN TÍCH</span><span className="scan-menu">•••</span></div>
            <div className="scan-image">
              <div className="scan-crosshair crosshair-one" />
              <div className="scan-crosshair crosshair-two" />
              <div className="brain-shape"><div className="brain-core" /><div className="brain-highlight" /></div>
              <span className="scan-label label-top">AXIAL · 04</span>
              <span className="scan-label label-bottom">CT BRAIN / DEMO</span>
              <div className="scan-scale"><i /><i /><i /><i /><i /></div>
            </div>
            <div className="scan-caption"><div><span className="caption-kicker">TRẠNG THÁI CA</span><strong>Chờ bác sĩ đánh giá</strong></div><span className="review-badge"><i /> ĐANG XEM XÉT</span></div>
          </div>
          <div className="floating-card float-status"><span className="float-icon">✓</span><div><strong>Quy trình rõ ràng</strong><small>Bác sĩ giữ vai trò quyết định</small></div></div>
          <div className="floating-card float-insight"><span className="insight-spark">✳</span><div><small>KHÔNG GIAN LÀM VIỆC</small><strong>Tập trung · Có tổ chức</strong></div></div>
          <div className="visual-stamp">NEURO<br />CARE<br /><span>01 — 04</span></div>
        </div>
        <div className="hero-index"><span>01</span><i /> HỖ TRỢ LÂM SÀNG</div>
      </section>

      <section className="trust-strip" aria-label="Định hướng sản phẩm">
        <p>ĐƯỢC THIẾT KẾ CHO QUY TRÌNH CHĂM SÓC THẦN KINH</p>
        <div className="trust-items"><span><i>✳</i> Tập trung vào bác sĩ</span><span><i>⌘</i> Thông tin có cấu trúc</span><span><i>↗</i> Theo dõi liền mạch</span></div>
      </section>

      <section className="features-section section-wrap" id="features">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-dot" /> MỌI THỨ TRONG MỘT NƠI</div><h2>Ít phân tán hơn.<br /><span>Nhiều tập trung hơn.</span></h2></div>
          <p>Từ lúc tiếp nhận hình ảnh đến khi hoàn tất đánh giá, các công cụ được sắp xếp để đội ngũ dễ theo dõi công việc và thông tin cần thiết.</p>
        </div>
        <div className="feature-grid">
          {features.map(feature => (
            <article className="feature-card" key={feature.number}>
              <div className="feature-card-top"><span className={`feature-icon ${feature.tone}`}>{feature.icon}</span><span className="feature-number">{feature.number} / 04</span></div>
              <h3>{feature.title}</h3><p>{feature.copy}</p>
              <a href="#workflow" aria-label={`Tìm hiểu ${feature.title}`} className="feature-arrow"><Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="workflow-inner">
          <div className="workflow-intro"><div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> HỖ TRỢ TỪ ĐẦU ĐẾN CUỐI</div><h2>Một quy trình.<br /><span>Một góc nhìn xuyên suốt.</span></h2><p>Từng bước được kết nối để thông tin luôn rõ ràng và đội ngũ y tế chủ động phối hợp.</p></div>
          <div className="workflow-steps">{steps.map((step, index) => <div className="workflow-step" key={step.title}><div className="step-marker"><span>0{index + 1}</span>{index < steps.length - 1 && <i />}</div><div><h3>{step.title}</h3><p>{step.detail}</p></div></div>)}</div>
          <div className="workflow-decoration">N<span>+</span></div>
        </div>
      </section>

      <section className="closing-section section-wrap" id="about">
        <div className="closing-card"><div className="closing-sun" /><div className="closing-content"><div className="eyebrow"><span className="eyebrow-dot" /> NEURASCAN AI</div><h2>Công nghệ đồng hành.<br /><span>Chuyên môn dẫn đường.</span></h2><p>Một nền tảng hỗ trợ đội ngũ y tế làm việc tập trung, có tổ chức và luôn đặt quyết định chuyên môn ở trung tâm.</p><button className="button button-primary" onClick={() => onNavigate("auth-doctor")}>Vào cổng bác sĩ <Arrow /></button></div></div>
      </section>

      <footer className="landing-footer"><a className="brand footer-brand" href="#home"><Mark className="brand-mark" /><span>NeuraScan<span className="brand-accent">AI</span></span></a><p>Hỗ trợ chuyên môn thần kinh · Công nghệ vì chăm sóc tốt hơn</p><span>© 2026 NeuraScan AI</span></footer>
    </main>
  );
}
