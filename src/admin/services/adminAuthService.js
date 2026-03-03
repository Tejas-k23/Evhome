/**
 * Admin Auth Service
 * Handles admin login via backend API.
 */
import { API_URL } from '../../config/apiConfig';

const TOKEN_KEY = "adminToken";

export const adminAuthService = {
    login: async (key) => {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { success: false, message: data.message || "Invalid Admin Key" };
        }
        localStorage.setItem(TOKEN_KEY, data.token);
        return { success: true, token: data.token };
    },

    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    }
};
