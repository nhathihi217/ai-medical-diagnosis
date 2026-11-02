import { useState } from "react";
import { Case, PriorityLevel, ReviewStatus } from "../data/mockData";

interface Props {
  c: Case;
  onBack: () => void;
  onReview: (caseId: string, decision: "confirmed" | "rejected", note: string) => void;
}

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

function SliceSVG({ hasHemo, conf, type, idx }: { hasHemo: boolean; conf: number; type: string; idx: number }) {
  const offset = ((idx * 7) % 40) - 20;
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <defs>
        <radialGradient id={`bg${idx}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="70%" stopColor="#2d3748" />
          <stop offset="100%" stopColor="#0d1117" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" fill="#000" />
      <ellipse cx="60" cy="60" rx="52" ry="55" fill={`url(#bg${idx})`} />
      <ellipse cx="60" cy="60" rx="36" ry="40" fill="#374151" opacity="0.4" />
      <path d={`M60 22 Q68 42 66 60 Q64 78 60 90 Q56 78 54 60 Q52 42 60 22Z`} fill="#4b5563" opacity="0.3" />
      {hasHemo && (
        <>
          <ellipse cx={45 + offset * 0.3} cy={45} rx="10" ry="8" fill="#ef4444" opacity="0.85" />
          <ellipse cx={45 + offset * 0.3} cy={45} rx="5" ry="4" fill="#fca5a5" opacity="0.6" />
          <rect x={32 + offset * 0.3} y={34} width="26" height="22" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,2" rx="1" />
        </>
      )}
      {[0,1,2,3].map(i => (
        <line key={`v${i}`} x1={15 + i*30} y1="5" x2={15 + i*30} y2="115" stroke="#0ea5e9" strokeWidth="0.15" opacity="0.2" />
      ))}
      {[0,1,2,3].map(i => (
        <line key={`h${i}`} x1="5" y1={15 + i*30} x2="115" y2={15 + i*30} stroke="#0ea5e9" strokeWidth="0.15" opacity="0.2" />
      ))}
      {hasHemo && (
        <text x="4" y="116" fill="#ef4444" fontSize="5" fontFamily="JetBrains Mono">{conf.toFixed(0)}%</text>
      )}
      <text x="70" y="116" fill="#64849e" fontSize="4" fontFamily="JetBrains Mono">S{idx + 1}</text>
    </svg>
  );
}

export default function CaseDetail({ c, onBack, onReview }: Props) {
  const [selectedScanIdx, setSelectedScanIdx] = useState(0);
  const [note, setNote] = useState(c.doctor_note ?? "");
  const [showConfirmModal, setShowConfirmModal] = useState<"confirmed" | "rejected" | null>(null);

  const positiveScans = c.scans.filter(s => s.result?.has_hemorrhage);
  const maxConf = Math.max(...c.scans.map(s => s.result?.confidence ?? 0));
  const topType = positiveScans[0]?.result?.hemorrhage_type ?? "Không phát hiện";
  const selectedScan = c.scans[selectedScanIdx];
  const selResult = selectedScan?.result;

  const isPending = c.review_status === "pending";

  function formatDt(iso: string) {
    return new Date(iso).toLocaleString("vi-VN");
  }

  return (
    <div className="min-h-screen bg-[#04091a] text-[#e8edf5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a2e4a] bg-[#04091a]/95 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <button onClick={onBack} className="text-[#64849e] hover:text-[#e8edf5] transition-colors flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="text-sm">Quay lại</span>
          </button>
          <div className="h-4 w-px bg-[#1a2e4a]" />
          <span className="font-mono-data text-sm text-[#e8edf5]">{c.id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityClass(c.priority_level)}`}>
            {c.priority_level === "emergency" && "⚠ "}{priorityLabel(c.priority_level)}
          </span>
          <div className="ml-auto text-sm text-[#64849e]">
            Trạng thái: <span className={c.review_status === "confirmed" ? "text-[#22c55e]" : c.review_status === "rejected" ? "text-[#64849e]" : "text-[#f97316]"}>
              {reviewLabel(c.review_status)}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: scan strip + summary */}
          <div className="lg:col-span-1 space-y-4">
            {/* Summary */}
            <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-4">
              <div className="font-mono-data text-xs text-[#64849e] mb-3">TỔNG HỢP CA</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#64849e]">Tổng ảnh CT</span><span>{c.scan_count}</span></div>
                <div className="flex justify-between"><span className="text-[#64849e]">Ảnh dương tính</span>
                  <span className={positiveScans.length > 0 ? "text-[#ef4444]" : "text-[#22c55e]"}>{positiveScans.length}</span>
                </div>
                <div className="flex justify-between"><span className="text-[#64849e]">Confidence cao nhất</span>
                  <span className="font-mono-data text-[#ef4444]">{maxConf > 0 ? `${maxConf.toFixed(1)}%` : "—"}</span>
                </div>
                <div className="flex justify-between"><span className="text-[#64849e]">Loại xuất huyết</span><span>{topType}</span></div>
                <div className="flex justify-between"><span className="text-[#64849e]">Thời gian tạo</span>
                  <span className="font-mono-data text-xs">{formatDt(c.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Scan strip */}
            <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-3">
              <div className="font-mono-data text-xs text-[#64849e] mb-3">DANH SÁCH SLICE ({c.scans.length})</div>
              <div className="grid grid-cols-4 gap-1.5 max-h-72 overflow-y-auto">
                {c.scans.map((s, i) => {
                  const hasHemo = s.result?.has_hemorrhage ?? false;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScanIdx(i)}
                      className={`relative aspect-square bg-black rounded overflow-hidden border-2 transition-all ${
                        selectedScanIdx === i ? "border-[#0ea5e9]" : hasHemo ? "border-[#ef4444]/40" : "border-transparent hover:border-[#1a2e4a]"
                      }`}
                    >
                      <SliceSVG hasHemo={hasHemo} conf={s.result?.confidence ?? 0} type={s.result?.hemorrhage_type ?? ""} idx={i} />
                      {hasHemo && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#ef4444]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: viewer + result + review */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main viewer */}
            <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1a2e4a] flex items-center justify-between">
                <div className="font-mono-data text-xs text-[#64849e]">
                  Slice {selectedScanIdx + 1} / {c.scans.length} · {selectedScan?.file_path.split("/").pop()}
                </div>
                <div className="flex gap-2">
                  {["W/L", "Zoom", "Heatmap"].map(t => (
                    <button key={t} className="px-2 py-1 text-xs text-[#64849e] border border-[#1a2e4a] rounded hover:text-[#e8edf5] hover:border-[#0ea5e9]/30 transition-colors">{t}</button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="bg-black rounded-lg overflow-hidden max-w-sm mx-auto aspect-square">
                  <svg viewBox="0 0 280 280" className="w-full h-full">
                    <defs>
                      <radialGradient id="mainbrain" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#4a5568" />
                        <stop offset="65%" stopColor="#2d3748" />
                        <stop offset="100%" stopColor="#0d1117" />
                      </radialGradient>
                      <radialGradient id="hemoGrad" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.3" />
                      </radialGradient>
                    </defs>
                    <rect width="280" height="280" fill="#000" />
                    <ellipse cx="140" cy="140" rx="118" ry="124" fill="url(#mainbrain)" />
                    <ellipse cx="140" cy="140" rx="85" ry="92" fill="#374151" opacity="0.4" />
                    <path d="M140 52 Q162 100 158 140 Q154 182 140 208 Q126 182 122 140 Q118 100 140 52Z" fill="#4b5563" opacity="0.35" />
                    {selResult?.has_hemorrhage && (
                      <>
                        <ellipse cx="105" cy="108" rx="22" ry="17" fill="url(#hemoGrad)" />
                        <ellipse cx="105" cy="108" rx="11" ry="8" fill="#fca5a5" opacity="0.55" />
                        <rect x="80" y="88" width="50" height="40" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" rx="2" />
                        <text x="80" y="84" fill="#ef4444" fontSize="8" fontFamily="JetBrains Mono">{(selResult.hemorrhage_type ?? "").toUpperCase()}</text>
                        <text x="80" y="136" fill="#ef4444" fontSize="7" fontFamily="JetBrains Mono">{selResult.confidence.toFixed(1)}%</text>
                      </>
                    )}
                    {[0,1,2,3,4,5,6].map(i => (
                      <line key={`v${i}`} x1={20 + i*40} y1="10" x2={20 + i*40} y2="270" stroke="#0ea5e9" strokeWidth="0.2" opacity="0.2" />
                    ))}
                    {[0,1,2,3,4,5,6].map(i => (
                      <line key={`h${i}`} x1="10" y1={20 + i*40} x2="270" y2={20 + i*40} stroke="#0ea5e9" strokeWidth="0.2" opacity="0.2" />
                    ))}
                    <path d="M10 10 L28 10 M10 10 L10 28" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M270 10 L252 10 M270 10 L270 28" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
                    <text x="10" y="278" fill="#0ea5e9" fontSize="7" fontFamily="JetBrains Mono">S{selectedScanIdx + 1}/{c.scans.length}</text>
                    <text x="190" y="278" fill="#64849e" fontSize="7" fontFamily="JetBrains Mono">WW:80 WL:40</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Detection result for selected scan */}
            {selResult && (
              <div className={`border rounded-xl p-4 ${selResult.has_hemorrhage ? "border-[#ef4444]/30 bg-[#ef4444]/5" : "border-[#1a2e4a] bg-[#0b1229]"}`}>
                <div className="font-mono-data text-xs text-[#64849e] mb-3">KẾT QUẢ AI · SLICE {selectedScanIdx + 1}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-[#64849e] mb-0.5">Phát hiện</div>
                    <div className={`font-semibold text-sm ${selResult.has_hemorrhage ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
                      {selResult.has_hemorrhage ? "Có xuất huyết" : "Không có"}
                    </div>
                  </div>
                  {selResult.has_hemorrhage && (
                    <>
                      <div>
                        <div className="text-xs text-[#64849e] mb-0.5">Loại</div>
                        <div className="font-semibold text-sm">{selResult.hemorrhage_type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#64849e] mb-0.5">Confidence</div>
                        <div className="font-mono-data font-semibold text-sm text-[#ef4444]">{selResult.confidence.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-[#64849e] mb-0.5">Thể tích</div>
                        <div className="font-mono-data font-semibold text-sm">{(selResult.volume_mm3 / 1000).toFixed(1)} mL</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Review panel (F9) — only for pending */}
            {isPending ? (
              <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-4">
                <div className="font-mono-data text-xs text-[#64849e] mb-3">XÁC NHẬN CA (F9) — Bác sỹ xét toàn bộ Ca</div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ghi chú lâm sàng (tùy chọn)..."
                  rows={3}
                  className="w-full bg-[#04091a] border border-[#1a2e4a] rounded-lg px-3 py-2 text-sm text-[#e8edf5] placeholder-[#64849e] focus:outline-none focus:border-[#0ea5e9]/50 resize-none mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal("confirmed")}
                    className="flex-1 py-2.5 bg-[#22c55e] text-white text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
                  >
                    Xác nhận Ca
                  </button>
                  <button
                    onClick={() => setShowConfirmModal("rejected")}
                    className="flex-1 py-2.5 border border-[#ef4444]/30 text-[#ef4444] text-sm rounded-lg hover:bg-[#ef4444]/10 transition-colors"
                  >
                    Từ chối Ca
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-[#1a2e4a] rounded-xl bg-[#0b1229] p-4">
                <div className="font-mono-data text-xs text-[#64849e] mb-2">KẾT QUẢ XÉT DUYỆT</div>
                <div className={`text-sm font-semibold mb-1 ${c.review_status === "confirmed" ? "text-[#22c55e]" : "text-[#64849e]"}`}>
                  {reviewLabel(c.review_status)} · {c.reviewed_at ? new Date(c.reviewed_at).toLocaleString("vi-VN") : ""}
                </div>
                {c.doctor_note && <p className="text-sm text-[#94aec8]">{c.doctor_note}</p>}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirm modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0b1229] border border-[#1a2e4a] rounded-xl p-6 max-w-md w-full">
            <div className="font-display text-xl mb-2">
              {showConfirmModal === "confirmed" ? "Xác nhận Ca?" : "Từ chối Ca?"}
            </div>
            <p className="text-sm text-[#94aec8] mb-4">
              {showConfirmModal === "confirmed"
                ? "Bạn sẽ xác nhận kết quả AI và đóng Ca này."
                : "Bạn sẽ từ chối Ca này (ví dụ: ảnh chất lượng kém, cần chụp lại)."}
            </p>
            {note && <div className="text-xs text-[#64849e] mb-4 bg-[#04091a] rounded-lg p-3">Ghi chú: {note}</div>}
            <div className="flex gap-3">
              <button
                onClick={() => { onReview(c.id, showConfirmModal, note); setShowConfirmModal(null); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg ${showConfirmModal === "confirmed" ? "bg-[#22c55e] text-white hover:bg-[#16a34a]" : "bg-[#ef4444] text-white hover:bg-[#dc2626]"} transition-colors`}
              >
                {showConfirmModal === "confirmed" ? "Xác nhận" : "Từ chối"}
              </button>
              <button onClick={() => setShowConfirmModal(null)} className="flex-1 py-2.5 border border-[#1a2e4a] text-[#64849e] text-sm rounded-lg hover:text-[#e8edf5] transition-colors">
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
