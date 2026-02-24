const BOOKINGS_KEY = "evhome_bookings";
const STATIONS_KEY = "evhome_stations";

const getBookings = () => {
    const data = localStorage.getItem(BOOKINGS_KEY);
    return data ? JSON.parse(data) : [];
};

const saveBookings = (bookings) => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const ownerBookingService = {
    getBookingsForOwner: async (ownerId) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const stationsData = localStorage.getItem(STATIONS_KEY);
        const stations = stationsData ? JSON.parse(stationsData) : [];
        const ownerStationIds = stations.filter(s => s.ownerId === ownerId).map(s => s.id);

        const bookings = getBookings();
        return bookings.filter(b => ownerStationIds.includes(b.stationId));
    },

    updateBookingStatus: async (bookingId, status) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const bookings = getBookings();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[index].status = status;
            saveBookings(bookings);
            return bookings[index];
        }
        throw new Error("Booking not found");
    }
};
