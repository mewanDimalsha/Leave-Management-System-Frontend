import React from "react";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  TextField,
  Button,
  Box,
  Chip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";

const LeaveDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { leaveData, readonly } = location.state || {};

  if (!leaveData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <Paper elevation={4} sx={{ p: 5, borderRadius: 3 }}>
          <Typography variant="h6" color="error" textAlign="center">
            No leave data found. Please go back and try again.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2, width: '100%' }}
          >
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "warning";
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
            Leave Request Details
          </Typography>
          <Divider sx={{ mb: 4 }} />
          
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Employee Information */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Employee
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {leaveData.employee?.name || leaveData.employee || 'N/A'}
              </Typography>
            </Box>

            {/* Status */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip
                label={leaveData.status}
                color={getStatusColor(leaveData.status)}
                variant="filled"
                size="medium"
              />
            </Box>

            {/* From Date */}
            <DatePicker
              label="From Date"
              value={dayjs(leaveData.fromDate)}
              readOnly
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  InputProps: { readOnly: true }
                } 
              }}
            />

            {/* To Date */}
            <DatePicker
              label="To Date"
              value={dayjs(leaveData.toDate)}
              readOnly
              slotProps={{ 
                textField: { 
                  fullWidth: true,
                  InputProps: { readOnly: true }
                } 
              }}
            />

            {/* Reason */}
            <TextField
              label="Reason"
              multiline
              minRows={3}
              fullWidth
              variant="outlined"
              value={leaveData.reason}
              InputProps={{ readOnly: true }}
            />

            {/* Additional Info */}
            {leaveData.createdAt && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Requested On
                </Typography>
                <Typography variant="body2">
                  {dayjs(leaveData.createdAt).format('MMMM DD, YYYY [at] h:mm A')}
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ flex: 1 }}
              >
                Back
              </Button>
              
              {!readonly && leaveData.status === "Pending" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/leave-form', { 
                    state: { 
                      editMode: true, 
                      leaveData: leaveData 
                    } 
                  })}
                  sx={{ flex: 1 }}
                >
                  Edit Leave
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default LeaveDetails;
