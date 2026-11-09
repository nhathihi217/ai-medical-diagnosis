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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(
      `Không thể kết nối API (${API_BASE_URL || "cùng origin"}). Kiểm tra backend và cấu hình VITE_API_BASE_URL.`,
    );
  }

  const text = response.status === 204 ? "" : await response.text();
  let body: unknown;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message = typeof body === "string"
      ? body
      : isRecord(body)
        ? String(field(body, "message", "title", "detail") ?? response.statusText)
        : response.statusText;
    throw new ApiError(message || `Yêu cầu thất bại (${response.status}).`, response.status);
  }

  return body as T;
}

export async function login(name: string, password: string): Promise<void> {
  // PBL6 AuthController signs in using an HTTP-only cookie and returns an empty 200 response.
  await request<void>("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify({ name, password }),
  });
}

export async function logout(): Promise<void> {
  await request<void>("/api/Auth/logout", { method: "POST" });
}

export interface DashboardCase extends Case {
  /** Numeric ID used by GET /api/Case/{id}; absent from the current backend queue DTO. */
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
  return "pending";
}

export function mapApiCase(value: unknown): DashboardCase {
  const record = isRecord(value) ? value : {};
  const patientValue = field(record, "patient", "Patient");
  const patient = isRecord(patientValue) ? patientValue : {};
  const imagesValue = field(record, "images", "Images", "scans", "Scans");
  const images = Array.isArray(imagesValue) ? imagesValue : [];
  const rawId = field(record, "id", "Id", "caseId", "CaseId");
  const apiId = typeof rawId === "number" ? rawId : typeof rawId === "string" && /^\d+$/.test(rawId) ? Number(rawId) : undefined;
  const status = field(record, "reviewStatus", "ReviewStatus", "status", "Status");

  return {
    id: rawId === undefined ? "" : String(rawId),
    apiId,
    created_at: String(field(record, "createdAt", "CreatedAt", "created_at") ?? ""),
    priority_level: parsePriority(field(record, "priorityLevel", "PriorityLevel", "priority_level")),
    review_status: parseReviewStatus(status),
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

export async function getDashboardCases(): Promise<DashboardCase[]> {
  const response = await request<unknown>("/api/Queue");
  const rows = Array.isArray(response)
    ? response
    : isRecord(response) && Array.isArray(field(response, "items", "cases", "data"))
      ? field(response, "items", "cases", "data") as unknown[]
      : null;
  if (!rows) throw new ApiError("API Queue trả về dữ liệu không đúng định dạng.");
  return rows.map(mapApiCase);
}

export async function getCaseDetails(id: number): Promise<DashboardCase> {
  const response = await request<unknown>(`/api/Case/${id}`);
  return mapApiCase(response);
}

export async function submitCaseReview(id: number, decision: "confirmed" | "rejected", note: string): Promise<void> {
  await request<void>(`/api/Case/${id}/${decision === "confirmed" ? "approve" : "deny"}`, {
    method: "POST",
    body: JSON.stringify(note),
  });
}

/** AuthController doesn't return a user DTO; keep only the identity needed by the existing shell. */
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
