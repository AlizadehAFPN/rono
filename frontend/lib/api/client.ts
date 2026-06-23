const API_BASE = "";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: unknown,
  ) {
    super(typeof detail === "string" ? detail : JSON.stringify(detail));
    this.name = "ApiError";
  }
}

async function parseError(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return res.statusText;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  // For multipart uploads (FormData) the browser must set Content-Type itself so
  // it can append the correct multipart boundary — never force application/json.
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options, false);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// The backend rotates refresh tokens: each /refresh revokes the old session and
// issues a new one (auth_service.py). So when a page fires several requests at
// once and the access token has expired, they ALL get 401 and would each call
// /refresh in parallel — the first rotates the token, the rest send the now-
// revoked one, fail, and trigger a spurious redirect to /login. Coalesce
// concurrent refreshes into a single in-flight request to avoid that race.
let refreshPromise: Promise<boolean> | null = null;

function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    }
  })();

  // Clear once settled so a later expiry can refresh again. Callers already
  // hold the promise reference, so clearing the slot doesn't affect them.
  void refreshPromise.finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  // Multipart upload. The FormData body is passed through untouched so the
  // browser sets the multipart Content-Type + boundary (see request()).
  putForm: <T>(path: string, form: FormData, options?: RequestInit) =>
    request<T>(path, { ...options, method: "PUT", body: form }),

  delete: <T = void>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
