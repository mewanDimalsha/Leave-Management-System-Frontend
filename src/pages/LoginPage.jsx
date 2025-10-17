import React, { useState } from "react";
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
  Box,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [openSnack, setOpenSnack] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      setOpenSnack(true);
      return;
    }

    // Here you would typically make an API call to authenticate
    console.log("Login attempt:", { username, password });
    navigate('/employee');
    // For demo purposes, show success message
    setError("");
    setOpenSnack(true);
    
    // Reset form
    setUsername("");
    setPassword("");
  };

  return (
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
          Login
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Stack
          component="form"
          spacing={3}
          sx={{ mt: 2, alignItems: 'center' }}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Username"
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />

          <Button
            variant="contained"
            color="primary"
            endIcon={<LoginIcon />}
            type="submit"
            fullWidth
            onClick={()=>{handleSubmit}}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: 2,
              textTransform: "none",
              mt: 2,
            }}
          >
            Login
          </Button>
        </Stack>
      </Paper>
      
      <Snackbar
        open={openSnack}
        autoHideDuration={3000}
        onClose={() => setOpenSnack(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          severity={error ? "error" : "success"} 
          variant="filled"
        >
          {error || "Login successful!"}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;
