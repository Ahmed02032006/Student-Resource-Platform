import { apiFetch } from './apiClient';

// ── Account Management ──────────────────────────────────────────────────────────

/** GET /api/admin/accounts?status=pending */
export const fetchAccounts = (status) =>
  apiFetch('/admin/accounts', { params: { status } });

/** PATCH /api/admin/accounts/:id */
export const updateAccount = (id, { action, reason, canReapply }) =>
  apiFetch(`/admin/accounts/${id}`, {
    method: 'PATCH',
    body: { action, reason, canReapply },
  });

/** PATCH /api/admin/users/:id - Update user details */
export const updateUserDetails = (id, userData) =>
  apiFetch(`/admin/users/${id}`, {
    method: 'PATCH',
    body: userData,
  });

/** DELETE /api/admin/users/:id - Delete user */
export const deleteUser = (id) =>
  apiFetch(`/admin/users/${id}`, {
    method: 'DELETE',
  });

// ── Enrollment Management ───────────────────────────────────────────────────────

/** GET /api/admin/enrollments?status=... */
export const fetchAdminEnrollments = (status) =>
  apiFetch('/admin/enrollments', { params: { status } });

/** PATCH /api/admin/enrollments/:id */
export const updateEnrollment = (id, { action, reason }) =>
  apiFetch(`/admin/enrollments/${id}`, {
    method: 'PATCH',
    body: { action, reason },
  });

// ── Course & Resource Management ────────────────────────────────────────────────

/** POST /api/admin/courses */
export const createCourse = ({ courseId, courseCode, courseName, semesterId }) =>
  apiFetch('/admin/courses', {
    method: 'POST',
    body: { courseId, courseCode, courseName, semesterId },
  });

/** PATCH /api/admin/courses/:id - Update course */
export const updateCourse = (id, courseData) =>
  apiFetch(`/admin/courses/${id}`, {
    method: 'PATCH',
    body: courseData,
  });

/** DELETE /api/admin/courses/:id - Delete course */
export const deleteCourse = (id) =>
  apiFetch(`/admin/courses/${id}`, {
    method: 'DELETE',
  });

/** GET /api/admin/courses/:id/upload-signature */
export const getUploadSignature = (courseId) =>
  apiFetch(`/admin/courses/${courseId}/upload-signature`);

/** POST /api/admin/courses/:id/resources */
export const addResource = (courseId, { title, type, cloudinaryPublicId, cloudinaryUrl }) =>
  apiFetch(`/admin/courses/${courseId}/resources`, {
    method: 'POST',
    body: { title, type, cloudinaryPublicId, cloudinaryUrl },
  });

// ── Activity Log ────────────────────────────────────────────────────────────────

/** GET /api/admin/activity?page=&limit=&action=&userId= */
export const fetchActivityLog = ({ page, limit, action, userId } = {}) =>
  apiFetch('/admin/activity', { params: { page, limit, action, userId } });