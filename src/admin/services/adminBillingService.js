const BILLS_KEY = "evhome_bills";

const initialBills = [
    {
        id: "bill-1",
        userId: "u-1",
        bookingId: "b-1",
        amount: 193.75,
        unitsKwh: 15.5,
        paymentStatus: "PAID",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "bill-2",
        userId: "u-2",
        bookingId: "b-2",
        amount: 224.0,
        unitsKwh: 22.4,
        paymentStatus: "PAID",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "bill-3",
        userId: "u-3",
        bookingId: "b-4",
        amount: 42.0,
        unitsKwh: 4.2,
        paymentStatus: "UNPAID",
        createdAt: new Date().toISOString()
    }
];

const getBills = () => {
    const data = localStorage.getItem(BILLS_KEY);
    if (!data) {
        localStorage.setItem(BILLS_KEY, JSON.stringify(initialBills));
        return initialBills;
    }
    return JSON.parse(data);
};

const saveBills = (bills) => {
    localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
};

export const adminBillingService = {
    getAll: async () => {
        await new Promise(resolve => setTimeout(resolve, 450));
        return getBills();
    },

    updatePaymentStatus: async (id, status) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const bills = getBills();
        const index = bills.findIndex(b => b.id === id);
        if (index !== -1) {
            bills[index].paymentStatus = status;
            saveBills(bills);
            return bills[index];
        }
        return null;
    },

    getTotalRevenue: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const bills = getBills();
        return bills
            .filter(b => b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.amount, 0);
    }
};
