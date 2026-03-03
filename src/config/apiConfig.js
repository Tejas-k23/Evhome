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
const normalizedApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

/**
 * Helper to make authenticated API requests.
 * Automatically attaches the JWT token from localStorage.
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('ev_home_token') || localStorage.getItem('adminToken');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${normalizedApiUrl}${normalizedEndpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Expected JSON response but received ${contentType || 'unknown content'}. Status: ${response.status}. Body snippet: ${text.slice(0, 100)}`);
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || `API request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Fetch Error [${url}]:`, error.message);
        throw error;
    }
};
