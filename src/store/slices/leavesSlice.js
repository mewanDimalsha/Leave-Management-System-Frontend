import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Async thunk for fetching all leaves
export const fetchLeaves = createAsyncThunk(
  'leaves/fetchLeaves',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string for employee search
      const queryParams = new URLSearchParams();
      if (params.employee) {
        queryParams.append('employee', params.employee);
      }
      
      const url = `http://localhost:5001/api/leaves${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await axios.get(url, {
        headers: getAuthHeaders()
      });
      
      // Handle different API response structures
      const data = response.data;
      let leaves = [];
      
      if (Array.isArray(data)) {
        leaves = data;
      } else if (data && Array.isArray(data.leaves)) {
        leaves = data.leaves;
      } else if (data && Array.isArray(data.data)) {
        leaves = data.data;
      } else if (data && typeof data === 'object') {
        const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
        if (arrayKey) {
          leaves = data[arrayKey];
        }
      }
      
      return leaves;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaves');
    }
  }
);

// Async thunk for creating a new leave
export const createLeave = createAsyncThunk(
  'leaves/createLeave',
  async (leaveData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5001/api/leaves', leaveData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create leave');
    }
  }
);

// Async thunk for updating a leave
export const updateLeave = createAsyncThunk(
  'leaves/updateLeave',
  async ({ leaveId, leaveData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/leaves/${leaveId}`, leaveData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave');
    }
  }
);

// Async thunk for deleting a leave
export const deleteLeave = createAsyncThunk(
  'leaves/deleteLeave',
  async (leaveId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`http://localhost:5001/api/leaves/${leaveId}`, {
        headers: getAuthHeaders()
      });
      return { leaveId, response: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete leave');
    }
  }
);

// Async thunk for approving a leave
export const approveLeave = createAsyncThunk(
  'leaves/approveLeave',
  async (leaveId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/leaves/${leaveId}`, {
        status: 'Approved'
      }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve leave');
    }
  }
);

// Async thunk for rejecting a leave
export const rejectLeave = createAsyncThunk(
  'leaves/rejectLeave',
  async (leaveId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:5001/api/leaves/${leaveId}`, {
        status: 'Rejected'
      }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject leave');
    }
  }
);

// Helper function to apply filters
const applyFilters = (state) => {
  let filtered = [...state.leaves];
  
  // Apply status filter
  if (state.statusFilter) {
    filtered = filtered.filter(leave => leave.status === state.statusFilter);
  }
  
  // Apply employee filter
  if (state.employeeFilter) {
    const searchTerm = state.employeeFilter.toLowerCase().trim();
    filtered = filtered.filter(leave => {
      // Handle different employee field structures
      let employeeName = '';
      
      if (leave.employee) {
        if (typeof leave.employee === 'string') {
          employeeName = leave.employee;
        } else if (typeof leave.employee === 'object' && leave.employee.name) {
          employeeName = leave.employee.name;
        }
      }
      
      // Return true if employee name contains the search term
      return employeeName.toLowerCase().includes(searchTerm);
    });
  }
  
  state.filteredLeaves = filtered;
};

const initialState = {
  leaves: [],
  filteredLeaves: [],
  statusFilter: '',
  employeeFilter: '',
  isLoading: false,
  error: null,
  lastFetch: null
};

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      applyFilters(state);
    },
    setEmployeeFilter: (state, action) => {
      state.employeeFilter = action.payload;
      applyFilters(state);
    },
    clearFilters: (state) => {
      state.statusFilter = '';
      state.employeeFilter = '';
      state.filteredLeaves = state.leaves;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLeaves: (state) => {
      state.leaves = [];
      state.filteredLeaves = [];
      state.statusFilter = '';
      state.employeeFilter = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch leaves cases
      .addCase(fetchLeaves.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaves = action.payload;
        // Apply current filters
        applyFilters(state);
        state.lastFetch = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create leave cases
      .addCase(createLeave.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLeave.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaves.unshift(action.payload.leave || action.payload);
        // Reapply filters
        applyFilters(state);
        state.error = null;
      })
      .addCase(createLeave.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update leave cases
      .addCase(updateLeave.fulfilled, (state, action) => {
        const updatedLeave = action.payload.leave || action.payload;
        const index = state.leaves.findIndex(leave => leave._id === updatedLeave._id || leave.id === updatedLeave.id);
        if (index !== -1) {
          state.leaves[index] = updatedLeave;
          // Reapply filters
          applyFilters(state);
        }
      })
      // Delete leave cases
      .addCase(deleteLeave.fulfilled, (state, action) => {
        const leaveId = action.payload.leaveId;
        state.leaves = state.leaves.filter(leave => leave._id !== leaveId && leave.id !== leaveId);
        // Reapply filters
        applyFilters(state);
      })
      // Approve leave cases
      .addCase(approveLeave.fulfilled, (state, action) => {
        const updatedLeave = action.payload.leave || action.payload;
        const index = state.leaves.findIndex(leave => leave._id === updatedLeave._id || leave.id === updatedLeave.id);
        if (index !== -1) {
          state.leaves[index] = updatedLeave;
          // Reapply filters
          applyFilters(state);
        }
      })
      // Reject leave cases
      .addCase(rejectLeave.fulfilled, (state, action) => {
        const updatedLeave = action.payload.leave || action.payload;
        const index = state.leaves.findIndex(leave => leave._id === updatedLeave._id || leave.id === updatedLeave.id);
        if (index !== -1) {
          state.leaves[index] = updatedLeave;
          // Reapply filters
          applyFilters(state);
        }
      });
  }
});

export const { setStatusFilter, setEmployeeFilter, clearFilters, clearError, clearLeaves } = leavesSlice.actions;
export default leavesSlice.reducer;
