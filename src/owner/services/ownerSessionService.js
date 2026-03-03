/**
 * Owner Session Service
 * Manages charging sessions via backend API.
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

export const ownerSessionService = {
    getSessionsForOwner: async () => {
        return ownerFetch('/owner/sessions');
    },

    startSession: async (bookingId) => {
        return ownerFetch(`/bookings/${bookingId}/start`, {
            method: 'PUT',
        });
    },

    getSessionByBooking: async (bookingId) => {
        try {
            return await ownerFetch(`/sessions/${bookingId}`);
        } catch {
            return null;
        }
    },

    getLiveSessionData: async (bookingId) => {
        try {
            return await ownerFetch(`/sessions/${bookingId}/live`);
        } catch {
            return null;
        }
    },

    stopSession: async (bookingId) => {
        return ownerFetch(`/bookings/${bookingId}/stop`, {
            method: 'PUT',
        });
    }
};
