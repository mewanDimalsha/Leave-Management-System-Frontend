import React, { useState, useEffect } from "react";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";



const LeaveForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reason, setReason] = useState("");
  const [openSnack, setOpenSnack] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [leaveId, setLeaveId] = useState(null);

  // Check if we're in edit mode and populate form
  useEffect(() => {
    if (location.state && location.state.editMode && location.state.leaveData) {
      const { leaveData } = location.state;
      setEditMode(true);
      setLeaveId(leaveData._id || leaveData.id);
      setFromDate(dayjs(leaveData.fromDate));
      setToDate(dayjs(leaveData.toDate));
      setReason(leaveData.reason);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!fromDate || !toDate || !reason.trim()) {
      setSnackMessage("Please fill in all fields");
      setSnackSeverity("error");
      setOpenSnack(true);
      return;
    }

    if (fromDate.isAfter(toDate)) {
      setSnackMessage("From date cannot be after to date");
      setSnackSeverity("error");
      setOpenSnack(true);
      return;
    }

    // Check if from date is today or in the future
    const today = dayjs().startOf('day');
    if (fromDate.isBefore(today)) {
      setSnackMessage("From date must be today or in the future");
      setSnackSeverity("error");
      setOpenSnack(true);
      return;
    }

    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      console.log('Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setSnackMessage("No authentication token found. Please login again.");
        setSnackSeverity("error");
        setOpenSnack(true);
        return;
      }

      // Prepare the leave data (backend will extract employee ID from JWT token)
      const leaveData = {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        reason: reason.trim()
      };

      // Additional validation and debugging
      console.log('Date validation:');
      console.log('From date object:', fromDate);
      console.log('To date object:', toDate);
      console.log('From date ISO:', fromDate.toISOString());
      console.log('To date ISO:', toDate.toISOString());
      console.log('Reason length:', reason.trim().length);

      console.log('Submitting leave data:', leaveData);
      console.log('Edit mode:', editMode);
      console.log('Leave ID:', leaveId);
      console.log('Token present:', !!token);

      let response;
      if (editMode) {
        // Update existing leave
        console.log('Making PUT request to:', `http://localhost:5001/api/leaves/${leaveId}`);
        response = await axios.put(`http://localhost:5001/api/leaves/${leaveId}`, leaveData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Leave updated successfully:', response.data);
        setSnackMessage("Leave updated successfully!");
      } else {
        // Create new leave
        console.log('Making POST request to:', 'http://localhost:5001/api/leaves');
        response = await axios.post('http://localhost:5001/api/leaves', leaveData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Leave submitted successfully:', response.data);
        setSnackMessage("Leave applied successfully!");
      }
      
      setSnackSeverity("success");
      setOpenSnack(true);
      
      // Reset form
      setFromDate(null);
      setToDate(null);
      setReason("");
      
      // Navigate back to employee dashboard after a short delay
      setTimeout(() => {
        navigate('/employee');
      }, 2000);

    } catch (error) {
      console.error('Error submitting leave:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Server error (${error.response.status})`;
        setSnackMessage(errorMessage);
        console.error('Backend error details:', error.response.data);
      } else if (error.request) {
        setSnackMessage("Network error. Please check your connection.");
      } else {
        setSnackMessage("An unexpected error occurred. Please try again.");
      }
      setSnackSeverity("error");
      setOpenSnack(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <Paper
            elevation={4}
            sx={{
              p: 5,
              borderRadius: 3,
              background:
                "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(245,247,250,1) 100%)",
            }}
          >
            <Typography
              variant="h5"
              fontWeight={600}
              textAlign="center"
              mb={3}
              color="primary.main"
            >
              {editMode ? 'Edit Leave Request' : 'Apply for Leave'}
            </Typography>
            <Divider sx={{ mb: 4 }} />
            <Stack
              component="form"
              spacing={3}
              sx={{ mt: 2 , alignItems: 'center' }}
              onSubmit={handleSubmit}
            >

              
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  minDate={dayjs().startOf('day')}
                  slotProps={{ textField: { fullWidth: true } }}
                />

                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
                  minDate={fromDate || dayjs().startOf('day')}
                  slotProps={{ textField: { fullWidth: true } }}
                />

                <TextField
                  label="Reason"
                  multiline
                  minRows={3}
                  fullWidth
                  variant="outlined"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />

                <Stack direction="row" justifyContent="space-between" sx={{ width: "100%", mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    type="submit"
                    disabled={loading}
                    sx={{
                      px: 3,
                      py: 1.2,
                      borderRadius: 2,
                      fontWeight: 600,
                      boxShadow: 2,
                      textTransform: "none",
                    }}
                  >
                    {loading ? (editMode ? "Updating..." : "Submitting...") : (editMode ? "Update Leave" : "Apply Leave")}
                  </Button>
              </Stack>

            </Stack>
          </Paper>
          <Snackbar
          open={openSnack}
          autoHideDuration={3000}
          onClose={() => setOpenSnack(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackSeverity} variant="filled">
            {snackMessage}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  )
}

export default LeaveForm
