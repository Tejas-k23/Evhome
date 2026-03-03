/**
 * Admin Auth Service
 * Handles admin login via backend API.
 */
import { API_URL, apiFetch } from '../../config/apiConfig';

const TOKEN_KEY = "adminToken";

export const adminAuthService = {
    login: async (key) => {
        try {
            const data = await apiFetch('/admin/login', {
                method: 'POST',
                body: JSON.stringify({ key }),
            });
            localStorage.setItem(TOKEN_KEY, data.token);
            return { success: true, token: data.token };
        } catch (error) {
            return { success: false, message: error.message };
        }
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
