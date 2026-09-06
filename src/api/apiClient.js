const BASE_URL = 'https://student-resource-platform-backend.vercel.app/api';

/**
 * Core fetch wrapper.
 * @param {string} endpoint  — e.g. '/auth/login'
 * @param {object} options   — { method, body, headers, params }
 * @returns {Promise<object>} parsed JSON response
 */
export async function apiFetch(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, params } = options;

  // Build URL with query params
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (qs) url += `?${qs}`;
  }

  console.log(`📡 ${method} ${url}`);

  // Attach JWT if present
  const token = localStorage.getItem('token');
  const fetchHeaders = { ...headers };
  if (token) {
    fetchHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Auto-set Content-Type for JSON bodies (skip for FormData)
  if (body && !(body instanceof FormData)) {
    fetchHeaders['Content-Type'] = 'application/json';
  }

  console.log('📤 Request headers:', fetchHeaders);
  if (body && !(body instanceof FormData)) {
    console.log('📤 Request body:', body);
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch (netErr) {
    console.error('❌ Network error:', netErr);
    throw {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please ensure the backend server is running.',
    };
  }

  // Parse response
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  console.log(`📥 Response [${res.status}]:`, data);

  // Global 401 handler — clear auth and redirect
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Only redirect if we're not already on auth pages
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      window.location.href = '/login';
    }
    throw { status: 401, code: data?.code || 'UNAUTHORIZED', message: data?.message || 'Session expired.' };
  }

  // Throw on non-2xx
  if (!res.ok) {
    console.error(`❌ API Error [${res.status}]:`, data);
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