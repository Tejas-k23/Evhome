/**
 * Owner Auth Service
 * Handles owner login/register via backend API.
 * Caches owner data in localStorage to support synchronous getCurrentOwner().
 */
import { API_URL } from '../../config/apiConfig';

const OWNER_TOKEN_KEY = "evhome_owner_token";
const OWNER_DATA_KEY = "evhome_owner_data";

export const ownerAuthService = {
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/owner/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        localStorage.setItem(OWNER_TOKEN_KEY, data.token);
        if (data.owner) {
            localStorage.setItem(OWNER_DATA_KEY, JSON.stringify(data.owner));
        }
        return data.owner || data;
    },

    register: async (ownerData) => {
        const response = await fetch(`${API_URL}/owner/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ownerData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        localStorage.setItem(OWNER_TOKEN_KEY, data.token);
        if (data.owner) {
            localStorage.setItem(OWNER_DATA_KEY, JSON.stringify(data.owner));
        }
        return data.owner || data;
    },

    logout: () => {
        localStorage.removeItem(OWNER_TOKEN_KEY);
        localStorage.removeItem(OWNER_DATA_KEY);
    },

    /**
     * Returns the cached owner object synchronously.
     * The owner data is cached in localStorage on login.
     */
    getCurrentOwner: () => {
        const data = localStorage.getItem(OWNER_DATA_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(OWNER_TOKEN_KEY);
    },

    getToken: () => {
        return localStorage.getItem(OWNER_TOKEN_KEY);
    }
};
