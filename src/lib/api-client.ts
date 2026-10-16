export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "development" ? "http://localhost:4000" : ""))
  .replace(/\/+$/, "");

export function apiUrl(path: string) {
  if (!API_BASE_URL) throw new Error("Configure NEXT_PUBLIC_API_URL com a URL pública da API.");
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });
}
