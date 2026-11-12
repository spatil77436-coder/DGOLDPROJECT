
const API_URL =
  (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env
    .VITE_API_URL || "http://localhost:5000/api/v1";

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
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (response.status === 401 && retryAuth && endpoint !== "/auth/refresh") {
    try {
      await apiRequest("/auth/refresh", { method: "POST" }, false);
      return apiRequest<T>(endpoint, options, false);
    } catch {
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
