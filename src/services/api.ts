import type { Case, PriorityLevel, ReviewStatus, User } from "../data/mockData";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
type JsonRecord = Record<string, unknown>;

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function field(record: JsonRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function getApiErrorMessage(status: number, body: unknown, statusText: string): string {
  const raw = typeof body === "string"
    ? body
    : isRecord(body)
      ? String(field(body, "message", "title", "detail") ?? "")
      : "";

  // Do not display ASP.NET exception pages: they can contain stack traces and request details.
  if (/AmbiguousMatchException|matched multiple endpoints/i.test(raw)) {
    return "Backend trả lỗi định tuyến API. Kiểm tra route của endpoint trong backend và thử lại.";
  }
  if (status === 401) return "Sai tên đăng nhập hoặc mật khẩu, hoặc phiên đăng nhập đã hết hạn.";
  if (status === 403) return "Tài khoản không có quyền thực hiện thao tác này.";
  if (status >= 500) return `Máy chủ API gặp lỗi (${status}). Chi tiết lỗi máy chủ đã được ẩn.`;
  if (status === 404) return "Không tìm thấy API hoặc dữ liệu yêu cầu (404). Kiểm tra endpoint và mã Ca.";

  const plainMessage = raw.trim();
  if (plainMessage && plainMessage.length <= 240 && !/<[^>]+>/.test(plainMessage)) return plainMessage;
  return `Yêu cầu API thất bại (${status})${statusText ? `: ${statusText}` : "."}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("Không kết nối được API. Chạy backend và kiểm tra VITE_API_PROXY_TARGET hoặc VITE_API_BASE_URL.");
  }

  const text = response.status === 204 ? "" : await response.text();
  let body: unknown;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }
  if (!response.ok) throw new ApiError(getApiErrorMessage(response.status, body, response.statusText), response.status);
  return body as T;
}

/** AuthController expects { Name, Password } and sets an authentication cookie on success. */
export async function login(name: string, password: string): Promise<void> {
  await request<void>("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify({ Name: name, Password: password }),
  });
}

export async function logout(): Promise<void> {
  await request<void>("/api/Auth/logout", { method: "POST" });
}

export interface DashboardCase extends Case {
  apiId?: number;
}

function parsePriority(value: unknown): PriorityLevel {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized.includes("emergency") || normalized.includes("urgent")) return "emergency";
    if (normalized.includes("review")) return "review";
    return "none";
  }
  if (typeof value === "number") return value >= 2 ? "emergency" : value === 1 ? "review" : "none";
  return "none";
}

function parseReviewStatus(value: unknown): ReviewStatus {
  const status = isRecord(value) ? String(field(value, "name", "Name") ?? "") : String(value ?? "");
  const normalized = status.toLowerCase();
  if (normalized.includes("denied") || normalized.includes("reject")) return "rejected";
  if (normalized.includes("confirm") || normalized === "approved") return "confirmed";
  // PBL6's Done status means model processing is complete and the case awaits clinician review.
  return "pending";
}

export function mapApiCase(value: unknown, fallbackId?: number): DashboardCase {
  const record = isRecord(value) ? value : {};
  const patientValue = field(record, "patient", "Patient");
  const patient = isRecord(patientValue) ? patientValue : {};
  const imagesValue = field(record, "images", "Images", "scans", "Scans");
  const images = Array.isArray(imagesValue) ? imagesValue : [];
  const rawId = field(record, "id", "Id", "caseId", "CaseId") ?? fallbackId;
  const apiId = typeof rawId === "number"
    ? rawId
    : typeof rawId === "string" && /^\d+$/.test(rawId) ? Number(rawId) : undefined;

  return {
    id: rawId === undefined ? "—" : String(rawId),
    apiId,
    created_at: String(field(record, "createdAt", "CreatedAt", "created_at") ?? ""),
    priority_level: parsePriority(field(record, "priorityLevel", "PriorityLevel", "priority_level")),
    review_status: parseReviewStatus(field(record, "reviewStatus", "ReviewStatus", "status", "Status")),
    reviewed_at: field(record, "reviewedAt", "ReviewedAt") as string | undefined,
    doctor_note: String(field(record, "note", "Note", "doctorNote") ?? "") || undefined,
    patient_name: String(field(patient, "name", "Name", "fullName", "FullName") ?? "") || undefined,
    scan_count: images.length,
    scans: images.map((image, index) => {
      const scan = isRecord(image) ? image : {};
      return {
        id: String(field(scan, "id", "Id") ?? `scan-${index}`),
        case_id: String(rawId ?? ""),
        file_path: String(field(scan, "filePath", "FilePath", "file_path") ?? ""),
        uploaded_by: String(field(scan, "uploaderId", "UploaderId") ?? ""),
        uploaded_at: "",
        status: "done" as const,
      };
    }),
  };
}

function responseRows(response: unknown): unknown[] {
  if (Array.isArray(response)) return response;
  if (isRecord(response)) {
    const rows = field(response, "items", "cases", "data");
    if (Array.isArray(rows)) return rows;
  }
  throw new ApiError("API Queue trả về dữ liệu không đúng định dạng.");
}

/** PBL6 exposes named queue routes; ProcDone is the model-complete review queue. */
export async function getDashboardCases(): Promise<DashboardCase[]> {
  const response = await request<unknown>("/api/Queue/ProcDone");
  return responseRows(response).map(item => mapApiCase(item));
}

export async function getCaseDetails(id: number): Promise<DashboardCase> {
  return mapApiCase(await request<unknown>(`/api/Case/${id}`), id);
}

/**
 * PBL6 has approve/deny POST routes. Its current backend implementation does not
 * persist Deny, and Approve sets status to Done rather than Confirmed; see README.
 */
export async function submitCaseReview(id: number, decision: "confirmed" | "rejected", note: string): Promise<void> {
  await request<void>(`/api/Case/${id}/${decision === "confirmed" ? "approve" : "deny"}`, {
    method: "POST",
    body: JSON.stringify(note),
  });
}

/** Login currently returns no user profile, so use the entered name and selected portal for display only. */
export function sessionUser(name: string, role: "doctor" | "admin"): User {
  return {
    id: name,
    username: name,
    full_name: name,
    role,
    department: "",
    shift_status: "off_duty",
    is_active: true,
    created_at: new Date().toISOString(),
  };
}
