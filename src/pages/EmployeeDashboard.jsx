import MuiButton from "../components/MuiButton";
import LeaveForm from "../components/LeaveForm"
import LeaveTable from "../components/LeaveTable"
import StatusFilter from "../components/StatusFilter";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";

const EmployeeDashboard = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      // Make API call with authorization header
      const response = await axios.get('http://localhost:5001/api/leaves', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle different API response structures
      const data = response.data;
      console.log('API Response:', data); // Debug log to see the actual response structure
      
      // If data is an array, use it directly
      if (Array.isArray(data)) {
        setLeaves(data);
      } 
      // If data has a leaves property that is an array
      else if (data && Array.isArray(data.leaves)) {
        setLeaves(data.leaves);
      }
      // If data has a data property that is an array
      else if (data && Array.isArray(data.data)) {
        setLeaves(data.data);
      }
      // If data is an object with array properties, try to find the array
      else if (data && typeof data === 'object') {
        const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
        if (arrayKey) {
          setLeaves(data[arrayKey]);
        } else {
          console.log('No array found in response, using empty array');
          setLeaves([]);
        }
      }
      // Fallback to empty array
      else {
        console.log('Invalid response structure, using empty array');
        setLeaves([]);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          setError('Authentication failed. Please login again.');
        } else if (error.response.status === 403) {
          setError('Access denied. You do not have permission to view leaves.');
        } else {
          setError(error.response.data.message || 'Failed to fetch leaves');
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter leaves based on selected status
  const filteredLeaves = useMemo(() => {
    if (!statusFilter) {
      return leaves; // Show all leaves if no filter selected
    }
    return leaves.filter(leave => leave.status === statusFilter);
  }, [leaves, statusFilter]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading leaves...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <MuiButton />
      </Box>
    );
  }

  return (
    <>
      <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      {/* <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredLeaves.length} of {leaves.length} leave requests
          {statusFilter && ` (filtered by ${statusFilter})`}
        </Typography>
      </Box> */}
      <LeaveTable leaves={filteredLeaves} onLeaveUpdate={fetchLeaves} />
      <MuiButton/>
    </>
  )
}

export default EmployeeDashboard

