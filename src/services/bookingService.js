/**
 * Mock Booking Service
 */

const BOOKINGS_KEY = 'ev_home_bookings';
const BILLS_KEY = 'ev_home_bills';

const getBookings = () => JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
const saveBookings = (bookings) => localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

const getBills = () => JSON.parse(localStorage.getItem(BILLS_KEY) || '[]');
const saveBills = (bills) => localStorage.setItem(BILLS_KEY, JSON.stringify(bills));

export const bookingService = {
    createBooking: async (userId, startTime, endTime) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMinutes = Math.round((end - start) / (1000 * 60));

        const newBooking = {
            id: Date.now().toString(),
            userId,
            startTime,
            endTime,
            durationMinutes,
            status: 'BOOKED',
            createdAt: new Date().toISOString()
        };

        const bookings = getBookings();
        bookings.push(newBooking);
        saveBookings(bookings);

        return { success: true, booking: newBooking };
    },

    getUserBookings: async (userId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const bookings = getBookings();
        return bookings.filter(b => b.userId === userId).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    },

    startCharging: async (bookingId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const bookings = getBookings();
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[index].status = 'ACTIVE';
            saveBookings(bookings);
            return { success: true, booking: bookings[index] };
        }
        return { success: false, message: 'Booking not found' };
    },

    stopCharging: async (bookingId, energyKwh, cost) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const bookings = getBookings();
        const index = bookings.findIndex(b => b.id === bookingId);

        if (index !== -1) {
            const booking = bookings[index];
            booking.status = 'COMPLETED';
            saveBookings(bookings);

            // Generate Bill
            const bill = {
                id: Date.now().toString(),
                userId: booking.userId,
                bookingId: booking.id,
                amount: cost,
                unitsKwh: energyKwh,
                createdAt: new Date().toISOString()
            };

            const bills = getBills();
            bills.push(bill);
            saveBills(bills);

            return { success: true, booking, bill };
        }
        return { success: false, message: 'Booking not found' };
    },

    getUserBills: async (userId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const bills = getBills();
        return bills.filter(b => b.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
};
