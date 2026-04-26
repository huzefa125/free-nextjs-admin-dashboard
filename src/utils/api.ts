const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  private static getHeaders(headers?: HeadersInit): HeadersInit {
    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json"
    };

    const token = this.getToken();
    if (token) {
      return {
        ...defaultHeaders,
        Authorization: `Bearer ${token}`,
        ...headers
      };
    }

    return {
      ...defaultHeaders,
      ...headers
    };
  }

  static async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(options.headers)
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static async post<T>(
    endpoint: string,
    data?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  static async put<T>(
    endpoint: string,
    data?: Record<string, any>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Export specific API methods for easier use
export const authApi = {
  register: (email: string, password: string, name: string) =>
    ApiClient.post("/api/auth/register", { email, password, name }),

  login: (email: string, password: string) =>
    ApiClient.post("/api/auth/login", { email, password }),

  getProfile: () => ApiClient.get("/api/auth/profile"),

  updateProfile: (data: Record<string, any>) =>
    ApiClient.put("/api/auth/profile", data),

  changePassword: (oldPassword: string, newPassword: string) =>
    ApiClient.post("/api/auth/change-password", { oldPassword, newPassword }),

  verifyToken: () => ApiClient.get("/api/auth/verify")
};
