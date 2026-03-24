import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { bookingService } from '../services/bookingService';

export const Bookings = () => {
    const { currentUser } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await bookingService.getUserBookings();
                setBookings(res.bookings || []);
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [currentUser]);

    return (
        <div className="section" style={{ paddingTop: '120px', minHeight: '100vh', backgroundColor: 'var(--gray-50)' }}>
            <div className="container">
                <h2 className="mb-4">Booking History</h2>
                <div className="service-card">
                    {loading ? (
                        <p className="text-center py-5">Loading...</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>Date</th>
                                        <th>Time Slot</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.length > 0 ? bookings.map(b => (
                                        <tr key={b._id || b.id}>
                                            <td className="small text-muted">#{(b._id || b.id).slice(-6)}</td>
                                            <td>{new Date(b.startTime).toLocaleDateString()}</td>
                                            <td>
                                                {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td>{b.durationMinutes} mins</td>
                                            <td>
                                                <span className={`badge ${b.status === 'COMPLETED' ? 'bg-success' : b.status === 'ACTIVE' ? 'bg-primary' : b.status === 'CANCELLED' ? 'bg-danger' : 'bg-warning'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">No booking history found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Bills = () => {
    const { currentUser } = useAuth();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const res = await bookingService.getUserBills();
                setBills(res.bills || []);
            } catch (err) {
                console.error("Failed to fetch bills:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, [currentUser]);

    return (
        <div className="section" style={{ paddingTop: '120px', minHeight: '100vh', backgroundColor: 'var(--gray-50)' }}>
            <div className="container">
                <h2 className="mb-4">My Bills</h2>
                <div className="service-card">
                    {loading ? (
                        <p className="text-center py-5">Loading...</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Bill ID</th>
                                        <th>Date</th>
                                        <th>Energy Consumed</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.length > 0 ? bills.map(bill => (
                                        <tr key={bill._id || bill.id}>
                                            <td className="small text-muted">#{(bill._id || bill.id).slice(-6)}</td>
                                            <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                                            <td>{bill.unitsKwh} kWh</td>
                                            <td className="fw-bold text-primary">₹{bill.amount}</td>
                                            <td><span className="badge bg-success">PAID</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">No bills found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
