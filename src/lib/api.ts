// Detect the backend URL based on environment or fallback
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  // Fallback for local development
  return "http://localhost:5000/api";
};

export const API_BASE_URL = getBaseUrl();

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      // Handle unauthorized
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Something went wrong");
  }

  return response.json();
}

export const api = {
  get: (endpoint: string) => fetchWithAuth(endpoint, { method: "GET" }),
  post: (endpoint: string, data: any) => fetchWithAuth(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: (endpoint: string, data: any) => fetchWithAuth(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: (endpoint: string) => fetchWithAuth(endpoint, { method: "DELETE" }),
};
