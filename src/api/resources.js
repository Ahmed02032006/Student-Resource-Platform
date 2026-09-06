import { apiFetch } from './apiClient';

/** GET /api/courses/:id/resources */
export const fetchCourseResources = (courseId) =>
  apiFetch(`/courses/${courseId}/resources`);

/** GET /api/resources/:id/access?download=true|false */
export const fetchResourceAccess = (resourceId, download = false) =>
  apiFetch(`/resources/${resourceId}/access`, {
    params: { download: download ? 'true' : 'false' },
  });
