import { useState } from "react";
import type { Case, DetectionResult, ScanImage } from "../data/mockData";

interface Props {
  onCreated: (caseItem: Case) => void;
}

export default function CreateCase({ onCreated }: Props) {
  const [files, setFiles] = useState<File[]>([]);

  function createCase() {
    if (files.length === 0) return;
    const id = `CASE-${Date.now()}`;
    const now = new Date().toISOString();
    const scans: ScanImage[] = files.map((file, index) => {
      const result: DetectionResult = {
        id: `result-${id}-${index + 1}`,
        scan_image_id: `scan-${id}-${index + 1}`,
        has_hemorrhage: false,
        hemorrhage_type: "",
        location: "",
        volume_mm3: 0,
        confidence: 0,
        priority_level: "none",
        spread_prediction: "",
        heatmap_path: "",
        created_at: now,
        review_status: "pending",
      };
      return {
        id: `scan-${id}-${index + 1}`,
        case_id: id,
        file_path: file.name,
        uploaded_by: "u1",
        uploaded_at: now,
        status: "pending",
        result,
      };
    });

    onCreated({
      id,
      created_at: now,
      priority_level: "none",
      review_status: "pending",
      scan_count: scans.length,
      scans,
    });
  }

  return (
    <section className="max-w-2xl space-y-4">
      <h2 className="text-2xl font-semibold">Tạo ca mới</h2>
      <p className="text-sm text-[#94aec8]">Chọn các ảnh CT thuộc cùng một ca bệnh.</p>
      <input type="file" multiple accept=".dcm,.nii,.png,.jpg,.jpeg" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} className="block w-full rounded-lg border border-[#1a2e4a] bg-[#0b1229] p-4 text-sm" />
      {files.length > 0 && <p className="text-sm text-[#94aec8]">Đã chọn {files.length} ảnh</p>}
      <button onClick={createCase} disabled={files.length === 0} className="rounded-md bg-[#0ea5e9] px-5 py-3 text-white disabled:opacity-50">Tạo ca và gửi lên bảng điều khiển</button>
    </section>
  );
}
