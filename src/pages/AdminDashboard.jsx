import React, { useState, useEffect, useMemo } from 'react'
import StatusFilter from '../components/StatusFilter.jsx'
import LeaveTable from '../components/LeaveTable.jsx'
import EmployeeFilter from '../components/EmployeeFilter.jsx';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const AdminDashboard = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  const fetchAllLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const response = await axios.get('http://localhost:5001/api/leaves', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle different API response structures
      const data = response.data;
      console.log('Admin API Response:', data);
      
      if (Array.isArray(data)) {
        setLeaves(data);
      } else if (data && Array.isArray(data.leaves)) {
        setLeaves(data.leaves);
      } else if (data && Array.isArray(data.data)) {
        setLeaves(data.data);
      } else if (data && typeof data === 'object') {
        const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
        if (arrayKey) {
          setLeaves(data[arrayKey]);
        } else {
          setLeaves([]);
        }
      } else {
        setLeaves([]);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      
      if (error.response) {
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
      </Box>
    );
  }

  return (
    <>
      <EmployeeFilter />
      <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
      <LeaveTable leaves={filteredLeaves} onLeaveUpdate={fetchAllLeaves} isAdmin={true} />
    </>
  )
}

export default AdminDashboard
