export type PriorityLevel = "emergency" | "review" | "none";
export type ReviewStatus = "pending" | "confirmed" | "rejected";
export type ScanStatus = "pending" | "processing" | "done" | "failed";
export type UserRole = "doctor" | "admin" | "nurse";
export type ShiftStatus = "on_duty" | "off_duty";
export type RecordStatus = "admitted" | "discharged" | "transferred";
export type NoteType = "examination" | "treatment" | "prescription";

export interface User {
  id: string;
  username: string;
  password_hash?: string;
  full_name: string;
  role: UserRole;
  department: string;
  shift_status: ShiftStatus;
  is_active: boolean;
  created_at: string;
}

export interface Patient {
  id: string;
  patient_code: string;
  full_name: string;
  date_of_birth: string;
  gender: "male" | "female";
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  medical_history: string;
  allergies: string;
  current_symptoms: string;
  admission_date: string;
  attending_doctor_id: string;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
}

export interface ClinicalNote {
  id: string;
  medical_record_id: string;
  author_id: string;
  note_type: NoteType;
  content: string;
  created_at: string;
}

export interface DetectionResult {
  id: string;
  scan_image_id: string;
  has_hemorrhage: boolean;
  hemorrhage_type: string;
  location: string;
  volume_mm3: number;
  confidence: number;
  priority_level: PriorityLevel;
  spread_prediction: string;
  heatmap_path: string;
  created_at: string;
  review_status: ReviewStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  doctor_note?: string;
}

export interface ScanImage {
  id: string;
  case_id: string;
  medical_record_id?: string;
  file_path: string;
  uploaded_by: string;
  uploaded_at: string;
  status: ScanStatus;
  result?: DetectionResult;
}

export interface Case {
  id: string;
  created_at: string;
  priority_level: PriorityLevel;
  review_status: ReviewStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  doctor_note?: string;
  scan_count: number;
  scans: ScanImage[];
  patient_name?: string;
  medical_record_id?: string;
}

export interface Alert {
  id: string;
  case_id: string;
  sent_to: string;
  sent_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
}

export interface RAGQueryLog {
  id: string;
  user_id: string;
  query_text: string;
  answer_text: string;
  retrieved_doc_ids: string[];
  linked_detection_id?: string;
  created_at: string;
}

export const MOCK_USERS: User[] = [
  { id: "u1", username: "bs.nguyen.ha", full_name: "BS. Nguyễn Thanh Hà", role: "doctor", department: "Thần kinh", shift_status: "on_duty", is_active: true, created_at: "2024-01-15" },
  { id: "u2", username: "bs.tran.khoa", full_name: "BS. Trần Minh Khoa", role: "doctor", department: "Thần kinh", shift_status: "on_duty", is_active: true, created_at: "2024-02-01" },
  { id: "u3", username: "bs.le.huong", full_name: "BS. Lê Thu Hương", role: "doctor", department: "Chẩn đoán hình ảnh", shift_status: "off_duty", is_active: true, created_at: "2024-03-10" },
  { id: "u4", username: "admin.pham.hai", full_name: "Phạm Văn Hải", role: "admin", department: "IT", shift_status: "on_duty", is_active: true, created_at: "2023-11-01" },
  { id: "u5", username: "bs.hoang.mai", full_name: "BS. Hoàng Thị Mai", role: "doctor", department: "Thần kinh", shift_status: "off_duty", is_active: false, created_at: "2024-04-05" },
];

export const MOCK_PATIENTS: Patient[] = [
  { id: "p1", patient_code: "BN-20241001-001", full_name: "Nguyễn Văn An", date_of_birth: "1966-03-14", gender: "male", created_at: "2024-10-01" },
  { id: "p2", patient_code: "BN-20241105-002", full_name: "Trần Thị Bình", date_of_birth: "1978-07-22", gender: "female", created_at: "2024-11-05" },
  { id: "p3", patient_code: "BN-20241118-003", full_name: "Lê Văn Cường", date_of_birth: "1952-11-08", gender: "male", created_at: "2024-11-18" },
  { id: "p4", patient_code: "BN-20241120-004", full_name: "Phạm Thị Dung", date_of_birth: "1985-05-30", gender: "female", created_at: "2024-11-20" },
  { id: "p5", patient_code: "BN-20241121-005", full_name: "Hoàng Minh Đức", date_of_birth: "1990-01-17", gender: "male", created_at: "2024-11-21" },
];

export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: "mr1",
    patient_id: "p1",
    medical_history: "Tăng huyết áp điều trị 8 năm. Đái tháo đường type 2. Hút thuốc lá 20 bao/năm.",
    allergies: "Penicillin (phát ban toàn thân)",
    current_symptoms: "Đột ngột đau đầu dữ dội, buồn nôn, nôn mửa, yếu nửa người bên trái xuất hiện 2 giờ trước.",
    admission_date: "2024-11-21T06:30:00Z",
    attending_doctor_id: "u1",
    status: "admitted",
    created_at: "2024-11-21T06:35:00Z",
    updated_at: "2024-11-21T08:00:00Z",
  },
  {
    id: "mr2",
    patient_id: "p2",
    medical_history: "Tiền sử nhức đầu mãn tính. Uống thuốc ngừa thai 5 năm.",
    allergies: "Không ghi nhận",
    current_symptoms: "Nhức đầu lan tỏa, cứng gáy, sợ ánh sáng kéo dài 6 giờ.",
    admission_date: "2024-11-21T07:00:00Z",
    attending_doctor_id: "u2",
    status: "admitted",
    created_at: "2024-11-21T07:10:00Z",
    updated_at: "2024-11-21T07:10:00Z",
  },
  {
    id: "mr3",
    patient_id: "p3",
    medical_history: "Bệnh Parkinson giai đoạn 3. Dùng Levodopa/Carbidopa. Té ngã nhiều lần.",
    allergies: "Không ghi nhận",
    current_symptoms: "Ngã đập đầu, mất ý thức thoáng qua khoảng 5 phút, hiện tỉnh.",
    admission_date: "2024-11-20T22:15:00Z",
    attending_doctor_id: "u1",
    status: "admitted",
    created_at: "2024-11-20T22:20:00Z",
    updated_at: "2024-11-21T06:00:00Z",
  },
  {
    id: "mr4",
    patient_id: "p4",
    medical_history: "Khoẻ mạnh. Không tiền sử bệnh nội khoa.",
    allergies: "Không ghi nhận",
    current_symptoms: "Đau đầu sau chấn thương giao thông, buồn nôn nhẹ.",
    admission_date: "2024-11-20T19:00:00Z",
    attending_doctor_id: "u2",
    status: "discharged",
    created_at: "2024-11-20T19:10:00Z",
    updated_at: "2024-11-21T00:00:00Z",
  },
];

export const MOCK_CLINICAL_NOTES: ClinicalNote[] = [
  {
    id: "cn1",
    medical_record_id: "mr1",
    author_id: "u1",
    note_type: "examination",
    content: "Khám lâm sàng: Bệnh nhân tỉnh, tiếp xúc chậm. GCS 13/15. Đồng tử đều, phản xạ ánh sáng (+). Liệt nhẹ tay trái 4/5. Huyết áp 190/110 mmHg. Mạch 88 lần/phút.",
    created_at: "2024-11-21T07:00:00Z",
  },
  {
    id: "cn2",
    medical_record_id: "mr1",
    author_id: "u1",
    note_type: "treatment",
    content: "Chỉ định CT scan não cấp cứu. Hạ huyết áp từ từ bằng Nicardipine TTM. Theo dõi sát thần kinh mỗi 15 phút. Nhịn ăn uống.",
    created_at: "2024-11-21T07:15:00Z",
  },
  {
    id: "cn3",
    medical_record_id: "mr1",
    author_id: "u1",
    note_type: "prescription",
    content: "1. Nicardipine 10mg/10ml + NaCl 0.9% 40ml, TTM 5ml/h, tăng dần theo HA mục tiêu <160/100.\n2. Manitol 20% 250ml truyền nhanh 15-30 phút nếu có dấu hiệu thoát vị.\n3. NPO.",
    created_at: "2024-11-21T07:20:00Z",
  },
  {
    id: "cn4",
    medical_record_id: "mr3",
    author_id: "u1",
    note_type: "examination",
    content: "Bệnh nhân tỉnh, GCS 15/15. Có tụ máu nhỏ vùng chẩm. Không dấu thần kinh khu trú. Huyết áp 130/80. Yêu cầu CT scan để loại trừ xuất huyết.",
    created_at: "2024-11-20T22:30:00Z",
  },
];

export const MOCK_RAG_LOGS: RAGQueryLog[] = [
  {
    id: "rag1",
    user_id: "u1",
    query_text: "Phác đồ điều trị xuất huyết ngoài màng cứng (epidural hemorrhage) tại thuỳ trán",
    answer_text: "Xuất huyết ngoài màng cứng (EDH) tại thuỳ trán là cấp cứu thần kinh ngoại khoa. Phác đồ ưu tiên: 1) ABC và ổn định huyết động; 2) CT scan ngay để xác định thể tích và midline shift; 3) Nếu thể tích >30ml, độ dày >15mm, hoặc midline shift >5mm → chỉ định phẫu thuật cấp cứu mở sọ giải áp; 4) Nếu thể tích <30ml và GCS ổn định → theo dõi nội khoa, lặp CT sau 6-8 giờ; 5) Kiểm soát huyết áp mục tiêu HA tâm thu 140-160mmHg; 6) Chống phù não: Manitol 0.25-1g/kg, dexamethasone trong một số trường hợp.",
    retrieved_doc_ids: ["doc-01", "doc-07", "doc-12"],
    linked_detection_id: "res-CASE-20241121-001-1",
    created_at: "2024-11-21T08:50:00Z",
  },
  {
    id: "rag2",
    user_id: "u1",
    query_text: "Dấu hiệu lâm sàng cần phân biệt SAH và migraine",
    answer_text: "Phân biệt xuất huyết dưới nhện (SAH) và migraine là thách thức lâm sàng. Các dấu hiệu ủng hộ SAH: 1) Đau đầu 'sét đánh' (thunderclap) — khởi phát đột ngột, đạt đỉnh <1 phút; 2) Đây là 'đau đầu tệ nhất đời'; 3) Cứng gáy, sợ ánh sáng, buồn nôn; 4) Mất ý thức thoáng qua; 5) Dấu thần kinh khu trú. Nếu nghi SAH → CT scan ngay (độ nhạy 98% trong 12 giờ đầu); nếu CT âm tính → chọc dịch não tủy. Không trì hoãn điều trị nếu lâm sàng gợi ý SAH dù CT âm tính.",
    retrieved_doc_ids: ["doc-03", "doc-09"],
    created_at: "2024-11-21T09:10:00Z",
  },
];

const makeScans = (caseId: string, count: number, hasHemo: boolean, type: string, conf: number, mrId?: string): ScanImage[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `scan-${caseId}-${i + 1}`,
    case_id: caseId,
    medical_record_id: mrId,
    file_path: `/dicom/${caseId}/slice_${String(i + 1).padStart(3, "0")}.dcm`,
    uploaded_by: "u1",
    uploaded_at: "2024-11-21T08:30:00Z",
    status: "done" as ScanStatus,
    result: {
      id: `res-${caseId}-${i + 1}`,
      scan_image_id: `scan-${caseId}-${i + 1}`,
      has_hemorrhage: hasHemo && i >= Math.floor(count * 0.3) && i <= Math.floor(count * 0.7),
      hemorrhage_type: hasHemo ? type : "",
      location: hasHemo ? "Thuỳ trán trái" : "",
      volume_mm3: hasHemo ? 4200 + i * 120 : 0,
      confidence: hasHemo ? conf - i * 0.3 : 0,
      priority_level: (hasHemo && conf > 70 ? (conf > 90 ? "emergency" : "review") : "none") as PriorityLevel,
      spread_prediction: hasHemo ? "Không lan rộng" : "",
      heatmap_path: `/heatmaps/${caseId}/heatmap_${i + 1}.png`,
      created_at: "2024-11-21T08:42:00Z",
      review_status: "pending" as ReviewStatus,
    },
  }));

export const MOCK_CASES: Case[] = [
  {
    id: "CASE-20241121-001",
    created_at: "2024-11-21T08:30:00Z",
    priority_level: "emergency",
    review_status: "pending",
    scan_count: 48,
    patient_name: "Nguyễn Văn An",
    medical_record_id: "mr1",
    scans: makeScans("CASE-20241121-001", 48, true, "Epidural", 94.2, "mr1"),
  },
  {
    id: "CASE-20241121-002",
    created_at: "2024-11-21T07:15:00Z",
    priority_level: "review",
    review_status: "pending",
    scan_count: 32,
    patient_name: "Trần Thị Bình",
    medical_record_id: "mr2",
    scans: makeScans("CASE-20241121-002", 32, true, "Subdural", 78.5, "mr2"),
  },
  {
    id: "CASE-20241121-003",
    created_at: "2024-11-21T06:00:00Z",
    priority_level: "none",
    review_status: "confirmed",
    reviewed_by: "u2",
    reviewed_at: "2024-11-21T06:45:00Z",
    doctor_note: "Không có xuất huyết. Theo dõi thêm.",
    scan_count: 24,
    patient_name: "Lê Văn Cường",
    medical_record_id: "mr3",
    scans: makeScans("CASE-20241121-003", 24, false, "", 0, "mr3"),
  },
  {
    id: "CASE-20241120-004",
    created_at: "2024-11-20T22:30:00Z",
    priority_level: "emergency",
    review_status: "confirmed",
    reviewed_by: "u1",
    reviewed_at: "2024-11-20T23:10:00Z",
    doctor_note: "Xuất huyết nặng vùng trán. Đã chỉ định phẫu thuật.",
    scan_count: 56,
    patient_name: "Phạm Thị Dung",
    medical_record_id: "mr4",
    scans: makeScans("CASE-20241120-004", 56, true, "Intraparenchymal", 91.3, "mr4"),
  },
  {
    id: "CASE-20241120-005",
    created_at: "2024-11-20T19:20:00Z",
    priority_level: "review",
    review_status: "rejected",
    reviewed_by: "u1",
    reviewed_at: "2024-11-20T20:00:00Z",
    doctor_note: "Không đủ chất lượng ảnh. Yêu cầu chụp lại.",
    scan_count: 18,
    scans: makeScans("CASE-20241120-005", 18, true, "Subarachnoid", 72.1),
  },
  {
    id: "CASE-20241120-006",
    created_at: "2024-11-20T16:00:00Z",
    priority_level: "none",
    review_status: "confirmed",
    reviewed_by: "u2",
    reviewed_at: "2024-11-20T16:40:00Z",
    scan_count: 40,
    scans: makeScans("CASE-20241120-006", 40, false, "", 0),
  },
];

export const MOCK_ALERTS: Alert[] = [
  { id: "alert-1", case_id: "CASE-20241121-001", sent_to: "u1", sent_at: "2024-11-21T08:43:00Z", acknowledged: false },
  { id: "alert-2", case_id: "CASE-20241120-004", sent_to: "u1", sent_at: "2024-11-20T22:31:00Z", acknowledged: true },
];

export const MOCK_SYSTEM_CONFIG = {
  confidence_threshold: 70,
  emergency_threshold: 90,
  auto_alert: true,
  fallback_on_no_duty: true,
};

export const MOCK_AUDIT_LOGS = [
  { id: "log1", user_id: "u1", action: "CASE_CONFIRMED", detail: { case_id: "CASE-20241120-004" }, created_at: "2024-11-20T23:10:00Z" },
  { id: "log2", user_id: "u4", action: "CONFIG_UPDATED", detail: { key: "confidence_threshold", old: 75, new: 70 }, created_at: "2024-11-20T10:00:00Z" },
  { id: "log3", user_id: "u2", action: "CASE_CONFIRMED", detail: { case_id: "CASE-20241121-003" }, created_at: "2024-11-21T06:45:00Z" },
  { id: "log4", user_id: "u1", action: "LOGIN", detail: { ip: "192.168.1.42" }, created_at: "2024-11-21T08:00:00Z" },
  { id: "log5", user_id: "u4", action: "USER_CREATED", detail: { username: "bs.hoang.mai" }, created_at: "2024-11-21T09:00:00Z" },
];
