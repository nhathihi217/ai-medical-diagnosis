import { useCallback, useEffect, useState } from "react";
import type { User } from "../data/mockData";
import { getCaseDetails, getDashboardCases, logout, submitCaseReview, type DashboardCase } from "../services/api";

interface Props {
  user: User;
  onBack: () => void;
}

const statusLabel = (status: DashboardCase["review_status"]) => status === "confirmed" ? "Đã xác nhận" : status === "rejected" ? "Từ chối" : "Chờ xử lý";
const priorityLabel = (priority: DashboardCase["priority_level"]) => priority === "emergency" ? "Khẩn cấp" : priority === "review" ? "Xem xét" : "Bình thường";
const priorityStyle = (priority: DashboardCase["priority_level"]) => priority === "emergency" ? "text-[#ef4444] border-[#ef4444]/30" : priority === "review" ? "text-[#f97316] border-[#f97316]/30" : "text-[#22c55e] border-[#22c55e]/30";

function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 p-4 text-sm text-[#ef4444]"><span>{message}</span><button onClick={onRetry} className="rounded-md border border-[#ef4444]/40 px-3 py-1.5 hover:bg-[#ef4444]/10">Thử lại</button></div>;
}

function Spinner({ label }: { label: string }) {
  return <div role="status" className="flex items-center gap-3 rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-6 text-sm text-[#94aec8]"><span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9]" />{label}</div>;
}

export default function LiveDoctorPortal({ user, onBack }: Props) {
  const [cases, setCases] = useState<DashboardCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCase, setSelectedCase] = useState<DashboardCase | null>(null);
  const [detail, setDetail] = useState<DashboardCase | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [note, setNote] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCases(await getDashboardCases());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const openCase = useCallback(async (caseItem: DashboardCase) => {
    setSelectedCase(caseItem);
    setDetail(null);
    setDetailError("");
    setReviewError("");
    setNote(caseItem.doctor_note ?? "");
    if (!caseItem.apiId) {
      setDetailError("Backend chưa trả mã số Ca trong danh sách. Cần bổ sung Id vào CaseDto để tải chi tiết.");
      return;
    }
    setDetailLoading(true);
    try {
      const fresh = await getCaseDetails(caseItem.apiId);
      setDetail(fresh);
      setNote(fresh.doctor_note ?? "");
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : "Không tải được chi tiết Ca.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleReview = useCallback(async (decision: "confirmed" | "rejected") => {
    if (!selectedCase?.apiId) return;
    setReviewLoading(true);
    setReviewError("");
    try {
      await submitCaseReview(selectedCase.apiId, decision, note);
      await loadDashboard();
      setSelectedCase(null);
      setDetail(null);
    } catch (cause) {
      setReviewError(cause instanceof Error ? cause.message : "Không lưu được quyết định.");
    } finally {
      setReviewLoading(false);
    }
  }, [loadDashboard, note, selectedCase]);

  async function handleLogout() {
    try { await logout(); } finally { onBack(); }
  }

  if (selectedCase) {
    const current = detail ?? selectedCase;
    return (
      <div className="min-h-screen bg-[#04091a] text-[#e8edf5]">
        <header className="sticky top-0 z-10 border-b border-[#1a2e4a] bg-[#04091a]/95 px-6 py-4"><div className="mx-auto flex max-w-5xl items-center gap-4"><button onClick={() => { setSelectedCase(null); setDetail(null); }} className="text-sm text-[#0ea5e9]">← Bảng điều khiển</button><span className="ml-auto text-sm text-[#94aec8]">{user.full_name}</span></div></header>
        <main className="mx-auto max-w-5xl space-y-5 px-6 py-8">
          <div><p className="font-mono-data text-xs text-[#64849e]">CHI TIẾT CA</p><h1 className="mt-1 font-display text-2xl">Ca {current.id || "—"}</h1></div>
          {detailLoading && <Spinner label="Đang tải chi tiết Ca…" />}
          {detailError && <ErrorNotice message={detailError} onRetry={() => void openCase(selectedCase)} />}
          {detail && !detailLoading && <>
            <section className="grid gap-4 rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-5 sm:grid-cols-2">
              <div><div className="text-xs text-[#64849e]">BỆNH NHÂN</div><div className="mt-1">{detail.patient_name ?? "Chưa có thông tin"}</div></div>
              <div><div className="text-xs text-[#64849e]">THỜI GIAN TẠO</div><div className="mt-1">{detail.created_at ? new Date(detail.created_at).toLocaleString("vi-VN") : "—"}</div></div>
              <div><div className="text-xs text-[#64849e]">MỨC ƯU TIÊN</div><div className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-sm ${priorityStyle(detail.priority_level)}`}>{priorityLabel(detail.priority_level)}</div></div>
              <div><div className="text-xs text-[#64849e]">TRẠNG THÁI</div><div className="mt-1">{statusLabel(detail.review_status)}</div></div>
              <div className="sm:col-span-2"><div className="text-xs text-[#64849e]">GHI CHÚ</div><div className="mt-1 whitespace-pre-wrap">{detail.doctor_note || "Chưa có ghi chú"}</div></div>
            </section>
            {detail.scans.length > 0 && <section className="rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-5"><h2 className="mb-3 font-semibold">Ảnh / kết quả ({detail.scans.length})</h2><ul className="space-y-2">{detail.scans.map(scan => <li key={scan.id} className="rounded-lg border border-[#1a2e4a] p-3 text-sm">{scan.file_path || scan.id}</li>)}</ul></section>}
            {detail.review_status === "pending" && <section className="space-y-3 rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-5"><label className="block text-sm text-[#94aec8]">Ghi chú bác sĩ<textarea value={note} onChange={event => setNote(event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-[#1a2e4a] bg-[#04091a] p-3 text-[#e8edf5]" /></label>{reviewError && <p role="alert" className="text-sm text-[#ef4444]">{reviewError}</p>}<div className="flex flex-wrap gap-3"><button disabled={reviewLoading} onClick={() => void handleReview("confirmed")} className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm text-white disabled:opacity-50">{reviewLoading ? "Đang lưu…" : "Xác nhận Ca"}</button><button disabled={reviewLoading} onClick={() => void handleReview("rejected")} className="rounded-lg bg-[#dc2626] px-4 py-2 text-sm text-white disabled:opacity-50">Từ chối Ca</button></div></section>}
          </>}
        </main>
      </div>
    );
  }

  const pendingCount = cases.filter(item => item.review_status === "pending").length;
  return (
    <div className="min-h-screen bg-[#04091a] text-[#e8edf5]">
      <header className="sticky top-0 z-10 border-b border-[#1a2e4a] bg-[#04091a]/95 px-6"><div className="mx-auto flex h-16 max-w-7xl items-center gap-4"><span className="font-display text-lg">NeuraScan<span className="text-[#0ea5e9]">AI</span></span><span className="rounded-full border border-[#0ea5e9]/20 bg-[#0ea5e9]/10 px-2 py-1 text-xs text-[#0ea5e9]">Bác sỹ</span><div className="ml-auto text-right"><div className="text-sm">{user.full_name}</div><button onClick={() => void handleLogout()} className="text-xs text-[#64849e] hover:text-[#e8edf5]">Đăng xuất</button></div></div></header>
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono-data text-xs text-[#64849e]">DASHBOARD · API TRỰC TIẾP</p><h1 className="mt-1 font-display text-2xl">Ca chờ xử lý</h1></div><div className="flex items-center gap-3"><span className="text-sm text-[#94aec8]">{loading ? "Đang tải…" : `${pendingCount} Ca`}</span><button onClick={() => void loadDashboard()} disabled={loading} className="rounded-lg border border-[#1a2e4a] px-3 py-2 text-sm text-[#94aec8] disabled:opacity-50">Làm mới</button></div></div>
        {error && <ErrorNotice message={error} onRetry={() => void loadDashboard()} />}
        {loading && <Spinner label="Đang tải danh sách Ca từ máy chủ…" />}
        {!loading && !error && cases.length === 0 && <div className="rounded-xl border border-[#1a2e4a] p-12 text-center"><h2 className="font-display text-xl">Chưa có Ca trong hàng đợi</h2><p className="mt-2 text-sm text-[#64849e]">Danh sách được tải trực tiếp từ API.</p></div>}
        {!loading && cases.length > 0 && <div className="space-y-3">{cases.map((item, index) => <article key={item.apiId ?? `${item.created_at}-${index}`} className="rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><span className="font-mono-data text-sm font-semibold text-[#e8edf5]">{item.id ? `Ca ${item.id}` : `Ca #${index + 1}`}</span><span className={`rounded-full border px-2 py-0.5 text-xs ${priorityStyle(item.priority_level)}`}>{priorityLabel(item.priority_level)}</span><span className="text-xs text-[#f97316]">{statusLabel(item.review_status)}</span></div><div className="mt-2 flex flex-wrap gap-4 text-sm text-[#94aec8]"><span>{item.patient_name ?? "Chưa có thông tin bệnh nhân"}</span><span>{item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : "—"}</span><span>{item.scan_count} ảnh</span></div></div>{item.apiId ? <button onClick={() => void openCase(item)} className="rounded-lg bg-[#0ea5e9] px-4 py-2 text-sm text-white hover:bg-[#0284c7]">Xem chi tiết</button> : <span className="max-w-xs text-right text-xs text-[#f97316]">Thiếu mã Ca từ API; chưa thể mở chi tiết.</span>}</div></article>)}</div>}
      </main>
    </div>
  );
}
