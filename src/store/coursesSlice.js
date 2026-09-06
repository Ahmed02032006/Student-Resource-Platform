import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as coursesApi from '../api/courses';
import * as resourcesApi from '../api/resources';

const normalizeError = (err) => {
  if (err instanceof Error) {
    return { status: 0, code: 'UNKNOWN_ERROR', message: err.message };
  }
  if (typeof err === 'object' && err !== null) {
    return {
      status: err.status || 0,
      code: err.code || 'API_ERROR',
      message: err.message || 'An error occurred.',
    };
  }
  return { status: 0, code: 'UNKNOWN_ERROR', message: String(err) };
};

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const fetchCoursesThunk = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await coursesApi.fetchCourses();
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchCourseDetailThunk = createAsyncThunk(
  'courses/fetchCourseDetail',
  async (id, { rejectWithValue }) => {
    try {
      const res = await coursesApi.fetchCourse(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchCourseResourcesThunk = createAsyncThunk(
  'courses/fetchCourseResources',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await resourcesApi.fetchCourseResources(courseId);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

const initialState = {
  list: [],
  selectedCourse: null,
  resources: [],
  isLoading: false,
  isResourcesLoading: false,
  error: null,
};

export const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    selectCourse: (state, action) => {
      state.selectedCourse = state.list.find((c) => (c._id || c.id) === action.payload) || null;
    },
    clearCourseResources: (state) => {
      state.resources = [];
      state.isResourcesLoading = false;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Courses ──
    builder
      .addCase(fetchCoursesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCoursesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchCoursesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch courses' };
      });

    // ── Fetch Single Course ──
    builder
      .addCase(fetchCourseDetailThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourseDetailThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseDetailThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Fetch Course Resources ──
    builder
      .addCase(fetchCourseResourcesThunk.pending, (state) => {
        state.isResourcesLoading = true;
      })
      .addCase(fetchCourseResourcesThunk.fulfilled, (state, action) => {
        state.isResourcesLoading = false;
        state.resources = action.payload;
      })
      .addCase(fetchCourseResourcesThunk.rejected, (state, action) => {
        state.isResourcesLoading = false;
        state.resources = [];
        state.error = action.payload;
      });
  },
});

export const { selectCourse, clearCourseResources } = coursesSlice.actions;
export default coursesSlice.reducer;