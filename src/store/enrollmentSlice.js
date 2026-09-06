import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as enrollmentsApi from '../api/enrollments';

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

export const fetchMyEnrollmentsThunk = createAsyncThunk(
  'enrollment/fetchMyEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const res = await enrollmentsApi.fetchMyEnrollments();
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const requestEnrollmentThunk = createAsyncThunk(
  'enrollment/requestEnrollment',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await enrollmentsApi.requestEnrollment(courseId);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

const initialState = {
  myEnrollments: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState,
  reducers: {
    clearEnrollmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch My Enrollments ──
    builder
      .addCase(fetchMyEnrollmentsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollmentsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myEnrollments = action.payload;
      })
      .addCase(fetchMyEnrollmentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch enrollments' };
      });

    // ── Request Enrollment ──
    builder
      .addCase(requestEnrollmentThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(requestEnrollmentThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Prepend or update in list
        const existingIdx = state.myEnrollments.findIndex(
          (e) => (e._id || e.id) === action.payload._id
        );
        if (existingIdx >= 0) {
          state.myEnrollments[existingIdx] = action.payload;
        } else {
          state.myEnrollments.unshift(action.payload);
        }
      })
      .addCase(requestEnrollmentThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || { message: 'Enrollment request failed' };
      });
  },
});

export const { clearEnrollmentError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
