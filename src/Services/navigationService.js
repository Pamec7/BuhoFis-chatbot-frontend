import { apiFetch } from "./apiClient";

export async function getNavigationRoot() {
  const res = await apiFetch("/navigation", { method: "GET" });
  return res.json(); 
}

export async function getNavigationNext(path) {
  const res = await apiFetch("/navigation/next", {
    method: "POST",
    body: { path },
  });
  return res.json(); 
}
