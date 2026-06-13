import { supabase } from "./supabase";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const FALLBACK_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://estudos-1vyp.onrender.com"
    : "http://localhost:4000";
const API_BASE = (RAW_API_BASE || FALLBACK_API_BASE).replace(/\/+$/, "");

export async function apiFetch<T>(path: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-required"));
    }
  }

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
