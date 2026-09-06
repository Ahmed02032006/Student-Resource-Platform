const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://student-resource-platform-backend.vercel.app/api';

export async function apiFetch(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, params } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const token = localStorage.getItem('token');
  const fetchHeaders = { ...headers };
  if (token) {
    fetchHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    fetchHeaders['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch (netErr) {
    console.error('Network error:', netErr);
    throw {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  // Log the response for debugging
  console.log(`API Response [${method} ${endpoint}]:`, { status: res.status, data });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
    throw { status: 401, code: data?.code || 'UNAUTHORIZED', message: data?.message || 'Session expired.' };
  }

  if (!res.ok) {
    console.error('API Error:', { status: res.status, data });
    throw {
      status: res.status,
      code: data?.code || 'API_ERROR',
      message: data?.message || 'Something went wrong.',
      rejectionInfo: data?.rejectionInfo || null,
      data: data?.data || null,
    };
  }

  return data;
}