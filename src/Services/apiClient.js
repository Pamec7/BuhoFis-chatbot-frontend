const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function buildUrl(path) {
  if (!RAW_BASE_URL) throw new Error("VITE_API_BASE_URL no está definido.");
  const base = RAW_BASE_URL.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function apiFetch(path, { method = "GET", body, headers, signal } = {}) {
  const res = await fetch(buildUrl(path), {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${text}`);
  }

  return res;
}
