/**
 * Admin Booking Service
 * Fetches all bookings and session data via backend admin API.
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

export const adminBookingService = {
    getAll: async () => {
        const data = await adminFetch('/admin/bookings');
        return data.bookings || data;
    },

    getById: async (id) => {
        const bookings = await adminBookingService.getAll();
        return bookings.find(b => b._id === id || b.id === id) || null;
    },

    getSessionByBookingId: async (bookingId) => {
        try {
            return await adminFetch(`/sessions/${bookingId}`);
        } catch {
            return null;
        }
    },

    updateStatus: async (id, status) => {
        // Use the booking routes for status updates
        const endpoint = status === 'CANCELLED'
            ? `/bookings/${id}/cancel`
            : status === 'ACTIVE'
                ? `/bookings/${id}/start`
                : `/bookings/${id}/stop`;

        return adminFetch(endpoint, { method: 'PUT' });
    }
};
