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

    stopCharging: async (bookingId, energyKwh, cost) => {
        const payload = {};
        const energyNum = Number(energyKwh);
        const costNum = Number(cost);
        if (Number.isFinite(energyNum)) payload.energyKwh = energyNum;
        if (Number.isFinite(costNum)) payload.cost = costNum;

        const options = { method: 'PUT' };
        if (Object.keys(payload).length > 0) {
            options.body = JSON.stringify(payload);
        }

        return apiFetch(`/bookings/${bookingId}/stop`, options);
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
