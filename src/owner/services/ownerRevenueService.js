/**
 * Owner Revenue Service
 * Fetches revenue stats via backend API.
 */
import { API_URL } from '../../config/apiConfig';

const getOwnerToken = () => localStorage.getItem('evhome_owner_token');

const ownerFetch = async (endpoint, options = {}) => {
    const token = getOwnerToken();
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
        throw new Error(data.message || 'Owner API request failed');
    }
    return data;
};

export const ownerRevenueService = {
    getRevenueStats: async () => {
        const data = await ownerFetch('/owner/revenue');
        const bills = Array.isArray(data.bills) ? data.bills : [];
        const now = new Date();

        const normalizedBills = bills.map((bill) => ({
            id: bill._id || bill.id,
            stationId: bill.booking?.station?._id || bill.booking?.station?.id || '',
            stationName: bill.booking?.station?.name || '',
            amount: bill.amount || 0,
            unitsKwh: bill.unitsKwh || 0,
            paymentStatus: bill.paymentStatus || 'UNPAID',
            createdAt: bill.createdAt,
            bookingId: bill.booking?._id || bill.booking?.id || '',
            userVehicleNumber: bill.user?.vehicleNumber || '',
            userMobileNumber: bill.user?.mobileNumber || '',
        }));

        const monthlyRevenue = normalizedBills
            .filter((bill) => {
                const createdAt = new Date(bill.createdAt);
                return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
            })
            .reduce((sum, bill) => sum + bill.amount, 0);

        const todayRevenue = normalizedBills
            .filter((bill) => {
                const createdAt = new Date(bill.createdAt);
                return createdAt.toDateString() === now.toDateString();
            })
            .reduce((sum, bill) => sum + bill.amount, 0);

        const paidBillCount = normalizedBills.filter((bill) => bill.paymentStatus === 'PAID').length;

        return {
            totalRevenue: data.totalRevenue || 0,
            count: data.count || normalizedBills.length,
            bills: normalizedBills,
            monthlyRevenue,
            todayRevenue,
            paidBillCount,
        };
    }
};
