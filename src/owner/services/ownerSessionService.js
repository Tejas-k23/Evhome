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
        const data = await ownerFetch('/owner/sessions');
        const sessions = Array.isArray(data.sessions) ? data.sessions : [];

        return sessions.map((item) => {
            const booking = item.booking || {};
            const session = item.session || {};

            return {
                id: session._id || session.id || booking._id || booking.id,
                bookingId: booking._id || booking.id || '',
                stationName: booking.station?.name || '',
                userVehicleNumber: booking.user?.vehicleNumber || '',
                startTime: booking.startTime,
                endTime: booking.endTime,
                voltage: session.voltage || 0,
                current: session.current || 0,
                power: session.power || 0,
                energyKwh: session.energyKwh || booking.energyKwh || 0,
                frequency: session.frequency || 0,
                powerFactor: session.powerFactor || 0,
                cost: session.cost || booking.cost || 0,
                updatedAt: session.updatedAt || booking.updatedAt || booking.createdAt,
            };
        });
    },

    startSession: async (bookingId) => {
        return ownerFetch(`/bookings/${bookingId}/start`, {
            method: 'PUT',
        });
    },

    getSessionByBooking: async (bookingId) => {
        try {
            const data = await ownerFetch(`/sessions/${bookingId}`);
            return data.session || data;
        } catch {
            return null;
        }
    },

    getLiveSessionData: async (bookingId) => {
        try {
            const data = await ownerFetch(`/sessions/${bookingId}/live`);
            return data.session || data;
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
