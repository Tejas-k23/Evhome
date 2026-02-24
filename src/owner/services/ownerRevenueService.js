const BILLS_KEY = "evhome_bills";
const STATIONS_KEY = "evhome_stations";

export const ownerRevenueService = {
    getRevenueStats: async (ownerId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const stationsData = localStorage.getItem(STATIONS_KEY);
        const stations = stationsData ? JSON.parse(stationsData) : [];
        const ownerStationIds = stations.filter(s => s.ownerId === ownerId).map(s => s.id);

        const billsData = localStorage.getItem(BILLS_KEY);
        const bills = billsData ? JSON.parse(billsData) : [];
        const ownerBills = bills.filter(b => ownerStationIds.includes(b.stationId));

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const todayRevenue = ownerBills
            .filter(b => new Date(b.createdAt) >= startOfToday && b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.amount, 0);

        const monthlyRevenue = ownerBills
            .filter(b => new Date(b.createdAt) >= startOfMonth && b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.amount, 0);

        const totalRevenue = ownerBills
            .filter(b => b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.amount, 0);

        return {
            todayRevenue: parseFloat(todayRevenue.toFixed(2)),
            monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            billCount: ownerBills.length,
            paidBillCount: ownerBills.filter(b => b.paymentStatus === "PAID").length
        };
    },

    getBillsForOwner: async (ownerId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const stationsData = localStorage.getItem(STATIONS_KEY);
        const stations = stationsData ? JSON.parse(stationsData) : [];
        const ownerStationIds = stations.filter(s => s.ownerId === ownerId).map(s => s.id);

        const billsData = localStorage.getItem(BILLS_KEY);
        const bills = billsData ? JSON.parse(billsData) : [];
        return bills.filter(b => ownerStationIds.includes(b.stationId));
    }
};
