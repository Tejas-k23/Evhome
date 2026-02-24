import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="container section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect them to the /auth page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
