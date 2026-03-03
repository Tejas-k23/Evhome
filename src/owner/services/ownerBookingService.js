/**
 * Owner Booking Service
 * Fetches owner's bookings via backend API.
 */
import { API_URL } from '../../config/apiConfig';

const getOwnerToken = () => localStorage.getItem('evhome_owner_token');

const ownerFetch = async (endpoint, options = {}) => {
    const token = getOwnerToken();
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
        throw new Error(data.message || 'Owner API request failed');
    }
    return data;
};

export const ownerBookingService = {
    getBookingsForOwner: async () => {
        return ownerFetch('/owner/bookings');
    },

    updateBookingStatus: async (bookingId, status) => {
        const endpoint = status === 'CANCELLED'
            ? `/bookings/${bookingId}/cancel`
            : status === 'ACTIVE'
                ? `/bookings/${bookingId}/start`
                : `/bookings/${bookingId}/stop`;

        return ownerFetch(endpoint, { method: 'PUT' });
    }
};
