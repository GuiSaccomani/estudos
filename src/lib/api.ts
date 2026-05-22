const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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
