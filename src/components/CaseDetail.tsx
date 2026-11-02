import { useState } from "react";
import type { Case, ReviewStatus } from "../data/mockData";

interface Props {
  c: Case;
  onBack: () => void;
  onReview: (caseId: string, decision: "confirmed" | "rejected", note: string) => void;
}

export default function CaseDetail({ c, onBack, onReview }: Props) {
  const [note, setNote] = useState(c.doctor_note ?? "");
  const [decision, setDecision] = useState<ReviewStatus>(c.review_status);

  return (
    <main className="min-h-screen bg-[#04091a] p-6 text-[#e8edf5]">
      <button onClick={onBack} className="mb-6 text-[#0ea5e9]">← Quay lại</button>
      <section className="rounded-xl border border-[#1a2e4a] bg-[#0b1229] p-6">
        <h1 className="mb-4 text-2xl font-semibold">Ca {c.id}</h1>
        <p className="mb-2">Số ảnh CT: {c.scan_count}</p>
        <p className="mb-5">Trạng thái: {decision === "pending" ? "Chờ xác nhận" : decision === "confirmed" ? "Đã xác nhận" : "Từ chối"}</p>
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {c.scans.map((scan) => <div key={scan.id} className="rounded-lg border border-[#1a2e4a] p-3"><div className="text-sm">{scan.file_path.split("/").pop()}</div><div className="text-xs text-[#94aec8]">{scan.result?.has_hemorrhage ? `${scan.result.hemorrhage_type} · ${scan.result.confidence}%` : "Chưa có kết quả phân tích"}</div></div>)}
        </div>
        {decision === "pending" && <>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ghi chú lâm sàng (không bắt buộc)" className="mb-3 w-full rounded-lg border border-[#1a2e4a] bg-[#04091a] p-3" rows={3} />
          <div className="flex gap-3">
            <button onClick={() => { onReview(c.id, "confirmed", note); setDecision("confirmed"); }} className="rounded-md bg-green-700 px-4 py-2">Xác nhận ca</button>
            <button onClick={() => { onReview(c.id, "rejected", note); setDecision("rejected"); }} className="rounded-md bg-red-700 px-4 py-2">Từ chối ca</button>
          </div>
        </>}
      </section>
    </main>
  );
}
