import React from 'react';
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}; 