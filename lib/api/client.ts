import Cookies from "js-cookie";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || Cookies.get("token") || null;
};

export interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * CORE API CLIENT
 */
export async function apiClient<T>(
  url: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const token = getToken();

  // 🔵 DEBUG: Token check
  console.log("🔐 TOKEN:", token);

  // Detect FormData to avoid setting Content-Type header
  const isFormData = fetchOptions.body instanceof FormData;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // 🔵 DEBUG: ENV + URL building
  console.log("🔵 NEXT_PUBLIC_API_URL:", baseUrl);
  console.log("🟡 REQUEST PATH:", url);
  console.log("🟡 FULL REQUEST URL:", `${baseUrl}${url}`);

   const headers: HeadersInit = {
     ...(!isFormData && { "Content-Type": "application/json" }),
     ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
     ...(fetchOptions.headers || {}),
   };

   // 🔵 DEBUG: Log headers (with token masked)
   const safeHeaders = { ...headers };
   if (safeHeaders.Authorization) {
     safeHeaders.Authorization = `Bearer [REDACTED]`;
   }
   console.log("🟡 REQUEST HEADERS:", safeHeaders);

  let response: Response;

  try {
    console.log("🚀 API REQUEST START");

    // 🔵 DEBUG: Log request body being sent
    console.log("🟡 REQUEST BODY:", fetchOptions.body);
    if (fetchOptions.body && typeof fetchOptions.body === "string") {
      try {
        console.log("🟡 REQUEST BODY (parsed):", JSON.parse(fetchOptions.body));
      } catch {
        console.log("🟡 REQUEST BODY (raw string):", fetchOptions.body);
      }
    }

    response = await fetch(`${baseUrl}${url}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });

    // 🔵 DEBUG: response info
    console.log("🟢 RESPONSE STATUS:", response.status);
    console.log("🟢 RESPONSE URL:", response.url);
  } catch (error) {
    console.error("❌ Network error:", error);
    throw new Error("Unable to connect to server. Please check your connection.");
  }

  // 🔐 Handle 401 globally
  if (response.status === 401) {
    console.log("⚠️ 401 Unauthorized - redirecting to login");

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Cookies.remove("token");
      Cookies.remove("user");
      window.location.href = "/auth/login";
    }

    throw new Error("Unauthorized");
  }

  // ❌ Handle non-OK responses safely
  if (!response.ok) {
    let message = `API Error: ${response.status}`;

    try {
      const errorText = await response.text();
      console.error("❌ ERROR RESPONSE TEXT:", errorText);

      const errorJson = JSON.parse(errorText);
      message = errorJson?.message || message;
    } catch {
      console.warn("⚠️ Non-JSON error response");
    }

    throw new Error(message);
  }

  // ✅ SAFE RESPONSE PARSING
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }

  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

/**
 * API WRAPPER
 */
export const api = {
  get: <T>(url: string, options?: ApiClientOptions) =>
    apiClient<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, data?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    }),

  patch: <T>(url: string, data?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "PATCH",
      body: data instanceof FormData ? data : JSON.stringify(data ?? {}),
    }),

  delete: <T>(url: string, options?: ApiClientOptions) =>
    apiClient<T>(url, { ...options, method: "DELETE" }),
};

/**
 * AUTH HELPERS
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthToken(): string | null {
  return getToken();
}