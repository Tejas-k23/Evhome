/**
 * Authentication Service
 * Handles vehicle number and mobile number based auth via backend API.
 */
import { apiFetch } from '../config/apiConfig';

export const authService = {
    sendOtp: async (vehicleNumber, mobileNumber) => {
        return apiFetch('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ vehicleNumber, mobileNumber }),
        });
    },

    verifyOtp: async (vehicleNumber, mobileNumber, otp) => {
        return apiFetch('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ vehicleNumber, mobileNumber, otp }),
        });
    }
};
