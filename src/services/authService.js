/**
 * Authentication Service
 * Handles vehicle number and mobile number based auth via backend API.
 * Uses MSG91 OTP widget for OTP send and verify.
 */
import { API_URL } from '../config/apiConfig';

export const authService = {
    /** Validate before MSG91 widget - checks user exists (login) or doesn't exist (signup) */
    validateForMsg91: async (vehicleNumber, mobileNumber, intent = 'signup') => {
        const response = await fetch(`${API_URL}/auth/validate-for-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehicleNumber, mobileNumber, intent }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Validation failed');
        }
        return data;
    },

    /** Verify MSG91 widget JWT and login/signup */
    verifyMsg91Token: async (vehicleNumber, mobileNumber, accessToken, intent = 'signup') => {
        const response = await fetch(`${API_URL}/auth/verify-msg91-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehicleNumber, mobileNumber, accessToken, intent }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Verification failed');
        }
        return data;
    }
};
