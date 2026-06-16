const configuredApiUrl = process.env.REACT_APP_API_URL?.trim().replace(/\/+$/, "");

function resolveApiUrl() {
  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const { hostname, origin } = window.location;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  // When the frontend is opened from another device on the local network,
  // reuse the same host and assume the backend is exposed on port 5000.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return `http://${hostname}:5000`;
  }

  return origin;
}

export const API_URL = resolveApiUrl();

export function getCategoryLabel(category: "lost" | "found") {
  return category === "lost" ? "Robado" : "Recuperado";
}
