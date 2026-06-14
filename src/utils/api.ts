export interface APIResponse<T = any> {
  success: boolean;
  ok?: boolean;
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

  private buildUrl(path: string): string {
    const isAbsolute = path.startsWith("http://") || path.startsWith("https://");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    const baseUrl = isAbsolute ? path : `${API_BASE}${cleanPath}`;

    // Cache-buster for GET requests so Cloudflare/browser does not reuse stale admin API data.
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}_=${Date.now()}`;
  }

  private async request<T = any>(
    path: string,
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
    body?: any
  ): Promise<T> {
    const isAbsolute = path.startsWith("http://") || path.startsWith("https://");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const baseUrl = isAbsolute ? path : `${API_BASE}${cleanPath}`;

    const url =
      method === "GET"
        ? this.buildUrl(path)
        : baseUrl;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };

    const token = this.getToken();
    if (token && token !== "undefined" && token !== "null") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.info("[Shazo Admin] API request auth", {
      path,
      url,
      hasToken: Boolean(token && token !== "undefined" && token !== "null"),
    });

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });

      if (response.status === 401) {
        this.logout(true);
        throw new Error("UNAUTHORIZED");
      }

      if (response.status === 404) {
        throw new Error("NOT_IMPLEMENTED");
      }

      const contentType = response.headers.get("content-type") || "";
      const resJson = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        throw new Error(
          resJson.error?.message ||
            resJson.message ||
            `API error (status: ${response.status})`
        );
      }

      const payload = resJson.data !== undefined ? resJson.data : resJson;

      // Most admin list endpoints return { items, total }.
      // Existing UI tables expect arrays, so unwrap items globally.
      if (
        payload &&
        typeof payload === "object" &&
        Array.isArray(payload.items)
      ) {
        return payload.items as T;
      }

      return payload as T;
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

  async put<T = any>(path: string, body?: any): Promise<T> {
    return this.request<T>(path, "PUT", body);
  }

  async delete<T = any>(path: string): Promise<T> {
    return this.request<T>(path, "DELETE");
  }
}

export const api = new ApiClient();
