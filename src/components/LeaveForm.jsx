import React, { useState } from "react";
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



const LeaveForm = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reason, setReason] = useState("");
  const [openSnack, setOpenSnack] = useState(false);

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
              Apply for Leave
            </Typography>
            <Divider sx={{ mb: 4 }} />
            <Stack
              component="form"
              spacing={3}
              sx={{ mt: 2 , alignItems: 'center' }}
            >

              
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  onChange={(newValue) => setFromDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />

                <DatePicker
                  label="To Date"
                  value={toDate}
                  onChange={(newValue) => setToDate(newValue)}
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
                    sx={{
                      px: 3,
                      py: 1.2,
                      borderRadius: 2,
                      fontWeight: 600,
                      boxShadow: 2,
                      textTransform: "none",
                    }}
                  >
                    Apply Leave
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
          <Alert severity="success" variant="filled">
            Leave applied successfully!
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  )
}

export default LeaveForm
