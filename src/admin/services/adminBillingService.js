/**
 * Admin Billing Service
 * Fetches all bills via backend admin API.
 */
import { API_URL } from '../../config/apiConfig';

const getAdminToken = () => localStorage.getItem('adminToken');

const adminFetch = async (endpoint, options = {}) => {
    const token = getAdminToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error(`Unexpected non-JSON response from ${endpoint} (status ${response.status})`);
    }
    if (!response.ok) {
        throw new Error(data.message || 'Admin API request failed');
    }
    return data;
};

export const adminBillingService = {
    getAll: async () => {
        const data = await adminFetch('/admin/bills');
        return data.bills || data;
    },

    updatePaymentStatus: async (id, status) => {
        return adminFetch(`/bills/${id}/pay`, {
            method: 'PUT',
            body: JSON.stringify({ paymentStatus: status }),
        });
    },

    getTotalRevenue: async () => {
        const data = await adminFetch('/admin/bills');
        const bills = data.bills || data;
        return (Array.isArray(bills) ? bills : [])
            .filter(b => b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.amount, 0);
    }
};
