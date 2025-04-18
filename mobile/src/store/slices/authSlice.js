import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../constants/api';

// Async thunks for authentication actions
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Store tokens in AsyncStorage
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Email verification failed. Please try again.'
      );
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Password reset request failed. Please try again.'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Password reset failed. Please try again.'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Remove tokens from AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      // Check if token exists
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }
      
      // Get user profile
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      return response.data.data.user;
    } catch (error) {
      // Remove invalid tokens
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load user profile'
      );
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  emailVerified: false,
  passwordResetSent: false,
  passwordResetSuccess: false,
  message: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.authError = null;
    },
    clearAuthMessage: (state) => {
      state.message = null;
    },
    resetAuthState: (state) => {
      state.emailVerified = false;
      state.passwordResetSent = false;
      state.passwordResetSuccess = false;
      state.message = null;
      state.authError = null;
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload;
      })
      
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload;
      })
      
      // Verify email cases
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emailVerified = true;
        state.message = action.payload.message;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload;
      })
      
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passwordResetSent = true;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload;
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passwordResetSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload;
      })
      
      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      
      // Load user cases
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      });
  },
});

export const { clearAuthError, clearAuthMessage, resetAuthState, updateProfile } = authSlice.actions;

export default authSlice.reducer;