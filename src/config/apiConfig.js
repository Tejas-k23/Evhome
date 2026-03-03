export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// For debugging in production
if (import.meta.env.PROD) {
    console.log("Production Mode: API_URL =", API_URL);
    if (API_URL.includes("localhost")) {
        console.warn("CRITICAL: Production build is using localhost backend. Ensure VITE_API_URL is set in environment variables.");
    }
} else {
    console.log("Development Mode: API_URL =", API_URL);
}

/**
 * Helper to make authenticated API requests.
 * Automatically attaches the JWT token from localStorage.
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('ev_home_token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
};
