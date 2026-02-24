const SESSIONS_KEY = "evhome_sessions";
const BILLS_KEY = "evhome_bills";
const STATIONS_KEY = "evhome_stations";

const getSessions = () => {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
};

const saveSessions = (sessions) => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

const getBills = () => {
    const data = localStorage.getItem(BILLS_KEY);
    return data ? JSON.parse(data) : [];
};

const saveBills = (bills) => {
    localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
};

export const ownerSessionService = {
    getSessionsForOwner: async (ownerId) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const stationsData = localStorage.getItem(STATIONS_KEY);
        const stations = stationsData ? JSON.parse(stationsData) : [];
        const ownerStationIds = stations.filter(s => s.ownerId === ownerId).map(s => s.id);

        const sessions = getSessions();
        // We need to link sessions to stations via bookings if stationId is not directly on session
        // For simplicity in demo, we'll assume the session has stationId or we filter by bookingId
        const bookingsData = localStorage.getItem("evhome_bookings");
        const bookings = bookingsData ? JSON.parse(bookingsData) : [];
        const ownerBookingIds = bookings.filter(b => ownerStationIds.includes(b.stationId)).map(b => b.id);

        return sessions.filter(s => ownerBookingIds.includes(s.bookingId));
    },

    startSession: async (bookingId, stationId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const sessions = getSessions();
        const newSession = {
            id: `sess-${Date.now()}`,
            bookingId,
            stationId, // Added for easier filtering
            voltage: 230 + (Math.random() * 10 - 5),
            current: 0,
            energyKwh: 0,
            cost: 0,
            updatedAt: new Date().toISOString()
        };
        sessions.push(newSession);
        saveSessions(sessions);
        return newSession;
    },

    updateLiveSessionData: async (sessionId, stationPricePerKwh) => {
        const sessions = getSessions();
        const index = sessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            const session = sessions[index];
            // Simulate increase
            const current = 16 + (Math.random() * 10); // 16-26A
            const voltage = 220 + (Math.random() * 20); // 220-240V
            const addedEnergy = (current * voltage * (1 / 3600)) / 1000; // Simplified for 1 sec update

            session.current = parseFloat(current.toFixed(2));
            session.voltage = parseFloat(voltage.toFixed(2));
            session.energyKwh = parseFloat((session.energyKwh + addedEnergy).toFixed(4));
            session.cost = parseFloat((session.energyKwh * stationPricePerKwh).toFixed(2));
            session.updatedAt = new Date().toISOString();

            saveSessions(sessions);
            return session;
        }
        return null;
    },

    stopSession: async (sessionId, bookingId, userId, stationId) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const sessions = getSessions();
        const session = sessions.find(s => s.id === sessionId);

        if (session) {
            // Generate Bill
            const bills = getBills();
            const newBill = {
                id: `bill-${Date.now()}`,
                bookingId,
                sessionId,
                userId,
                stationId,
                amount: session.cost,
                unitsKwh: session.energyKwh,
                paymentStatus: "PAID", // Auto-paid for demo
                createdAt: new Date().toISOString()
            };
            bills.push(newBill);
            saveBills(bills);

            return newBill;
        }
        throw new Error("Session not found");
    }
};
