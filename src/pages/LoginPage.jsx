import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, checkAuthStatus, clearError } from "../store/slices/authSlice";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error, role } = useAppSelector((state) => state.auth);
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'user') {
        navigate('/employee');
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    // Clear any previous errors
    dispatch(clearError());

    // Dispatch login action
    const result = await dispatch(loginUser({ name: name.trim(), password: password.trim() }));
    
    if (loginUser.fulfilled.match(result)) {
      // Login successful, navigation will be handled by useEffect
      setName("");
      setPassword("");
    }
    // Error handling is done in the Redux slice
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
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stack
          component="form"
          spacing={3}
          sx={{ mt: 2, alignItems: 'center' }}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
            type="submit"
            disabled={isLoading}
            fullWidth
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
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoginPage;