import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ownerAuthService } from '../services/ownerAuthService';

const OwnerProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation();

    useEffect(() => {
        setIsAuthenticated(ownerAuthService.isAuthenticated());
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="container section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/owner" state={{ from: location }} replace />;
    }

    return children;
};

export default OwnerProtectedRoute;
