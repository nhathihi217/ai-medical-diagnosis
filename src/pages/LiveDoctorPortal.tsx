import { useCallback, useEffect, useMemo, useState } from "react";
import type { Patient, User } from "../data/mockData";
import {
  getCaseDetails,
  getCaseHistory,
  getDashboardCases,
  getPatients,
  logout,
  submitCaseReview,
  type DashboardCase,
} from "../services/api";

interface Props { user: User; onBack: () => void }
type Tab = "queue" | "history" | "patients";

const statusLabel = (status: DashboardCase["review_status"]) => status === "confirmed" ? "Đã xác nhận" : status === "rejected" ? "Từ chối" : "Chờ xử lý";
const priorityLabel = (priority: DashboardCase["priority_level"]) => priority === "emergency" ? "Khẩn cấp" : priority === "review" ? "Xem xét" : "Bình thường";
const priorityStyle = (priority: DashboardCase["priority_level"]) => priority === "emergency" ? "text-[#ef4444] border-[#ef4444]/30" : priority === "review" ? "text-[#f97316] border-[#f97316]/30" : "text-[#22c55e] border-[#22c55e]/30";

function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 p-4 text-sm text-[#ef4444]"><span>{message}</span><button onClick={onRetry} className="rounded-md border border-[#ef4444]/40 px-3 py-1.5 hover:bg-[#ef4444]/10">Thử lại</button></div>;
}
function Spinner({ label }: { label: string }) {
  return <div role="status" className="flex items-center gap-3 rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-6 text-sm text-[#94aec8]"><span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9]" />{label}</div>;
}
function formatDate(value: string) {
  if (!value || Number.isNaN(Date.parse(value))) return "—";
  return new Date(value).toLocaleString("vi-VN");
}

export default function LiveDoctorPortal({ user, onBack }: Props) {
  const [tab, setTab] = useState<Tab>("queue");
  const [cases, setCases] = useState<DashboardCase[]>([]);
  const [history, setHistory] = useState<DashboardCase[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientsError, setPatientsError] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState<DashboardCase | null>(null);
  const [detail, setDetail] = useState<DashboardCase | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [note, setNote] = useState("");
  const [caseIdInput, setCaseIdInput] = useState("");

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setCases(await getDashboardCases()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được hàng đợi Ca."); }
    finally { setLoading(false); }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setError("");
    try { setHistory(await getCaseHistory()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được lịch sử Ca."); }
    finally { setHistoryLoading(false); }
  }, []);

  const loadPatientList = useCallback(async () => {
    setPatientsLoading(true);
    setPatientsError("");
    try { setPatients(await getPatients()); }
    catch (cause) { setPatientsError(cause instanceof Error ? cause.message : "Không tải được danh sách bệnh nhân."); }
    finally { setPatientsLoading(false); }
  }, []);

  useEffect(() => { void loadQueue(); }, [loadQueue]);
  useEffect(() => {
    if (tab === "history" && history.length === 0) void loadHistory();
    if (tab === "patients" && patients.length === 0) void loadPatientList();
  }, [tab, history.length, patients.length, loadHistory, loadPatientList]);

  const openCase = useCallback(async (id: number) => {
    setSelectedCase({ id: String(id), apiId: id, created_at: "", priority_level: "none", review_status: "pending", scan_count: 0, scans: [] });
    setDetail(null);
    setDetailError("");
    setReviewError("");
    setReviewNotice("");
    setDetailLoading(true);
    try {
      const fresh = await getCaseDetails(id);
      setDetail(fresh);
      setNote(fresh.doctor_note ?? "");
    } catch (cause) {
      setDetailError(cause instanceof Error ? cause.message : "Không tải được chi tiết Ca.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openById = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = Number(caseIdInput);
    if (Number.isSafeInteger(id) && id > 0) await openCase(id);
  }, [caseIdInput, openCase]);

  const handleReview = useCallback(async (decision: "confirmed" | "rejected") => {
    const id = detail?.apiId ?? selectedCase?.apiId;
    if (!id) return;
    setReviewLoading(true);
    setReviewError("");
    setReviewNotice("");
    try {
      await submitCaseReview(id, decision, note);
      if (decision === "rejected") {
        setReviewNotice("Backend đã trả lời thành công, nhưng hiện tại action Deny chưa lưu trạng thái. Ca chưa được đánh dấu là đã từ chối.");
      } else {
        setReviewNotice("Backend đã lưu ghi chú, nhưng action Approve hiện đặt trạng thái về Done (vẫn nằm trong hàng chờ xử lý). Cần cập nhật backend để hoàn tất trạng thái xác nhận.");
      }
      await Promise.all([loadQueue(), loadHistory()]);
      await openCase(id);
    } catch (cause) {
      setReviewError(cause instanceof Error ? cause.message : "Không gửi được quyết định.");
    } finally {
      setReviewLoading(false);
    }
  }, [detail?.apiId, selectedCase?.apiId, note, loadQueue, loadHistory, openCase]);

  async function handleLogout() {
    try { await logout(); } finally { onBack(); }
  }

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLocaleLowerCase("vi");
    return patients.filter(patient => patient.full_name.toLocaleLowerCase("vi").includes(query) || patient.patient_code.toLowerCase().includes(query));
  }, [patients, patientSearch]);

  if (selectedCase) {
    const current = detail ?? selectedCase;
    return (
      <div className="min-h-screen bg-[#04091a] text-[#e8edf5]">
        <header className="sticky top-0 z-10 border-b border-[#1a2e4a] bg-[#04091a]/95 px-6 py-4">
          <div className="mx-auto flex max-w-5xl items-center gap-4">
            <button onClick={() => { setSelectedCase(null); setDetail(null); }} className="text-sm text-[#0ea5e9]">← Danh sách Ca</button>
            <span className="ml-auto text-sm text-[#94aec8]">{user.full_name}</span>
            <button onClick={() => void handleLogout()} className="text-sm text-[#94aec8] hover:text-white">Đăng xuất</button>
          </div>
        </header>
        <main className="mx-auto max-w-5xl space-y-5 px-6 py-8">
          <div><p className="font-mono-data text-xs text-[#64849e]">CHI TIẾT CA</p><h1 className="mt-1 font-display text-2xl">Ca {current.id}</h1></div>
          {detailLoading && <Spinner label="Đang tải chi tiết Ca…" />}
          {detailError && <ErrorNotice message={detailError} onRetry={() => void openCase(Number(current.id))} />}
          {reviewNotice && <div role="status" className="rounded-xl border border-[#f97316]/30 bg-[#f97316]/5 p-4 text-sm text-[#f97316]">{reviewNotice}</div>}
          {detail && !detailLoading && <>
            <section className="grid gap-4 rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-5 sm:grid-cols-2">
              <div><div className="text-xs text-[#64849e]">BỆNH NHÂN</div><div className="mt-1">{detail.patient_name ?? "Backend không trả thông tin bệnh nhân"}</div></div>
              <div><div className="text-xs text-[#64849e]">THỜI GIAN TẠO</div><div className="mt-1">{formatDate(detail.created_at)}</div></div>
              <div><div className="text-xs text-[#64849e]">MỨC ƯU TIÊN</div><div className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-sm ${priorityStyle(detail.priority_level)}`}>{priorityLabel(detail.priority_level)}</div></div>
              <div><div className="text-xs text-[#64849e]">TRẠNG THÁI HÀNG ĐỢI</div><div className="mt-1">{detail.queueStatus ?? statusLabel(detail.review_status)}</div></div>
              <div className="sm:col-span-2"><div className="text-xs text-[#64849e]">GHI CHÚ</div><div className="mt-1 whitespace-pre-wrap">{detail.doctor_note || "Chưa có ghi chú"}</div></div>
            </section>
            <p className="text-xs text-[#64849e]">Backend CaseDto hiện không trả ID hoặc danh sách ảnh; nhập mã Ca bằng số để tải chi tiết.</p>
            {detail.review_status === "pending" && <section className="space-y-3 rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-5">
              <label className="block text-sm text-[#94aec8]">Ghi chú bác sĩ<textarea value={note} onChange={event => setNote(event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-[#1a2e4a] bg-[#04091a] p-3 text-[#e8edf5]" /></label>
              {reviewError && <p role="alert" className="text-sm text-[#ef4444]">{reviewError}</p>}
              <div className="flex flex-wrap gap-3"><button disabled={reviewLoading} onClick={() => void handleReview("confirmed")} className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm text-white disabled:opacity-50">{reviewLoading ? "Đang gửi…" : "Gửi xác nhận"}</button><button disabled className="cursor-not-allowed rounded-lg bg-[#dc2626]/40 px-4 py-2 text-sm text-white" title="Backend Deny hiện chưa lưu trạng thái">Từ chối (backend chưa hỗ trợ lưu)</button></div>
            </section>}
          </>}
        </main>
      </div>
    );
  }

  const pendingCount = cases.length;
  return (
    <div className="min-h-screen bg-[#04091a] text-[#e8edf5]">
      <header className="sticky top-0 z-10 border-b border-[#1a2e4a] bg-[#04091a]/95 px-6">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4">
          <span className="font-display text-lg">NeuraScan<span className="text-[#0ea5e9]">AI</span></span>
          <span className="rounded-full border border-[#0ea5e9]/20 bg-[#0ea5e9]/10 px-2 py-0.5 text-xs text-[#0ea5e9]">Bác sĩ · {pendingCount} Ca trong hàng đợi</span>
          <span className="ml-auto text-sm text-[#94aec8]">{user.full_name}</span>
          <button onClick={() => void handleLogout()} className="text-sm text-[#94aec8] hover:text-white">Đăng xuất</button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto" aria-label="Điều hướng">
          {([ ["queue", "Hàng đợi"], ["history", "Lịch sử Ca"], ["patients", "Bệnh nhân"] ] as const).map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`border-b-2 px-4 py-3 text-sm ${tab === key ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-[#94aec8] hover:text-white"}`}>{label}</button>)}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {tab === "queue" && <>
          <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl">Ca cần xử lý</h1><p className="mt-1 text-sm text-[#64849e]">Dữ liệu lấy từ Queue/Pending và Queue/ProcDone.</p></div><button onClick={() => void loadQueue()} className="rounded-lg border border-[#1a2e4a] px-4 py-2 text-sm text-[#94aec8]">Làm mới</button></div>
          <form onSubmit={openById} className="flex flex-wrap gap-2 rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-4"><label className="flex-1 text-xs text-[#64849e]">MÃ CA (SỐ)<input inputMode="numeric" value={caseIdInput} onChange={event => setCaseIdInput(event.target.value)} placeholder="Ví dụ: 12" className="mt-1 w-full rounded-lg border border-[#1a2e4a] bg-[#04091a] px-3 py-2 text-sm text-white" /></label><button className="self-end rounded-lg bg-[#0ea5e9] px-4 py-2 text-sm text-white">Mở chi tiết</button></form>
          {error && <ErrorNotice message={error} onRetry={() => void loadQueue()} />}
          {loading ? <Spinner label="Đang tải hàng đợi…" /> : !error && cases.length === 0 ? <div className="rounded-xl border border-[#1a2e4a] p-10 text-center text-[#64849e]">Không có Ca trong hàng đợi.</div> : <div className="grid gap-3 md:grid-cols-2">{cases.map((item, index) => <article key={`${item.queueStatus}-${item.apiId ?? index}`} className="rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-5"><div className="flex items-start justify-between gap-3"><div><div className="font-mono-data text-xs text-[#64849e]">Ca #{item.apiId ?? "Chưa có mã từ API"}</div><h2 className="mt-1 text-lg">{item.patient_name ?? "Chưa có thông tin bệnh nhân"}</h2></div><span className={`rounded-full border px-2 py-1 text-xs ${priorityStyle(item.priority_level)}`}>{priorityLabel(item.priority_level)}</span></div><div className="mt-3 space-y-1 text-sm text-[#94aec8]"><p>Trạng thái API: {item.queueStatus}</p><p>Ngày tạo: {formatDate(item.created_at)}</p><p>{item.scan_count} ảnh (DTO hiện không trả ảnh nên có thể bằng 0)</p></div>{item.apiId ? <button onClick={() => void openCase(item.apiId!)} className="mt-4 text-sm text-[#0ea5e9]">Xem chi tiết →</button> : <p className="mt-4 text-xs text-[#f97316]">DTO hàng đợi thiếu Id; dùng ô nhập mã Ca để mở.</p>}</article>)}</div>}
        </>}
        {tab === "history" && <>
          <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl">Lịch sử Ca</h1><p className="mt-1 text-sm text-[#64849e]">Lấy từ các queue Pending, ProcDone, Confirmed và Denied.</p></div><button onClick={() => void loadHistory()} className="rounded-lg border border-[#1a2e4a] px-4 py-2 text-sm text-[#94aec8]">Làm mới</button></div>
          {error && <ErrorNotice message={error} onRetry={() => void loadHistory()} />}
          {historyLoading ? <Spinner label="Đang tải lịch sử…" /> : <div className="overflow-x-auto rounded-xl border border-[#1a2e4a]"><table className="w-full text-left text-sm"><thead className="bg-[#0b1229] text-xs text-[#64849e]"><tr><th className="p-3">Mã Ca</th><th className="p-3">Bệnh nhân</th><th className="p-3">Trạng thái</th><th className="p-3">Ngày tạo</th><th className="p-3">Ghi chú</th></tr></thead><tbody>{history.map((item, index) => <tr key={`${item.queueStatus}-${item.apiId ?? index}`} className="border-t border-[#1a2e4a]"><td className="p-3">{item.apiId ?? "DTO thiếu ID"}</td><td className="p-3">{item.patient_name ?? "—"}</td><td className="p-3">{item.queueStatus}</td><td className="p-3">{formatDate(item.created_at)}</td><td className="p-3">{item.doctor_note || "—"}</td></tr>)}</tbody></table></div>}
          <p className="text-xs text-[#f97316]">Backend CaseDto thiếu Id, do đó lịch sử có thể không cung cấp khả năng mở chi tiết và không thể khử trùng lặp đáng tin cậy.</p>
        </>}
        {tab === "patients" && <>
          <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-2xl">Danh sách bệnh nhân</h1><p className="mt-1 text-sm text-[#64849e]">Nguồn: GET /api/Patient. CCCD không hiển thị trên giao diện.</p></div><button onClick={() => void loadPatientList()} className="rounded-lg border border-[#1a2e4a] px-4 py-2 text-sm text-[#94aec8]">Làm mới</button></div>
          <input value={patientSearch} onChange={event => setPatientSearch(event.target.value)} placeholder="Tìm theo tên hoặc mã bệnh nhân…" className="w-full rounded-lg border border-[#1a2e4a] bg-[#0b1229] px-4 py-3 text-sm text-white" />
          {patientsError && <ErrorNotice message={patientsError} onRetry={() => void loadPatientList()} />}
          {patientsLoading ? <Spinner label="Đang tải bệnh nhân…" /> : !patientsError && <div className="overflow-x-auto rounded-xl border border-[#1a2e4a]"><table className="w-full text-left text-sm"><thead className="bg-[#0b1229] text-xs text-[#64849e]"><tr><th className="p-3">Mã</th><th className="p-3">Họ tên</th><th className="p-3">Ngày sinh</th></tr></thead><tbody>{filteredPatients.map(patient => <tr key={patient.id} className="border-t border-[#1a2e4a]"><td className="p-3">{patient.patient_code}</td><td className="p-3">{patient.full_name}</td><td className="p-3">{patient.date_of_birth || "—"}</td></tr>)}</tbody></table>{filteredPatients.length === 0 && <p className="p-5 text-center text-[#64849e]">Không tìm thấy bệnh nhân.</p>}</div>}
        </>}
        <p className="text-xs text-[#64849e]">Tạo Ca/upload ảnh chưa thể bật chỉ bằng frontend: backend yêu cầu PatientId, ReviewerId, UploaderId nhưng DTO User không cung cấp ID; Case Create khai báo [FromBody] với IFormFile nên cần backend hỗ trợ multipart/form-data.</p>
      </main>
    </div>
  );
}
