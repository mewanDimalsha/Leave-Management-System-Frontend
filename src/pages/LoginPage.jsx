import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      // Make API call to backend login endpoint using axios
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        name: name.trim(),
        password: password.trim()
      });

      const data = response.data;

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      
      // Role-based redirection
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'user') {
        navigate('/employee');
      } else {
        alert("Invalid user role");
        return;
      }
      
      // Reset form
      setName("");
      setPassword("");
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle axios error response
      if (error.response) {
        alert(error.response.data.message || "Login failed");
      } else if (error.request) {
        alert("Network error. Please check your connection.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
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
            endIcon={<LoginIcon />}
            type="submit"
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
            Login
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default LoginPage;