/**
 * Authentication Service
 * Handles vehicle number and mobile number based auth via backend API.
 */
import { API_URL } from '../config/apiConfig';

export const authService = {
    sendOtp: async (vehicleNumber, mobileNumber) => {
        const response = await fetch(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehicleNumber, mobileNumber }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to send OTP');
        }
        return data;
    },

    verifyOtp: async (vehicleNumber, mobileNumber, otp) => {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehicleNumber, mobileNumber, otp }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'OTP verification failed');
        }
        return data;
    }
};
