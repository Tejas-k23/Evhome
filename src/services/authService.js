/**
 * Mock Authentication Service
 * Handles vehicle number and mobile number based auth with a test OTP.
 */

const USERS_KEY = 'ev_home_users';

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));

const normalizeVehicleNumber = (v) => v.toUpperCase().replace(/\s+/g, ' ').trim();

export const authService = {
    sendOtp: async (vehicleNumber, mobileNumber) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log(`[OTP SERVICE] Generating OTP for ${vehicleNumber} (${mobileNumber}): 123456`);

        return {
            success: true,
            message: "OTP sent successfully",
            testOtp: "123456" // For demo purposes
        };
    },

    verifyOtp: async (vehicleNumber, mobileNumber, otp) => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (otp !== "123456") {
            return { success: false, message: "Invalid OTP" };
        }

        const normalizedV = normalizeVehicleNumber(vehicleNumber);
        const users = getUsers();
        let user = users.find(u => u.vehicleNumber === normalizedV);

        if (!user) {
            // Create new user for signup
            user = {
                id: Date.now().toString(),
                vehicleNumber: normalizedV,
                mobileNumber,
                createdAt: new Date().toISOString()
            };
            users.push(user);
            saveUsers(users);
        }

        return {
            success: true,
            user,
            token: "demo-jwt-token-" + user.id
        };
    }
};
