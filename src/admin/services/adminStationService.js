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

export const adminStationService = {
    getAll: async () => {
        const data = await adminFetch('/stations');
        return data.stations || data;
    },

    getById: async (id) => {
        const data = await adminFetch(`/stations/${id}`);
        return data.station || data;
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
