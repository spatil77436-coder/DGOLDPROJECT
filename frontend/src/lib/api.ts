
const API_URL =
  (import.meta as ImportMeta & { env: { _API_key_URL?: string; VITE_API_URL?: string } }).env
    ._API_key_URL ||
  (import.meta as ImportMeta & { env: { _API_key_URL?: string; VITE_API_URL?: string } }).env
    .VITE_API_URL ||
  "https://dgoldproject-hxco.onrender.com/api/v1";

const TOKEN_KEY = "dgold_access_token";

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

interface ApiError {
  message?: string;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryAuth = true
): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 && retryAuth && endpoint !== "/auth/refresh") {
    try {
      const refreshed = await apiRequest<{ accessToken?: string }>("/auth/refresh", { method: "POST" }, false);
      if (refreshed?.accessToken) {
        setStoredToken(refreshed.accessToken);
      }
      return apiRequest<T>(endpoint, options, false);
    } catch {
      setStoredToken(null);
      // Preserve the original authentication error for the caller.
    }
  }

  // Handle empty responses, such as 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const error = result as ApiError | null;
    throw new ApiRequestError(error?.message || `API Error: ${response.status}`, response.status);
  }

  // Your Express backend uses an API response envelope:
  // { success, message, data }
  return result?.data as T;
}
