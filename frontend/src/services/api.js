const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const token = localStorage.getItem("cloudplay_access_token");

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = "Request failed";

    try {
      const data = await response.json();
      detail = data.detail || detail;
    } catch {}

    throw new Error(detail);
  }

  return response.json();
}

export function getCurrentUser() {
  return request("/api/cloud-pc/me");
}

export function getCloudPCStatus() {
  return request("/api/cloud-pc/status");
}

export function startCloudPC() {
  return request("/api/cloud-pc/start", {
    method: "POST",
  });
}

export function stopCloudPC() {
  return request("/api/cloud-pc/stop", {
    method: "POST",
  });
}

export function getGames() {
  return request("/api/games/");
}


/* =========================
   CLOUDPLAY SESSION APIs
   ========================= */

export function startSession() {
  return request("/api/session/start", {
    method: "POST",
  });
}

export function getMySession() {
  return request("/api/session/me");
}

export function endSession() {
  return request("/api/session/end", {
    method: "POST",
  });
}