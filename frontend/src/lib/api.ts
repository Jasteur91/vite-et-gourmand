const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

let authToken: string | null = localStorage.getItem('vg_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('vg_token', token);
  else localStorage.removeItem('vg_token');
}

export function getToken(): string | null {
  return authToken;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const ctype = res.headers.get('content-type') || '';
  const body = ctype.includes('application/json') ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const err = typeof body === 'object' && body && 'error' in body ? (body as any).error : `Erreur ${res.status}`;
    const details = typeof body === 'object' && body && 'details' in body ? (body as any).details : undefined;
    throw new ApiError(res.status, err, details);
  }
  return body as T;
}

export const $ = {
  get:    <T>(p: string) => api<T>(p),
  post:   <T>(p: string, b?: unknown) => api<T>(p, { method: 'POST', body: b !== undefined ? JSON.stringify(b) : undefined }),
  patch:  <T>(p: string, b?: unknown) => api<T>(p, { method: 'PATCH', body: b !== undefined ? JSON.stringify(b) : undefined }),
  delete: <T>(p: string) => api<T>(p, { method: 'DELETE' }),
};
