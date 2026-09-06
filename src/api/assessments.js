import { apiFetch } from './apiClient';

/** GET /api/assessments?courseId=&upcoming=&limit= */
export const fetchAssessments = (params = {}) =>
    apiFetch('/assessments', { params });

/** POST /api/assessments */
export const createAssessment = (data) =>
    apiFetch('/assessments', {
        method: 'POST',
        body: data,
    });

/** PATCH /api/assessments/:id */
export const updateAssessment = (id, data) =>
    apiFetch(`/assessments/${id}`, {
        method: 'PATCH',
        body: data,
    });

/** DELETE /api/assessments/:id */
export const deleteAssessment = (id) =>
    apiFetch(`/assessments/${id}`, {
        method: 'DELETE',
    });