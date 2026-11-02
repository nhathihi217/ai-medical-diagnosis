import { useState } from "react";
import {
  Case, MOCK_CASES, MOCK_ALERTS, MOCK_PATIENTS, MOCK_MEDICAL_RECORDS, MOCK_CLINICAL_NOTES, MOCK_RAG_LOGS,
  Patient, MedicalRecord, ClinicalNote, RAGQueryLog,
  PriorityLevel, ReviewStatus, User,
} from "../data/mockData";
import CaseDetail from "../components/CaseDetail";
import CreateCase from "../components/CreateCase";

interface Props {
  user: User;
  onBack: () => void;
}

type Tab = "dashboard" | "create" | "history" | "records" | "rag";

const priorityLabel = (p: PriorityLevel) =>
  p === "emergency" ? "Khẩn cấp" : p === "review" ? "Xem xét" : "Bình thường";

const priorityClass = (p: PriorityLevel) =>
  p === "emergency"
    ? "text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/5"
    : p === "review"
    ? "text-[#f97316] border-[#f97316]/30 bg-[#f97316]/5"
    : "text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/5";

const reviewLabel = (r: ReviewStatus) =>
  r === "pending" ? "Chờ xác nhận" : r === "confirmed" ? "Đã xác nhận" : "Từ chối";

const reviewClass = (r: ReviewStatus) =>
  r === "pending" ? "text-[#f97316]" : r === "confirmed" ? "text-[#22c55e]" : "text-[#64849e]";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN");
}

function age(dob: string) {
  return new Date().getFullYear() - new Date(dob).getFullYear();
}

const SAMPLE_QUERIES = [
  "Phác đồ điều trị xuất huyết ngoài màng cứng",
  "Triệu chứng phân biệt SAH và migraine",
  "Liều Manitol trong tăng áp lực nội sọ",
  "Chỉ định phẫu thuật trong xuất huyết não",
];

const MOCK_RAG_ANSWERS: Record<string, { answer: string; sources: string[] }> = {
  default: {
    answer: "Dựa trên cơ sở dữ liệu y khoa, đây là thông tin liên quan đến câu hỏi của bạn. Vui lòng tham khảo phác đồ điều trị của bệnh viện và ý kiến chuyên môn.",
    sources: ["Phác đồ điều trị Thần kinh học — BV Bạch Mai 2023", "UpToDate: Intracerebral hemorrhage — acute treatment"],
  },
  "xuất huyết ngoài màng cứng": {
    answer: "Xuất huyết ngoài màng cứng (EDH) là cấp cứu thần kinh ngoại khoa. Phác đồ ưu tiên:\n1. ABC và ổn định huyết động\n2. CT scan não ngay\n3. Phẫu thuật giải áp nếu có dấu hiệu chèn ép",
    sources: ["Phác đồ điều trị Thần kinh học — BV Bạch Mai 2023", "Neurosurgery Emergency Guidelines 2022", "UpToDate: Epidural hematoma — management"],
  },
  SAH: {
    answer: "Phân biệt SAH và migraine:\n• SAH: Đau đầu 'sét đánh' đột ngột, cứng gáy, sợ ánh sáng, nôn mửa\n• Migraine: đau đầu tiến triển, có tiền triệu, không có cứng gáy rõ",
    sources: ["UpToDate: Subarachnoid hemorrhage — clinical manifestations", "AHA/ASA Guidelines 2023"],
  },
  Manitol: {
    answer: "Liều Manitol trong tăng áp lực nội sọ:\n• Liều tấn công: 0.25–1 g/kg\n• Liều duy trì: 0.25 g/kg mỗi 6 giờ\n• Theo dõi điện giải và huyết áp",
    sources: ["Neurocritical Care Society Guidelines", "Phác đồ ICU Thần kinh — Bạch Mai 2023"],
  },
  "phẫu thuật": {
    answer: "Chỉ định phẫu thuật xuất huyết não:\n• Tụ máu tiểu não >3cm\n• EDH >30ml\n• Midline shift >5mm\n• Dấu hiệu chèn ép não",
    sources: ["AHA/ASA ICH Guidelines 2022", "NICE Guideline NG128"],
  },
};

function getAnswer(query: string) {
  const q = query.toLowerCase();
  if (q.includes("ngoài màng cứng") || q.includes("epidural")) return MOCK_RAG_ANSWERS["xuất huyết ngoài màng cứng"];
  if (q.includes("sah") || q.includes("migraine") || q.includes("phân biệt")) return MOCK_RAG_ANSWERS["SAH"];
  if (q.includes("manitol") || q.includes("áp lực nội sọ")) return MOCK_RAG_ANSWERS["Manitol"];
  if (q.includes("phẫu thuật") || q.includes("chỉ định")) return MOCK_RAG_ANSWERS["phẫu thuật"];
  return MOCK_RAG_ANSWERS["default"];
}

function RAGPanel({ userId }: { userId: string }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{ q: string; answer: string; sources: string[] } | null>(null);
  const [logs, setLogs] = useState<RAGQueryLog[]>(MOCK_RAG_LOGS.filter(l => l.user_id === userId));

  function handleSearch(q: string) {
    if (!q.trim()) return;
    setSearching(true);
    setQuery(q);
    setTimeout(() => {
      const ans = getAnswer(q);
      const newLog: RAGQueryLog = {
        id: `rag-${Date.now()}`,
        user_id: userId,
        query_text: q,
        answer_text: ans.answer,
        retrieved_doc_ids: ans.sources,
        created_at: new Date().toISOString(),
      };
      setLogs(prev => [newLog, ...prev]);
      setResult({ q, answer: ans.answer, sources: ans.sources });
      setSearching(false);
    }, 900);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl mb-1">Tra cứu Y khoa (RAG)</h2>
        <p className="text-xs text-[#64849e]">Module B — Embedding + Vector DB + LLM · Nguồn: giáo trình, guideline, paper y khoa</p>
      </div>

      <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-5">
        <div className="flex gap-3 mb-4">
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch(query)} placeholder="Nhập câu hỏi lâm sàng, triệu chứng hoặc tên bệnh…" className="flex-1 bg-[#04091a] border border-[#1a2e4a] rounded-lg px-4 py-2.5 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none focus:border-[#0ea5e9]/50 transition-colors" />
          <button onClick={() => handleSearch(query)} disabled={searching || !query.trim()} className="px-5 py-2.5 bg-[#0ea5e9] text-white text-sm rounded-lg hover:bg-[#0284c7] transition-colors disabled:opacity-50">{searching ? "Đang tìm…" : "Tra cứu"}</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map(q => (
            <button key={q} onClick={() => { setQuery(q); handleSearch(q); }} className="text-xs px-3 py-1.5 border border-[#1a2e4a] text-[#64849e] rounded-full hover:border-[#0ea5e9]/30 hover:text-[#94aec8] transition-colors">{q}</button>
          ))}
        </div>
      </div>

      {searching && (
        <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-6 flex items-center gap-3">
          <svg className="animate-spin w-5 h-5 text-[#0ea5e9]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-[#64849e]">Đang embedding câu hỏi → truy vấn vector DB → sinh câu trả lời…</span>
        </div>
      )}

      {!searching && result && (
        <div className="border border-[#0ea5e9]/20 rounded-xl bg-[#0b1229] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1a2e4a] flex items-center justify-between">
            <div className="font-mono-data text-xs text-[#0ea5e9]">KẾT QUẢ TRA CỨU · AI ANSWER</div>
            <div className="font-mono-data text-xs text-[#64849e]">{result.sources.length} nguồn trích dẫn</div>
          </div>
          <div className="p-5">
            <div className="text-xs text-[#64849e] mb-2 font-mono-data">CÂU HỎI</div>
            <div className="text-sm text-[#94aec8] mb-4 italic">"{result.q}"</div>
            <div className="text-xs text-[#64849e] mb-2 font-mono-data">TRẢ LỜI</div>
            <div className="text-sm text-[#e8edf5] leading-relaxed whitespace-pre-line mb-5">{result.answer}</div>
            <div className="border-t border-[#1a2e4a] pt-4">
              <div className="text-xs text-[#64849e] mb-2 font-mono-data">NGUỒN TRÍCH DẪN</div>
              <div className="space-y-1.5">
                {result.sources.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#94aec8]">
                    <span className="font-mono-data text-[#0ea5e9] shrink-0">[{i + 1}]</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="font-mono-data text-xs text-[#64849e] mb-3">LỊCH SỬ TRA CỨU (F14)</div>
        {logs.length === 0 ? (
          <div className="text-sm text-[#64849e] text-center py-8">Chưa có lịch sử tra cứu</div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} onClick={() => { setQuery(log.query_text); setResult({ q: log.query_text, answer: log.answer_text, sources: log.retrieved_doc_ids }); }} className="border border-[#1a2e4a] rounded-xl p-4 cursor-pointer hover:border-[#0ea5e9]/30 hover:bg-[#0b1229] transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#e8edf5] mb-1 truncate">{log.query_text}</div>
                    <div className="text-xs text-[#64849e] line-clamp-2">{log.answer_text.slice(0, 120)}…</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-data text-xs text-[#64849e]">{formatDate(log.created_at)}</div>
                    {log.linked_detection_id && <div className="text-xs text-[#0ea5e9] mt-0.5">⟲ Liên kết ca</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecordsPanel() {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [records, setRecords] = useState<MedicalRecord[]>(MOCK_MEDICAL_RECORDS);
  const [notes, setNotes] = useState<ClinicalNote[]>(MOCK_CLINICAL_NOTES);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ note_type: "examination" as ClinicalNote["note_type"], content: "" });
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState({ cccd: "", full_name: "", dob: "", gender: "male" as "male" | "female", symptoms: "", history: "", allergies: "" });
  const [cccdResult, setCccdResult] = useState<Patient | null | "not_found">(null);

  const filteredPatients = patients.filter(p => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.patient_code.toLowerCase().includes(search.toLowerCase()));
  const patientRecords = records.filter(r => r.patient_id === selectedPatient?.id);
  const recordNotes = notes.filter(n => n.medical_record_id === selectedRecord?.id);

  function lookupCCCD() {
    const hashed = newRecordForm.cccd;
    const found = patients.find(p => p.patient_code.includes(hashed.slice(-4)));
    setCccdResult(found ?? "not_found");
    if (found) {
      setNewRecordForm(prev => ({ ...prev, full_name: found.full_name, dob: found.date_of_birth, gender: found.gender }));
    }
  }

  function handleAddNote() {
    if (!newNote.content || !selectedRecord) return;
    const note: ClinicalNote = {
      id: `cn-${Date.now()}`,
      medical_record_id: selectedRecord.id,
      author_id: "u1",
      note_type: newNote.note_type,
      content: newNote.content,
      created_at: new Date().toISOString(),
    };
    setNotes(prev => [...prev, note]);
    setNewNote({ note_type: "examination", content: "" });
    setShowAddNote(false);
  }

  function handleCreateRecord() {
    let patient = cccdResult && cccdResult !== "not_found" ? cccdResult : null;
    if (!patient) {
      patient = {
        id: `p-${Date.now()}`,
        patient_code: `BN-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-00${patients.length + 1}`,
        full_name: newRecordForm.full_name,
        date_of_birth: newRecordForm.dob,
        gender: newRecordForm.gender,
        created_at: new Date().toISOString().slice(0, 10),
      };
      setPatients(prev => [...prev, patient!]);
    }
    const record: MedicalRecord = {
      id: `mr-${Date.now()}`,
      patient_id: patient.id,
      medical_history: newRecordForm.history,
      allergies: newRecordForm.allergies,
      current_symptoms: newRecordForm.symptoms,
      admission_date: new Date().toISOString(),
      attending_doctor_id: "u1",
      status: "admitted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRecords(prev => [...prev, record]);
    setSelectedPatient(patient);
    setSelectedRecord(record);
    setShowNewRecord(false);
    setCccdResult(null);
    setNewRecordForm({ cccd: "", full_name: "", dob: "", gender: "male", symptoms: "", history: "", allergies: "" });
  }

  const noteTypeLabel = (t: ClinicalNote["note_type"]) =>
    t === "examination" ? "Khám" : t === "treatment" ? "Điều trị" : "Kê đơn";

  const noteTypeColor = (t: ClinicalNote["note_type"]) =>
    t === "examination" ? "text-[#0ea5e9]" : t === "treatment" ? "text-[#22c55e]" : "text-[#f97316]";

  if (selectedRecord && selectedPatient) {
    const patient = patients.find(p => p.id === selectedRecord.patient_id) ?? selectedPatient;
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-xs text-[#64849e]">
          <button onClick={() => { setSelectedRecord(null); }} className="hover:text-[#e8edf5] transition-colors">{patient.full_name}</button>
          <span>/</span>
          <span className="text-[#94aec8]">Hồ sơ {selectedRecord.id}</span>
        </div>

        <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono-data text-xs text-[#64849e] mb-1">{selectedRecord.id}</div>
              <div className="font-display text-2xl mb-1">{patient.full_name}</div>
              <div className="flex flex-wrap gap-3 text-sm text-[#94aec8]">
                <span>{age(patient.date_of_birth)} tuổi · {patient.gender === "male" ? "Nam" : "Nữ"}</span>
                <span className="font-mono-data text-xs">{patient.patient_code}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select value={selectedRecord.status} onChange={e => setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, status: e.target.value as MedicalRecord["status"] } : r))} className="bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-1.5 text-sm text-[#94aec8] focus:outline-none">
                <option value="admitted">Đang điều trị</option>
                <option value="discharged">Đã xuất viện</option>
                <option value="transferred">Chuyển viện</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#1a2e4a]">
            <div><div className="font-mono-data text-xs text-[#64849e] mb-1">TIỀN SỬ</div><div className="text-sm text-[#94aec8]">{selectedRecord.medical_history}</div></div>
            <div><div className="font-mono-data text-xs text-[#64849e] mb-1">DỊ ỨNG</div><div className="text-sm text-[#ef4444]">{selectedRecord.allergies}</div></div>
            <div><div className="font-mono-data text-xs text-[#64849e] mb-1">TRIỆU CHỨNG NHẬP VIỆN</div><div className="text-sm text-[#94aec8]">{selectedRecord.current_symptoms}</div></div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono-data text-xs text-[#64849e]">DIỄN BIẾN ĐIỀU TRỊ (F21) · {recordNotes.length} ghi chú</div>
            <button onClick={() => setShowAddNote(true)} className="px-3 py-1.5 bg-[#0ea5e9] text-white text-xs rounded-lg hover:bg-[#0284c7] transition-colors">+ Thêm ghi chú</button>
          </div>
          {recordNotes.length === 0 ? (
            <div className="border border-[#1a2e4a] rounded-xl p-8 text-center text-sm text-[#64849e]">Chưa có ghi chú</div>
          ) : (
            <div className="space-y-3">
              {recordNotes.map(note => (
                <div key={note.id} className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono-data text-xs font-bold ${noteTypeColor(note.note_type)}`}>[{noteTypeLabel(note.note_type).toUpperCase()}]</span>
                    <span className="font-mono-data text-xs text-[#64849e]">{formatDate(note.created_at)} {new Date(note.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="text-sm text-[#e8edf5] whitespace-pre-line leading-relaxed">{note.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAddNote && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-[#0b1229] border border-[#1a2e4a] rounded-xl p-6 max-w-lg w-full">
              <div className="font-display text-xl mb-4">Thêm ghi chú diễn biến</div>
              <div className="space-y-3">
                <div>
                  <label className="font-mono-data text-xs text-[#64849e] mb-1 block">LOẠI GHI CHÚ</label>
                  <select value={newNote.note_type} onChange={e => setNewNote(prev => ({ ...prev, note_type: e.target.value as ClinicalNote["note_type"] }))} className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#94aec8] focus:outline-none">
                    <option value="examination">Khám lâm sàng</option>
                    <option value="treatment">Điều trị</option>
                    <option value="prescription">Kê đơn thuốc</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono-data text-xs text-[#64849e] mb-1 block">NỘI DUNG</label>
                  <textarea value={newNote.content} onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))} rows={5} placeholder="Nhập nội dung ghi chú…" className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none focus:border-[#0ea5e9]/50 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAddNote} className="flex-1 py-2.5 bg-[#0ea5e9] text-white text-sm rounded-lg hover:bg-[#0284c7] transition-colors">Lưu ghi chú</button>
                <button onClick={() => setShowAddNote(false)} className="flex-1 py-2.5 border border-[#1a2e4a] text-[#64849e] text-sm rounded-lg hover:text-[#e8edf5] transition-colors">Huỷ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedPatient(null)} className="text-[#64849e] hover:text-[#e8edf5] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <div className="font-display text-2xl">{selectedPatient.full_name}</div>
            <div className="text-xs text-[#64849e]">{selectedPatient.patient_code} · {age(selectedPatient.date_of_birth)} tuổi · {selectedPatient.gender === "male" ? "Nam" : "Nữ"}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-mono-data text-xs text-[#64849e]">CÁC ĐỢT ĐIỀU TRỊ (F22) · {patientRecords.length} hồ sơ</div>
          <button onClick={() => {
            const r: MedicalRecord = {
              id: `mr-${Date.now()}`,
              patient_id: selectedPatient.id,
              medical_history: "",
              allergies: "",
              current_symptoms: "",
              admission_date: new Date().toISOString(),
              attending_doctor_id: "u1",
              status: "admitted",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setRecords(prev => [r, ...prev]);
            setSelectedRecord(r);
          }} className="px-3 py-1.5 bg-[#0ea5e9] text-white text-xs rounded-lg hover:bg-[#0284c7] transition-colors">+ Đợt điều trị mới</button>
        </div>

        {patientRecords.length === 0 ? (
          <div className="border border-[#1a2e4a] rounded-xl p-8 text-center text-sm text-[#64849e]">Không có hồ sơ bệnh án</div>
        ) : (
          <div className="space-y-3">
            {patientRecords.map(r => {
              const noteCount = notes.filter(n => n.medical_record_id === r.id).length;
              return (
                <div key={r.id} onClick={() => setSelectedRecord(r)} className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-4 cursor-pointer hover:border-[#0ea5e9]/30 transition-all group">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono-data text-xs text-[#0ea5e9] mb-1">{r.id}</div>
                      <div className="text-sm text-[#e8edf5] mb-1">{r.current_symptoms.slice(0, 80)}…</div>
                      <div className="text-xs text-[#64849e]">Nhập viện: {formatDate(r.admission_date)} · {noteCount} ghi chú</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${r.status === "admitted" ? "text-[#0ea5e9] border-[#0ea5e9]/30 bg-[#0ea5e9]/5" : r.status === "discharged" ? "text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/5" : "text-[#f97316] border-[#f97316]/30 bg-[#f97316]/5"}`}>
                        {r.status === "admitted" ? "Đang điều trị" : r.status === "discharged" ? "Đã xuất viện" : "Chuyển viện"}
                      </span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[#64849e] group-hover:text-[#0ea5e9] transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Hồ sơ bệnh án (F19–F23)</h2>
          <p className="text-xs text-[#64849e] mt-0.5">Tra cứu bệnh nhân · Tạo đợt điều trị · Ghi chú diễn biến</p>
        </div>
        <button onClick={() => setShowNewRecord(true)} className="px-4 py-2 bg-[#0ea5e9] text-white text-sm rounded-lg hover:bg-[#0284c7] transition-colors">+ Tiếp nhận bệnh nhân</button>
      </div>

      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64849e]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã bệnh nhân…" className="w-full pl-10 bg-[#0b1229] border border-[#1a2e4a] rounded-lg px-4 py-2.5 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none focus:border-[#0ea5e9]/50 transition-colors" />
      </div>

      <div className="border border-[#1a2e4a] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1a2e4a] bg-[#0b1229]">
          <div className="font-mono-data text-xs text-[#64849e]">{filteredPatients.length} BỆNH NHÂN</div>
        </div>
        {filteredPatients.map((p, i) => {
          const pRecords = records.filter(r => r.patient_id === p.id);
          const active = pRecords.find(r => r.status === "admitted");
          return (
            <div key={p.id} onClick={() => setSelectedPatient(p)} className={`px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#0b1229] transition-colors group ${i < filteredPatients.length - 1 ? "border-b border-[#1a2e4a]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center text-sm font-semibold text-[#0ea5e9]">{p.full_name.split(" ").pop()![0]}</div>
                <div>
                  <div className="text-sm font-medium text-[#e8edf5]">{p.full_name}</div>
                  <div className="text-xs text-[#64849e]">{p.patient_code} · {age(p.date_of_birth)} tuổi · {p.gender === "male" ? "Nam" : "Nữ"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-[#64849e]">{pRecords.length} đợt điều trị</div>
                  {active && <div className="text-xs text-[#0ea5e9]">● Đang điều trị</div>}
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[#64849e] group-hover:text-[#0ea5e9] transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {showNewRecord && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-[#0b1229] border border-[#1a2e4a] rounded-xl p-6 max-w-lg w-full">
            <div className="font-display text-xl mb-1">Tiếp nhận bệnh nhân</div>
            <div className="text-xs text-[#64849e] mb-5">Nhập CCCD để tra cứu bệnh nhân tái khám. CCCD chỉ dùng để tìm kiếm, không lưu plain text (F19).</div>

            <div className="space-y-4">
              <div>
                <label className="font-mono-data text-xs text-[#64849e] mb-1 block">SỐ CCCD (TRA CỨU)</label>
                <div className="flex gap-2">
                  <input value={newRecordForm.cccd} onChange={e => { setNewRecordForm(prev => ({ ...prev, cccd: e.target.value })); setCccdResult(null); }} placeholder="0xx xxx xxx xxx" className="flex-1 bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none focus:border-[#0ea5e9]/50" />
                  <button onClick={lookupCCCD} className="px-3 py-2 border border-[#1a2e4a] text-[#94aec8] text-xs rounded-lg hover:text-[#0ea5e9] hover:border-[#0ea5e9]/30 transition-colors">Tra cứu</button>
                </div>
                {cccdResult === "not_found" && <div className="text-xs text-[#f97316] mt-1">Không tìm thấy — sẽ tạo hồ sơ mới</div>}
                {cccdResult && cccdResult !== "not_found" && <div className="text-xs text-[#22c55e] mt-1">Tìm thấy: {cccdResult.full_name} — tạo đợt điều trị mới</div>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-mono-data text-xs text-[#64849e] mb-1 block">HỌ TÊN</label>
                  <input value={newRecordForm.full_name} onChange={e => setNewRecordForm(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Nguyễn Văn A" className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none" />
                </div>
                <div>
                  <label className="font-mono-data text-xs text-[#64849e] mb-1 block">NGÀY SINH</label>
                  <input type="date" value={newRecordForm.dob} onChange={e => setNewRecordForm(prev => ({ ...prev, dob: e.target.value }))} className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#e8edf5] focus:outline-none" />
                </div>
                <div>
                  <label className="font-mono-data text-xs text-[#64849e] mb-1 block">GIỚI TÍNH</label>
                  <select value={newRecordForm.gender} onChange={e => setNewRecordForm(prev => ({ ...prev, gender: e.target.value as "male" | "female" }))} className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#94aec8] focus:outline-none">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono-data text-xs text-[#64849e] mb-1 block">TRIỆU CHỨNG NHẬP VIỆN</label>
                <textarea value={newRecordForm.symptoms} onChange={e => setNewRecordForm(prev => ({ ...prev, symptoms: e.target.value }))} rows={2} placeholder="Mô tả triệu chứng…" className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none resize-none" />
              </div>
              <div>
                <label className="font-mono-data text-xs text-[#64849e] mb-1 block">TIỀN SỬ BỆNH</label>
                <input value={newRecordForm.history} onChange={e => setNewRecordForm(prev => ({ ...prev, history: e.target.value }))} placeholder="Tăng huyết áp, đái tháo đường…" className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none" />
              </div>
              <div>
                <label className="font-mono-data text-xs text-[#64849e] mb-1 block">DỊ ỨNG THUỐC</label>
                <input value={newRecordForm.allergies} onChange={e => setNewRecordForm(prev => ({ ...prev, allergies: e.target.value }))} placeholder="Không ghi nhận / Penicillin…" className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleCreateRecord} className="flex-1 py-2.5 bg-[#0ea5e9] text-white text-sm rounded-lg hover:bg-[#0284c7] transition-colors">Tạo hồ sơ</button>
              <button onClick={() => { setShowNewRecord(false); setCccdResult(null); }} className="flex-1 py-2.5 border border-[#1a2e4a] text-[#64849e] text-sm rounded-lg hover:text-[#e8edf5] transition-colors">Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DoctorPortal({ user, onBack }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filterStatus, setFilterStatus] = useState<ReviewStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | "all">("all");

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  const pendingCases = cases.filter(c => c.review_status === "pending").sort((a, b) => {
    const ord = { emergency: 0, review: 1, none: 2 };
    return ord[a.priority_level] - ord[b.priority_level];
  });

  const historyCases = cases.filter(c => (filterStatus === "all" || c.review_status === filterStatus) && (filterPriority === "all" || c.priority_level === filterPriority));

  function handleReview(caseId: string, decision: "confirmed" | "rejected", note: string) {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, review_status: decision, reviewed_by: user.id, reviewed_at: new Date().toISOString(), doctor_note: note } : c));
    setSelectedCase(null);
  }

  function handleAcknowledgeAlert(alertId: string) {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  }

  function handleAddCase(newCase: Case) {
    setCases(prev => [newCase, ...prev]);
    setTab("dashboard");
  }

  if (selectedCase) {
    const fresh = cases.find(c => c.id === selectedCase.id) ?? selectedCase;
    return <CaseDetail c={fresh} onBack={() => setSelectedCase(null)} onReview={handleReview} />;
  }

  const initials = user.full_name.split(" ").pop()![0].toUpperCase();

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
          <div className="ml-2 px-2 py-0.5 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[#0ea5e9] font-mono-data text-xs">Bác sỹ · {user.shift_status === "on_duty" ? "Đang trực" : "Ngoài ca"}</div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-[#0b1229] transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-[#64849e]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733" />
              </svg>
              {unacknowledgedAlerts.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-[#ef4444] text-white text-[9px] rounded-full flex items-center justify-center font-bold">{unacknowledgedAlerts.length}</span>}
            </button>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{user.full_name}</div>
              <div className="text-xs text-[#64849e]">Khoa {user.department}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0ea5e9]/20 border border-[#0ea5e9]/30 flex items-center justify-center text-[#0ea5e9] text-sm font-semibold">{initials}</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex gap-0 overflow-x-auto">
          {([
            { key: "dashboard", label: `Trực ca (${pendingCases.length})` },
            { key: "create", label: "Tạo Ca mới" },
            { key: "history", label: "Lịch sử Ca" },
            { key: "records", label: "Hồ sơ bệnh án" },
            { key: "rag", label: "Tra cứu y khoa" },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-5 py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${tab === t.key ? "border-[#0ea5e9] text-[#0ea5e9]" : "border-transparent text-[#64849e] hover:text-[#94aec8]"}`}>{t.label}</button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {tab === "dashboard" && (
          <div className="space-y-6">
            {unacknowledgedAlerts.length > 0 && (
              <div className="border border-[#ef4444]/30 bg-[#ef4444]/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                  <span className="font-mono-data text-xs text-[#ef4444] uppercase tracking-widest">Cảnh báo khẩn cấp · WebSocket</span>
                </div>
                {unacknowledgedAlerts.map(a => {
                  const c = cases.find(x => x.id === a.case_id);
                  return (
                    <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 py-2">
                      <div>
                        <span className="font-semibold text-[#ef4444]">{a.case_id}</span>
                        {c?.patient_name && <span className="text-sm text-[#94aec8] ml-3">{c.patient_name}</span>}
                        <span className="text-sm text-[#94aec8] ml-3">— Phát hiện xuất huyết vượt ngưỡng</span>
                        <span className="font-mono-data text-xs text-[#64849e] ml-3">{formatTime(a.sent_at)}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => c && setSelectedCase(c)} className="px-3 py-1.5 bg-[#ef4444] text-white text-xs rounded-md hover:bg-[#dc2626] transition-colors">Xem Ca</button>
                        <button onClick={() => handleAcknowledgeAlert(a.id)} className="px-3 py-1.5 border border-[#ef4444]/30 text-[#ef4444] text-xs rounded-md hover:bg-[#ef4444]/10 transition-colors">Đã nhận</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl">Ca chờ xác nhận</h2>
                <div className="font-mono-data text-xs text-[#64849e]">{pendingCases.length} ca · Theo mức ưu tiên</div>
              </div>
              {pendingCases.length === 0 ? (
                <div className="border border-[#1a2e4a] rounded-xl p-12 text-center text-[#64849e]">
                  <div className="font-display text-2xl mb-2">Không có ca nào chờ xác nhận</div>
                  <div className="text-sm">Tất cả ca đã được xử lý</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingCases.map(c => {
                    const positiveScans = c.scans.filter(s => s.result?.has_hemorrhage).length;
                    const maxConf = Math.max(...c.scans.map(s => s.result?.confidence ?? 0));
                    const topType = c.scans.find(s => s.result?.has_hemorrhage)?.result?.hemorrhage_type ?? "—";
                    return (
                      <div key={c.id} onClick={() => setSelectedCase(c)} className="border border-[#1a2e4a] hover:border-[#0ea5e9]/30 rounded-xl p-4 cursor-pointer transition-all hover:bg-[#0b1229]/50 group">
                        <div className="flex flex-wrap items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono-data text-sm text-[#e8edf5] font-semibold">{c.id}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${priorityClass(c.priority_level)}`}>{c.priority_level === "emergency" && "⚠ "}{priorityLabel(c.priority_level)}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-[#94aec8]">
                              {c.patient_name && <span className="font-medium text-[#e8edf5]">{c.patient_name}</span>}
                              <span>{c.scan_count} ảnh CT</span>
                              <span>{positiveScans} ��nh dương tính</span>
                              <span className="font-mono-data text-xs">{formatDate(c.created_at)} {formatTime(c.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex gap-4 items-center">
                            {positiveScans > 0 && (
                              <div className="text-right">
                                <div className="font-mono-data text-xs text-[#64849e]">Confidence cao nhất</div>
                                <div className="font-mono-data text-lg text-[#ef4444]">{maxConf.toFixed(1)}%</div>
                                <div className="text-xs text-[#94aec8]">{topType}</div>
                              </div>
                            )}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[#64849e] group-hover:text-[#0ea5e9] transition-colors shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "create" && <CreateCase onCreated={handleAddCase} />}

        {tab === "history" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="font-display text-2xl">Lịch sử Ca bệnh</h2>
              <div className="flex gap-3">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ReviewStatus | "all")} className="bg-[#0b1229] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#94aec8] focus:outline-none focus:border-[#0ea5e9]/50">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="rejected">Từ chối</option>
                </select>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as PriorityLevel | "all")} className="bg-[#0b1229] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#94aec8] focus:outline-none focus:border-[#0ea5e9]/50">
                  <option value="all">Tất cả mức độ</option>
                  <option value="emergency">Khẩn cấp</option>
                  <option value="review">Xem xét</option>
                  <option value="none">Bình thường</option>
                </select>
              </div>
            </div>
            <div className="border border-[#1a2e4a] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2e4a] bg-[#0b1229]">
                    {['Mã Ca', 'Bệnh nhân', 'Thời gian', 'Số ảnh', 'Mức ưu tiên', 'Trạng thái', 'Ghi chú', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-mono-data text-xs text-[#64849e]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyCases.map((c, i) => (
                    <tr key={c.id} className={`border-b border-[#1a2e4a] hover:bg-[#0b1229] transition-colors ${i === historyCases.length - 1 ? "border-b-0" : ""}`}>
                      <td className="px-4 py-3 font-mono-data text-xs text-[#0ea5e9]">{c.id}</td>
                      <td className="px-4 py-3 text-sm text-[#94aec8]">{c.patient_name ?? "—"}</td>
                      <td className="px-4 py-3 font-mono-data text-xs text-[#64849e]">{formatDate(c.created_at)}</td>
                      <td className="px-4 py-3 text-sm">{c.scan_count}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${priorityClass(c.priority_level)}`}>{priorityLabel(c.priority_level)}</span></td>
                      <td className={`px-4 py-3 text-sm font-medium ${reviewClass(c.review_status)}`}>{reviewLabel(c.review_status)}</td>
                      <td className="px-4 py-3 text-xs text-[#64849e] max-w-[180px] truncate">{c.doctor_note ?? "—"}</td>
                      <td className="px-4 py-3"><button onClick={() => setSelectedCase(c)} className="text-xs text-[#0ea5e9] hover:underline">Xem</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "records" && <RecordsPanel />}

        {tab === "rag" && <RAGPanel userId={user.id} />}
      </main>
    </div>
  );
}
