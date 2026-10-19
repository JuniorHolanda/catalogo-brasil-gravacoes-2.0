export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!normalizedPath.startsWith("/api/")) throw new Error("Caminho de API inválido.");
  return normalizedPath;
}

export function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(apiUrl(path), {
    ...init,
    credentials: "include",
  });
}
