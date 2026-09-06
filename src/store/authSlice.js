import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../api/auth';
import { useEffect } from 'react';

const normalizeError = (err) => {
  if (err instanceof Error) {
    return { status: 0, code: 'UNKNOWN_ERROR', message: err.message };
  }
  if (typeof err === 'object' && err !== null) {
    return {
      status: err.status || 0,
      code: err.code || 'API_ERROR',
      message: err.message || 'An error occurred.',
      rejectionInfo: err.rejectionInfo || null,
      data: err.data || null,
    };
  }
  return { status: 0, code: 'UNKNOWN_ERROR', message: String(err) };
};

// ── Async Thunks ───────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.loginUser(credentials);
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      return res;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await authApi.registerUser(userData);
      return res;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const checkAuthThunk = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) return rejectWithValue({ message: 'No token found' });
    try {
      const res = await authApi.getMe();
      return { token, data: res.data };
    } catch (err) {
      localStorage.removeItem('token');
      return rejectWithValue(normalizeError(err));
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  isInitializing: true, // App bootstrap auth check
  isLoading: false,
  error: null,
  accountStatus: null,
  rejectionInfo: null,
  pendingAccounts: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.accountStatus = null;
      state.rejectionInfo = null;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setPendingAccounts: (state, action) => {
      state.pendingAccounts = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.accountStatus = action.payload.data.accountStatus;
        state.rejectionInfo = null;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Login failed' };
        if (action.payload?.code === 'ACCOUNT_PENDING') {
          state.accountStatus = 'pending';
        } else if (action.payload?.code === 'ACCOUNT_REJECTED') {
          state.accountStatus = 'rejected';
          state.rejectionInfo = action.payload.rejectionInfo || null;
        }
      });

    // ── Register ──
    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.accountStatus = 'pending';
        state.error = null;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Registration failed' };
      });

    // ── Check Auth ──
    builder
      .addCase(checkAuthThunk.pending, (state) => {
        state.isInitializing = true;
      })
      .addCase(checkAuthThunk.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.token = action.payload.token;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.accountStatus = action.payload.data.accountStatus;
      })
      .addCase(checkAuthThunk.rejected, (state) => {
        state.isInitializing = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.accountStatus = null;
      });
  },
});

export const { logout, clearAuthError, setPendingAccounts } = authSlice.actions;
export default authSlice.reducer;
