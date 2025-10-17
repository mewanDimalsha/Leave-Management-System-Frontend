import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ name, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        name: name.trim(),
        password: password.trim()
      });
      
      // Store in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('userName', response.data.name);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('employeeId');
  }
);

// Async thunk for checking auth status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName');
    
    if (token && role && name) {
      return { token, role, name };
    }
    throw new Error('No valid session found');
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  role: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = {
          name: action.payload.name,
          role: action.payload.role
        };
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.role = null;
        state.error = action.payload;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.role = null;
        state.error = null;
      })
      // Check auth status cases
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.user = {
          name: action.payload.name,
          role: action.payload.role
        };
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.role = null;
      });
  }
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
