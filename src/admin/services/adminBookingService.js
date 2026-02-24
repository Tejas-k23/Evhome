const BOOKINGS_KEY = "evhome_bookings";
const SESSIONS_KEY = "evhome_sessions";

const initialBookings = [
    {
        id: "b-1",
        userId: "u-1",
        stationId: "st-1",
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "b-2",
        userId: "u-2",
        stationId: "st-2",
        startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 3600000).toISOString()
    },
    {
        id: "b-3",
        userId: "u-1",
        stationId: "st-1",
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        status: "BOOKED",
        createdAt: new Date().toISOString()
    },
    {
        id: "b-4",
        userId: "u-3",
        stationId: "st-2",
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 1800000).toISOString()
    },
    {
        id: "b-5",
        userId: "u-2",
        stationId: "st-1",
        startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
        status: "CANCELLED",
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
    }
];

const initialSessions = [
    {
        id: "sess-1",
        bookingId: "b-1",
        voltage: 230.5,
        current: 16.2,
        energyKwh: 15.5,
        cost: 193.75,
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "sess-2",
        bookingId: "b-2",
        voltage: 228.1,
        current: 15.8,
        energyKwh: 22.4,
        cost: 224.0,
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "sess-4",
        bookingId: "b-4",
        voltage: 231.2,
        current: 32.0,
        energyKwh: 4.2,
        cost: 42.0,
        updatedAt: new Date().toISOString()
    }
];

const getBookings = () => {
    const data = localStorage.getItem(BOOKINGS_KEY);
    if (!data) {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(initialBookings));
        return initialBookings;
    }
    return JSON.parse(data);
};

const getSessions = () => {
    const data = localStorage.getItem(SESSIONS_KEY);
    if (!data) {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(initialSessions));
        return initialSessions;
    }
    return JSON.parse(data);
};

const saveBookings = (bookings) => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const adminBookingService = {
    getAll: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return getBookings();
    },

    getById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const bookings = getBookings();
        return bookings.find(b => b.id === id);
    },

    getSessionByBookingId: async (bookingId) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const sessions = getSessions();
        return sessions.find(s => s.bookingId === bookingId);
    },

    updateStatus: async (id, status) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const bookings = getBookings();
        const index = bookings.findIndex(b => b.id === id);
        if (index !== -1) {
            bookings[index].status = status;
            saveBookings(bookings);
            return bookings[index];
        }
        return null;
    }
};
