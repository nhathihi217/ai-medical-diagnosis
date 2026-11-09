const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");

export type ApiHttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = "Yêu cầu thất bại";
    try {
      const payload = await response.json();
      if (typeof payload === "string") {
        message = payload;
      } else if (payload && typeof payload === "object") {
        const candidate = (payload as Record<string, unknown>).message ?? (payload as Record<string, unknown>).error ?? (payload as Record<string, unknown>).title;
        if (typeof candidate === "string") message = candidate;
      }
    } catch {
      // ignore JSON parse failures
    }
    throw new Error(message);
  }

  if (response.status === 204) return null as T;
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

export async function loginWithBackend(username: string, password: string) {
  return apiFetch<{ ok?: boolean }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ name: username, password }),
  });
}

export async function logoutFromBackend() {
  return apiFetch<{ ok?: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export async function getPendingQueue() {
  return apiFetch<Array<{
    id: number | string;
    priorityLevel?: number | string;
    createdAt?: string;
    reviewedAt?: string;
    note?: string;
    patient?: { name?: string; cccd?: string };
    reviewStatus?: { name?: string };
    statusId?: number;
  }>>("/api/queue");
}

export async function getCaseById(caseId: string | number) {
  return apiFetch<any>(`/api/case/${caseId}`);
}

export async function approveCase(caseId: string | number, note: string) {
  return apiFetch<any>(`/api/case/${caseId}/approve`, {
    method: "POST",
    body: JSON.stringify(note ?? ""),
  });
}

export async function denyCase(caseId: string | number, note: string) {
  return apiFetch<any>(`/api/case/${caseId}/deny`, {
    method: "POST",
    body: JSON.stringify(note ?? ""),
  });
}
