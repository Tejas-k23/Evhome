/**
 * IoT Service
 * Fetches live session data from the backend API.
 */
import { apiFetch } from '../config/apiConfig';

export const iotService = {
    getLiveData: async (bookingId) => {
        return apiFetch(`/sessions/${bookingId}/live`);
    },

    getSessionByBooking: async (bookingId) => {
        return apiFetch(`/sessions/${bookingId}`);
    },

    /**
     * Fallback: generate simulated live status for local demo use.
     * This is only used when no backend connection is available.
     */
    generateLiveStatus: (currentSession = null) => {
        const voltage = Math.floor(Math.random() * (250 - 210 + 1)) + 210;
        let current = 0;
        let energyKwh = 0;
        let cost = 0;
        const pricePerKwh = 10;

        if (currentSession && currentSession.status === 'ACTIVE') {
            current = parseFloat((Math.random() * (16 - 8) + 8).toFixed(2));
            const increment = (current * voltage / 1000) * (3 / 3600);
            energyKwh = parseFloat(currentSession.energyKwh || 0) + increment;
            cost = energyKwh * pricePerKwh;
        }

        return {
            voltage: voltage.toFixed(1),
            current: current.toFixed(2),
            energyKwh: energyKwh.toFixed(3),
            cost: cost.toFixed(2)
        };
    }
};
