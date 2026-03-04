/**
 * Admin User Service
 * Manages users via backend admin API.
 */
import { API_URL } from '../../config/apiConfig';

const getAdminToken = () => localStorage.getItem('adminToken');

const adminFetch = async (endpoint, options = {}) => {
    const token = getAdminToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error(`Unexpected non-JSON response from ${endpoint} (status ${response.status})`);
    }
    if (!response.ok) {
        throw new Error(data.message || 'Admin API request failed');
    }
    return data;
};

export const adminUserService = {
    getAll: async () => {
        const data = await adminFetch('/admin/users');
        return data.users || data;
    },

    getById: async (id) => {
        const users = await adminUserService.getAll();
        return users.find(u => u._id === id || u.id === id) || null;
    },

    deleteUser: async (id) => {
        return adminFetch(`/admin/users/${id}`, {
            method: 'DELETE',
        });
    }
};
