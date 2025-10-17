import React, { useEffect } from 'react'
import StatusFilter from '../components/StatusFilter.jsx'
import LeaveTable from '../components/LeaveTable.jsx'
import EmployeeFilter from '../components/EmployeeFilter.jsx';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLeaves, setStatusFilter, setEmployeeFilter, clearFilters } from '../store/slices/leavesSlice';

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { 
    filteredLeaves, 
    isLoading, 
    error, 
    statusFilter,
    employeeFilter 
  } = useAppSelector((state) => state.leaves);

  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  const handleStatusFilterChange = (newFilter) => {
    dispatch(setStatusFilter(newFilter));
  };

  const handleEmployeeFilterChange = (employeeName) => {
    dispatch(setEmployeeFilter(employeeName));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleLeaveUpdate = () => {
    dispatch(fetchLeaves());
  };

  if (isLoading) {
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
      <EmployeeFilter 
        searchName={employeeFilter} 
        setSearchName={handleEmployeeFilterChange} 
      />
      <StatusFilter statusFilter={statusFilter} setStatusFilter={handleStatusFilterChange} />
      <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredLeaves.length} leave requests
          {(statusFilter || employeeFilter) && ' (filtered)'}
        </Typography>
        {(statusFilter || employeeFilter) && (
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </Box>
      <LeaveTable leaves={filteredLeaves} onLeaveUpdate={handleLeaveUpdate} isAdmin={true} />
    </>
  )
}

export default AdminDashboard
