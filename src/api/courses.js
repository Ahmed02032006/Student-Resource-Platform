import { apiFetch } from './apiClient';

/** GET /api/courses */
export const fetchCourses = () => apiFetch('/courses');

/** GET /api/courses/:id */
export const fetchCourse = (id) => apiFetch(`/courses/${id}`);
