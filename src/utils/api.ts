export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

class ApiClient {
  getToken(): string | null {
    return localStorage.getItem("shazo_admin_token");
  }

  setToken(token: string) {
    localStorage.setItem("shazo_admin_token", token);
  }

  logout(expired: boolean = false) {
    localStorage.removeItem("shazo_admin_token");
    localStorage.removeItem("shazo_admin_user");
    if (expired) {
      localStorage.setItem("shazo_session_expired", "true");
    } else {
      localStorage.removeItem("shazo_session_expired");
    }
    window.location.hash = "#login";
    window.dispatchEvent(new CustomEvent("shazo_auth_change"));
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("shazo_admin_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: any) {
    localStorage.setItem("shazo_admin_user", JSON.stringify(user));
  }

  private async request<T = any>(
    path: string,
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
    body?: any
  ): Promise<T> {
    // Generate clean relative or absolute request URL
    const isAbsolute = path.startsWith("http://") || path.startsWith("https://");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = isAbsolute ? path : `${API_BASE}${cleanPath}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token && token !== "undefined" && token !== "null") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.info("[Shazo Admin] API request auth", {
      path,
      hasToken: Boolean(token && token !== "undefined" && token !== "null")
    });

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // On authorization failure, immediately logout and raise the alarm
      if (response.status === 401) {
        this.logout(true);
        throw new Error("UNAUTHORIZED");
      }

      if (response.status === 404) {
        throw new Error("NOT_IMPLEMENTED");
      }

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error?.message || resJson.message || `API error (status: ${response.status})`);
      }

      return resJson.data !== undefined ? resJson.data : resJson;
    } catch (err: any) {
      console.warn(`[API CLIENT ERROR] ${method} ${path}:`, err.message);
      throw err;
    }
  }

  async get<T = any>(path: string): Promise<T> {
    return this.request<T>(path, "GET");
  }

  async post<T = any>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, "POST", body);
  }

  async patch<T = any>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, "PATCH", body);
  }

  async delete<T = any>(path: string): Promise<T> {
    return this.request<T>(path, "DELETE");
  }
}

export const api = new ApiClient();
