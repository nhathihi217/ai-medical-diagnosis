import { useState, useRef } from "react";
import { Case, ScanImage, DetectionResult } from "../data/mockData";

interface Props {
  onCreated: (c: Case) => void;
}

interface UploadedFile {
  name: string;
  size: number;
  status: "queued" | "processing" | "done" | "failed";
  result?: { hasHemo: boolean; conf: number; type: string };
}

const hemorrhageTypes = ["Epidural", "Subdural", "Subarachnoid", "Intraparenchymal", "Intraventricular", "Mixed"];

function fakeAnalyze(name: string): { hasHemo: boolean; conf: number; type: string } {
  const seed = name.charCodeAt(0) + name.length;
  const hasHemo = seed % 3 !== 0;
  const conf = 72 + (seed % 25);
  const type = hemorrhageTypes[seed % hemorrhageTypes.length];
  return { hasHemo, conf, type };
}

export default function CreateCase({ onCreated }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const added: UploadedFile[] = Array.from(newFiles).map(f => ({
      name: f.name,
      size: f.size,
      status: "queued",
    }));
    setFiles(prev => [...prev, ...added]);
  }

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleProcess() {
    if (files.length === 0) return;
    setProcessing(true);

    for (let i = 0; i < files.length; i++) {
      setFiles(prev => prev.map((f, fi) => fi === i ? { ...f, status: "processing" } : f));
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      const result = fakeAnalyze(files[i].name);
      setFiles(prev => prev.map((f, fi) => fi === i ? { ...f, status: "done", result } : f));
    }

    setProcessing(false);
    setDone(true);
  }

  function handleCreateCase() {
    const caseId = `CASE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const now = new Date().toISOString();

    const scans: ScanImage[] = files.map((f, i) => {
      const r = f.result;
      const result: DetectionResult | undefined = r
        ? {
            id: `res-${caseId}-${i + 1}`,
            scan_image_id: `scan-${caseId}-${i + 1}`,
            has_hemorrhage: r.hasHemo,
            hemorrhage_type: r.hasHemo ? r.type : "",
            location: r.hasHemo ? "Thuỳ trán" : "",
            volume_mm3: r.hasHemo ? 3000 + i * 200 : 0,
            confidence: r.hasHemo ? r.conf : 0,
            priority_level: (r.hasHemo && r.conf > 70 ? (r.conf > 90 ? "emergency" : "review") : "none") as import("../data/mockData").PriorityLevel,
            spread_prediction: "",
            heatmap_path: "",
            review_status: "pending" as import("../data/mockData").ReviewStatus,
            created_at: now,
          }
        : undefined;
      return {
        id: `scan-${caseId}-${i + 1}`,
        case_id: caseId,
        file_path: f.name,
        uploaded_by: "u1",
        uploaded_at: now,
        status: "done",
        result,
      };
    });

    const positiveConfs = scans
      .filter(s => s.result?.has_hemorrhage)
      .map(s => s.result!.confidence);
    const maxConf = positiveConfs.length > 0 ? Math.max(...positiveConfs) : 0;
    const priority = maxConf >= 90 ? "emergency" : maxConf >= 75 ? "review" : "none";

    const newCase: Case = {
      id: caseId,
      created_at: now,
      priority_level: priority,
      review_status: "pending",
      scan_count: files.length,
      scans,
    };

    onCreated(newCase);
  }

  const doneCount = files.filter(f => f.status === "done").length;
  const hemoCount = files.filter(f => f.result?.hasHemo).length;

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-3xl mb-2">Tạo Ca mới (F5)</h2>
      <p className="text-[#64849e] text-sm mb-6">
        Upload một loạt ảnh CT DICOM thuộc cùng 1 Ca. Model AI Hướng A sẽ chạy tự động cho từng slice.
      </p>

      {/* Drop zone */}
      {!done && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all mb-4 ${
            dragOver ? "border-[#0ea5e9] bg-[#0ea5e9]/5" : "border-[#1a2e4a] hover:border-[#0ea5e9]/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".dcm,.nii,.png,.jpg"
            className="hidden"
            onChange={e => addFiles(e.target.files)}
          />
          <div className="w-12 h-12 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth={1.5} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div className="text-sm font-medium mb-1">Kéo thả hoặc click để chọn ảnh CT</div>
          <div className="text-xs text-[#64849e]">Hỗ trợ .dcm, .nii, .png · Nhiều file cùng lúc</div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="border border-[#1a2e4a] rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-[#1a2e4a] bg-[#0b1229] flex items-center justify-between">
            <div className="font-mono-data text-xs text-[#64849e]">
              {files.length} file · {doneCount} đã xử lý
              {hemoCount > 0 && <span className="text-[#ef4444] ml-2">· {hemoCount} dương tính</span>}
            </div>
            {!processing && !done && (
              <button onClick={() => setFiles([])} className="text-xs text-[#64849e] hover:text-[#e8edf5] transition-colors">
                Xoá tất cả
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-[#1a2e4a]">
            {files.map((f, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                <div className="shrink-0">
                  {f.status === "queued" && (
                    <div className="w-5 h-5 rounded-full border border-[#1a2e4a] bg-[#04091a]" />
                  )}
                  {f.status === "processing" && (
                    <div className="w-5 h-5 border-2 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
                  )}
                  {f.status === "done" && f.result?.hasHemo && (
                    <div className="w-5 h-5 rounded-full bg-[#ef4444] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                  )}
                  {f.status === "done" && !f.result?.hasHemo && (
                    <div className="w-5 h-5 rounded-full bg-[#22c55e] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                  {f.status === "failed" && (
                    <div className="w-5 h-5 rounded-full bg-[#64849e] flex items-center justify-center">
                      <span className="text-white text-xs">✕</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{f.name}</div>
                  {f.result && (
                    <div className={`text-xs font-mono-data ${f.result.hasHemo ? "text-[#ef4444]" : "text-[#22c55e]"}`}>
                      {f.result.hasHemo ? `${f.result.type} · ${f.result.conf.toFixed(1)}%` : "Không phát hiện"}
                    </div>
                  )}
                </div>
                <div className="font-mono-data text-xs text-[#64849e] shrink-0">
                  {(f.size / 1024).toFixed(0)} KB
                </div>
                {!processing && !done && (
                  <button onClick={() => removeFile(i)} className="text-[#64849e] hover:text-[#ef4444] transition-colors shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {processing && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#64849e] mb-1">
            <span>Đang chạy model AI Hướng A...</span>
            <span>{doneCount}/{files.length}</span>
          </div>
          <div className="h-1.5 bg-[#0b1229] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0ea5e9] rounded-full transition-all duration-300"
              style={{ width: `${(doneCount / files.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Result summary */}
      {done && (
        <div className="border border-[#1a2e4a] rounded-xl p-4 mb-4 bg-[#0b1229]">
          <div className="font-mono-data text-xs text-[#64849e] mb-3">KẾT QUẢ PHÂN TÍCH</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-[#64849e]">Tổng slice</div>
              <div className="font-display text-2xl">{files.length}</div>
            </div>
            <div>
              <div className="text-xs text-[#64849e]">Dương tính</div>
              <div className={`font-display text-2xl ${hemoCount > 0 ? "text-[#ef4444]" : "text-[#22c55e]"}`}>{hemoCount}</div>
            </div>
            <div>
              <div className="text-xs text-[#64849e]">Mức ưu tiên dự kiến</div>
              <div className={`font-semibold text-sm mt-1 ${
                hemoCount / files.length > 0.3 ? "text-[#ef4444]" :
                hemoCount > 0 ? "text-[#f97316]" : "text-[#22c55e]"
              }`}>
                {hemoCount / files.length > 0.3 ? "Khẩn cấp" : hemoCount > 0 ? "Xem xét" : "Bình thường"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!done && !processing && files.length > 0 && (
          <button
            onClick={handleProcess}
            className="px-6 py-3 bg-[#0ea5e9] text-white text-sm font-medium rounded-lg hover:bg-[#0284c7] transition-colors"
          >
            Chạy Model AI ({files.length} ảnh)
          </button>
        )}
        {done && (
          <button
            onClick={handleCreateCase}
            className="px-6 py-3 bg-[#22c55e] text-white text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
          >
            Tạo Ca & Gửi lên Dashboard
          </button>
        )}
        {(done || files.length > 0) && !processing && (
          <button
            onClick={() => { setFiles([]); setDone(false); }}
            className="px-6 py-3 border border-[#1a2e4a] text-[#64849e] text-sm rounded-lg hover:text-[#e8edf5] transition-colors"
          >
            Làm lại
          </button>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 border border-[#1a2e4a] rounded-xl p-4 bg-[#0b1229]">
        <div className="font-mono-data text-xs text-[#64849e] mb-3">WORKFLOW XỬ LÝ (F5 → F6 → F7 → F8)</div>
        {[
          "Upload ảnh → tạo ScanImage (status = pending) cho từng slice",
          "Backend đẩy vào hàng đợi → chạy pipeline Hướng A (Multi-window + ResNet50 + Bi-LSTM)",
          "Ghi DetectionResult → ScanImage.status = done",
          "Tổng hợp confidence max → tính priority_level cho cả Ca",
          "Nếu priority = emergency → tạo Alert → đẩy WebSocket tới bác sỹ trực",
        ].map((s, i) => (
          <div key={i} className="flex gap-3 mb-2 text-xs text-[#94aec8]">
            <span className="font-mono-data text-[#0ea5e9] shrink-0">{i + 1}.</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
