const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
const KEY = "myday.tokens";
export interface Tokens { access_token: string; refresh_token: string }

// Tokens live in localStorage: simple, but readable by any XSS. See README for the production note.
export const tokens = {
  get(): Tokens | null { try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; } },
  set(t: Tokens) { localStorage.setItem(KEY, JSON.stringify(t)); },
  clear() { localStorage.removeItem(KEY); },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

let refreshing: Promise<boolean> | null = null;
async function refresh(): Promise<boolean> {
  const t = tokens.get();
  if (!t) return false;
  const res = await fetch(BASE + "/api/auth/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: t.refresh_token }) });
  if (!res.ok) return false;
  tokens.set(await res.json());
  return true;
}

export async function api<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const send = () => {
    const t = tokens.get();
    return fetch(BASE + path, {
      method: opts.method ?? "GET",
      headers: { ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}), ...(t ? { Authorization: `Bearer ${t.access_token}` } : {}) },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  };
  let res: Response;
  try { res = await send(); } catch { throw new ApiError("Can't reach the server. Check your connection and try again.", 0); }
  if (res.status === 401 && tokens.get()) {
    refreshing ??= refresh().finally(() => { refreshing = null; });
    if (await refreshing) res = await send();
    else { tokens.clear(); window.dispatchEvent(new Event("myday:logout")); }
  }
  if (!res.ok) {
    let msg = "Something went wrong. Please try again.";
    try {
      const j = await res.json();
      if (typeof j.detail === "string") msg = j.detail;
      else if (Array.isArray(j.detail) && j.detail[0]?.msg) msg = String(j.detail[0].msg).replace(/^Value error, /, "");
    } catch { /* keep default */ }
    throw new ApiError(msg, res.status);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
