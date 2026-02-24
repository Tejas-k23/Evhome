const ADMIN_KEY = "EVHOME@123";
const TOKEN_KEY = "adminToken";

export const adminAuthService = {
    login: async (key) => {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (key === ADMIN_KEY) {
            const token = btoa(`admin-${Date.now()}`);
            localStorage.setItem(TOKEN_KEY, token);
            return { success: true, token };
        }
        return { success: false, message: "Invalid Admin Key" };
    },

    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    }
};
