import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../api/admin';

export const fetchActivityLogThunk = createAsyncThunk(
  'activity/fetchActivityLog',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await adminApi.fetchActivityLog(params);
      return res;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  logs: [],
  pagination: null,
  isLoading: false,
  error: null,
};

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    logActivity: (state, action) => {
      const newLog = {
        _id: `log-${Date.now()}`,
        userId: {
          name: action.payload.userName || 'Current User',
          email: action.payload.userEmail || 'user@example.com',
        },
        action: action.payload.action || 'system_event',
        metadata: { details: action.payload.details || 'Activity occurred' },
        timestamp: new Date().toISOString(),
      };
      state.logs.unshift(newLog);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.data || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchActivityLogThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch activity logs' };
      });
  },
});

export const { logActivity } = activitySlice.actions;
export default activitySlice.reducer;
