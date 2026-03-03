/**
 * Booking Service
 * Handles booking CRUD, charging start/stop, and bills via backend API.
 */
import { apiFetch } from '../config/apiConfig';

export const bookingService = {
    createBooking: async (stationId, socketId, startTime, endTime) => {
        return apiFetch('/bookings', {
            method: 'POST',
            body: JSON.stringify({ stationId, socketId, startTime, endTime }),
        });
    },

    getUserBookings: async () => {
        return apiFetch('/bookings');
    },

    getBookingById: async (bookingId) => {
        return apiFetch(`/bookings/${bookingId}`);
    },

    startCharging: async (bookingId) => {
        return apiFetch(`/bookings/${bookingId}/start`, {
            method: 'PUT',
        });
    },

    stopCharging: async (bookingId) => {
        return apiFetch(`/bookings/${bookingId}/stop`, {
            method: 'PUT',
        });
    },

    cancelBooking: async (bookingId) => {
        return apiFetch(`/bookings/${bookingId}/cancel`, {
            method: 'PUT',
        });
    },

    getUserBills: async () => {
        return apiFetch('/bills');
    },

    getBillById: async (billId) => {
        return apiFetch(`/bills/${billId}`);
    },

    markBillPaid: async (billId) => {
        return apiFetch(`/bills/${billId}/pay`, {
            method: 'PUT',
        });
    }
};
