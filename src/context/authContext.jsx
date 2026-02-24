import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('ev_home_user');
        const savedToken = localStorage.getItem('ev_home_token');
        if (savedUser && savedToken) {
            setCurrentUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (user, token) => {
        setCurrentUser(user);
        localStorage.setItem('ev_home_user', JSON.stringify(user));
        localStorage.setItem('ev_home_token', token);
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('ev_home_user');
        localStorage.removeItem('ev_home_token');
    };

    const value = {
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
