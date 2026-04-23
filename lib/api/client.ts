import Cookies from "js-cookie";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || Cookies.get("token") || null;
};

export interface ApiClientOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T>(
  url: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
    ...fetchOptions.headers,
  };

  let response;
  try {
    response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      {
        ...fetchOptions,
        headers,
        credentials: "include",
      }
    );
  } catch (networkError) {
    console.error("Network error:", networkError);
    throw new Error("Unable to connect to server. Please check your connection.");
  }

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      Cookies.remove("token");
      Cookies.remove("user");
      window.location.href = "/auth/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  try {
    return await response.json();
  } catch {
    return {} as T;
  }
}

export const api = {
  get: <T>(url: string, options?: ApiClientOptions) =>
    apiClient<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, data?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  patch: <T>(url: string, data?: unknown, options?: ApiClientOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(url: string, options?: ApiClientOptions) =>
    apiClient<T>(url, { ...options, method: "DELETE" }),
};

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthToken(): string | null {
  return getToken();
}