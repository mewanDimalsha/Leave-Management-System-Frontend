import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If role is specified and doesn't match, redirect to appropriate dashboard
  if (requiredRole && userRole !== requiredRole) {
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'user') {
      return <Navigate to="/employee" replace />;
    }
  }

  // If token exists and role matches (if specified), render the protected component
  return children;
};

export default ProtectedRoute;
