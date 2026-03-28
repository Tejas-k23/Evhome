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

const normalizeBooking = (booking) => ({
    ...booking,
    id: booking._id || booking.id || '',
    userId: booking.user?._id || booking.user?.id || booking.userId || booking.user || '',
    userVehicleNumber: booking.user?.vehicleNumber || booking.userVehicleNumber || '',
    userMobileNumber: booking.user?.mobileNumber || booking.userMobileNumber || '',
    stationId: booking.station?._id || booking.station?.id || booking.stationId || booking.station || '',
    stationName: booking.station?.name || booking.stationName || '',
    stationLocation: booking.station?.location || booking.stationLocation || '',
    durationMinutes: booking.durationMinutes || 0,
    energyKwh: booking.energyKwh || 0,
    cost: booking.cost || 0,
});

export const adminBookingService = {
    getAll: async () => {
        const data = await adminFetch('/admin/bookings');
        const bookings = data.bookings || data;
        return Array.isArray(bookings) ? bookings.map(normalizeBooking) : [];
    },

    getById: async (id) => {
        const bookings = await adminBookingService.getAll();
        return bookings.find((b) => b.id === id || b._id === id) || null;
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
