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
        const data = await ownerFetch('/owner/bookings');
        const bookings = Array.isArray(data.bookings) ? data.bookings : [];

        return bookings.map((booking) => ({
            id: booking._id || booking.id,
            userId: booking.user?._id || booking.user?.id || '',
            userVehicleNumber: booking.user?.vehicleNumber || '',
            userMobileNumber: booking.user?.mobileNumber || '',
            stationId: booking.station?._id || booking.station?.id || '',
            stationName: booking.station?.name || '',
            stationLocation: booking.station?.location || '',
            startTime: booking.startTime,
            endTime: booking.endTime,
            durationMinutes: booking.durationMinutes || 0,
            status: booking.status,
            energyKwh: booking.energyKwh || 0,
            cost: booking.cost || 0,
            createdAt: booking.createdAt,
        }));
    },

    updateBookingStatus: async (bookingId, status, energyKwh, cost) => {
        const endpoint = status === 'CANCELLED'
            ? `/bookings/${bookingId}/cancel`
            : status === 'ACTIVE'
                ? `/bookings/${bookingId}/start`
                : `/bookings/${bookingId}/stop`;

        if (status !== 'COMPLETED') {
            return ownerFetch(endpoint, { method: 'PUT' });
        }

        const payload = {};
        const energyNum = Number(energyKwh);
        const costNum = Number(cost);
        if (Number.isFinite(energyNum)) payload.energyKwh = energyNum;
        if (Number.isFinite(costNum)) payload.cost = costNum;

        const options = { method: 'PUT' };
        if (Object.keys(payload).length > 0) {
            options.body = JSON.stringify(payload);
        }

        return ownerFetch(endpoint, options);
    }
};
