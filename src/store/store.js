import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import coursesReducer from './coursesSlice';
import enrollmentReducer from './enrollmentSlice';
import activityReducer from './activitySlice';
import assessmentReducer from './assessmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    enrollment: enrollmentReducer,
    activity: activityReducer,
    assessments: assessmentReducer,
  }
});
