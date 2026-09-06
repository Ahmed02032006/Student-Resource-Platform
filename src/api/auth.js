import { apiFetch } from './apiClient';

/** POST /api/auth/register */
export const registerUser = ({ name, email, password, semester }) =>
  apiFetch('/auth/register', {
    method: 'POST',
    body: { name, email, password, semester },
  });

/** POST /api/auth/login */
export const loginUser = ({ email, password }) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

/** GET /api/auth/me — validate stored JWT & retrieve user profile */
export const getMe = () => apiFetch('/auth/me');
