import { apiFetch } from './apiClient';

/** GET /api/enrollments/me */
export const fetchMyEnrollments = () => apiFetch('/enrollments/me');

/** POST /api/enrollments */
export const requestEnrollment = (courseId) =>
  apiFetch('/enrollments', {
    method: 'POST',
    body: { courseId },
  });
