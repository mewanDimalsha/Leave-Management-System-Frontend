import MuiButton from "../components/MuiButton";
import LeaveForm from "../components/LeaveForm"
import LeaveTable from "../components/LeaveTable"
import StatusFilter from "../components/StatusFilter";
import React, { useEffect } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchLeaves, setStatusFilter } from "../store/slices/leavesSlice";

const EmployeeDashboard = () => {
  const dispatch = useAppDispatch();
  const { 
    filteredLeaves, 
    isLoading, 
    error, 
    statusFilter 
  } = useAppSelector((state) => state.leaves);

  useEffect(() => {
    dispatch(fetchLeaves());
  }, [dispatch]);

  const handleStatusFilterChange = (newFilter) => {
    dispatch(setStatusFilter(newFilter));
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
        <MuiButton />
      </Box>
    );
  }

  return (
    <>
      <StatusFilter statusFilter={statusFilter} setStatusFilter={handleStatusFilterChange} />
      <LeaveTable leaves={filteredLeaves} onLeaveUpdate={handleLeaveUpdate} />
      <MuiButton/>
    </>
  )
}

export default EmployeeDashboard

