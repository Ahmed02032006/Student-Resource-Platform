import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as assessmentsApi from '../api/assessments';

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

// ── Thunks ──────────────────────────────────────────────────────────────

export const fetchAssessmentsThunk = createAsyncThunk(
  'assessments/fetchAssessments',
  async (params, { rejectWithValue }) => {
    try {
      const res = await assessmentsApi.fetchAssessments(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const createAssessmentThunk = createAsyncThunk(
  'assessments/createAssessment',
  async (data, { rejectWithValue }) => {
    try {
      const res = await assessmentsApi.createAssessment(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const updateAssessmentThunk = createAsyncThunk(
  'assessments/updateAssessment',
  async ({ id, data }, { rejectWithValue, getState }) => {
    try {
      // First, update the assessment
      await assessmentsApi.updateAssessment(id, data);
      
      // Get the current state
      const state = getState();
      const courses = state.courses.list || [];
      
      // Find the existing assessment from the store
      const existingAssessment = state.assessments.list.find(a => a._id === id);
      
      // Find the course data from the courses list
      const selectedCourse = courses.find(c => c._id === data.courseId);
      
      // Create the updated assessment with proper course data
      const updatedAssessment = {
        ...existingAssessment,
        _id: id,
        title: data.title,
        description: data.description || '',
        courseId: selectedCourse ? {
          _id: selectedCourse._id,
          courseCode: selectedCourse.courseCode,
          courseName: selectedCourse.courseName
        } : data.courseId,
        scheduledAt: data.scheduledAt,
        type: data.type,
        // Keep the existing postedBy data
        postedBy: existingAssessment?.postedBy || null,
        createdAt: existingAssessment?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return updatedAssessment;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const deleteAssessmentThunk = createAsyncThunk(
  'assessments/deleteAssessment',
  async (id, { rejectWithValue }) => {
    try {
      await assessmentsApi.deleteAssessment(id);
      return id;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────

const initialState = {
  list: [],
  isLoading: false,
  error: null,
};

export const assessmentSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    clearAssessmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchAssessmentsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchAssessmentsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create
    builder
      .addCase(createAssessmentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAssessmentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload);
      })
      .addCase(createAssessmentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update - Fixed with proper course handling
    builder
      .addCase(updateAssessmentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAssessmentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        // Find and replace the updated assessment
        const index = state.list.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateAssessmentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete
    builder
      .addCase(deleteAssessmentThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAssessmentThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.filter((a) => a._id !== action.payload);
      })
      .addCase(deleteAssessmentThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAssessmentError } = assessmentSlice.actions;
export default assessmentSlice.reducer;