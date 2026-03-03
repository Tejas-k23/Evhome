/**
 * Admin Station Service
 * Manages stations via backend admin API.
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
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Admin API request failed');
    }
    return data;
};

export const adminStationService = {
    getAll: async () => {
        return adminFetch('/stations');
    },

    getById: async (id) => {
        return adminFetch(`/stations/${id}`);
    },

    create: async (stationData) => {
        return adminFetch('/admin/stations', {
            method: 'POST',
            body: JSON.stringify(stationData),
        });
    },

    update: async (id, stationData) => {
        return adminFetch(`/admin/stations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(stationData),
        });
    },

    delete: async (id) => {
        return adminFetch(`/admin/stations/${id}`, {
            method: 'DELETE',
        });
    }
};
