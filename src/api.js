const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'vivrose.token';

let token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) || '' : '';

export function setToken(next) {
  token = next;
  if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEY, next);
}

export function clearToken() {
  token = '';
  if (typeof window !== 'undefined') window.localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  return token;
}

async function request(path, options = {}) {
  if (typeof window === 'undefined') {
    throw new Error('API unavailable during SSR');
  }
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': isForm ? undefined : 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body === undefined ? undefined
      : isForm ? options.body
        : typeof options.body === 'string' ? options.body
          : JSON.stringify(options.body),
  });
  if (res.status === 204) return null;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

export const apiGet = (path) => request(path);
export const apiPost = (path, body) => request(path, { method: 'POST', body });
export const apiPut = (path, body) => request(path, { method: 'PUT', body });
export const apiDelete = (path) => request(path, { method: 'DELETE' });

export function apiUpload(path, formData) {
  return request(path, { method: 'POST', body: formData });
}
