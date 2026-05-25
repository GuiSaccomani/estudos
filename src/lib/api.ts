const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const FALLBACK_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://estudos-1vyp.onrender.com"
    : "http://localhost:4000";
const API_BASE = (RAW_API_BASE || FALLBACK_API_BASE).replace(/\/+$/, "");

export async function apiFetch<T>(path: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erro na API");
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export type ApiError = {
  message: string;
};
