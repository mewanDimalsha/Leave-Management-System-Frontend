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
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createLeave, updateLeave } from "../store/slices/leavesSlice";



const LeaveForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.leaves);
  
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reason, setReason] = useState("");
  const [openSnack, setOpenSnack] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");
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

    // Prepare the leave data
    const leaveData = {
      fromDate: fromDate.toISOString(),
      toDate: toDate.toISOString(),
      reason: reason.trim()
    };

    try {
      let result;
      if (editMode) {
        result = await dispatch(updateLeave({ leaveId, leaveData }));
        if (updateLeave.fulfilled.match(result)) {
          setSnackMessage("Leave updated successfully!");
          setSnackSeverity("success");
          setOpenSnack(true);
        }
      } else {
        result = await dispatch(createLeave(leaveData));
        if (createLeave.fulfilled.match(result)) {
          setSnackMessage("Leave applied successfully!");
          setSnackSeverity("success");
          setOpenSnack(true);
        }
      }

      if (createLeave.fulfilled.match(result) || updateLeave.fulfilled.match(result)) {
        // Reset form
        setFromDate(null);
        setToDate(null);
        setReason("");
        
        // Navigate back to employee dashboard after a short delay
        setTimeout(() => {
          navigate('/employee');
        }, 2000);
      } else {
        // Handle error
        setSnackMessage(error || "An error occurred");
        setSnackSeverity("error");
        setOpenSnack(true);
      }

    } catch (error) {
      console.error('Error submitting leave:', error);
      setSnackMessage("An unexpected error occurred. Please try again.");
      setSnackSeverity("error");
      setOpenSnack(true);
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
                    disabled={isLoading}
                    sx={{
                      px: 3,
                      py: 1.2,
                      borderRadius: 2,
                      fontWeight: 600,
                      boxShadow: 2,
                      textTransform: "none",
                    }}
                  >
                    {isLoading ? (editMode ? "Updating..." : "Submitting...") : (editMode ? "Update Leave" : "Apply Leave")}
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
