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
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Admin API request failed');
    }
    return data;
};

export const adminBillingService = {
    getAll: async () => {
        return adminFetch('/admin/bills');
    },

    updatePaymentStatus: async (id, status) => {
        return adminFetch(`/bills/${id}/pay`, {
            method: 'PUT',
        });
    },

    getTotalRevenue: async () => {
        const bills = await adminFetch('/admin/bills');
        return bills
            .filter(b => b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.amount, 0);
    }
};
