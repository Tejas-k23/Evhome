import React from 'react';
import { Navigate } from 'react-router-dom';
import { adminAuthService } from '../services/adminAuthService';

const AdminProtectedRoute = ({ children }) => {
    if (!adminAuthService.isAuthenticated()) {
        return <Navigate to="/admin123/login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
