import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { bookingService } from '../services/bookingService';
import { iotService } from '../services/iotService';
import { Zap, Battery, Activity, CreditCard, Play, Square, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [activeBooking, setActiveBooking] = useState(null);
    const [upcomingBooking, setUpcomingBooking] = useState(null);
    const [liveData, setLiveData] = useState({
        voltage: '0.0',
        current: '0.0',
        energyKwh: '0.000',
        cost: '0.00'
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentBills, setRecentBills] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const bookingsRes = await bookingService.getUserBookings();
            const billsRes = await bookingService.getUserBills();

            const bookings = bookingsRes.bookings || [];
            const bills = billsRes.bills || [];

            const active = bookings.find(b => b.status === 'ACTIVE');
            const upcoming = bookings.find(b => b.status === 'BOOKED');

            setActiveBooking(active);
            setUpcomingBooking(upcoming);
            setRecentBookings(bookings.slice(0, 5));
            setRecentBills(bills.slice(0, 5));

            if (active) {
                setLiveData(prev => ({
                    ...prev,
                    energyKwh: active.energyKwh || '0.000',
                    cost: active.cost || '0.00'
                }));
            } else {
                setLiveData({
                    voltage: '230.5',
                    current: '0.0',
                    energyKwh: '0.000',
                    cost: '0.00'
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    useEffect(() => {
        const interval = setInterval(() => {
            const status = iotService.generateLiveStatus(activeBooking);
            setLiveData(status);

            if (activeBooking) {
                // Mock update energy in booking object locally for simulator continuity
                setActiveBooking(prev => ({
                    ...prev,
                    energyKwh: status.energyKwh,
                    cost: status.cost
                }));
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [activeBooking]);

    const handleStart = async (bookingId) => {
        try {
            const res = await bookingService.startCharging(bookingId);
            if (res?.message && res?.booking?.status !== 'ACTIVE') {
                alert(res.message);
            }
            if (res.success) {
                fetchData();
            }
        } catch (error) {
            alert(error.message || 'Unable to start the session right now.');
        }
    };

    const handleStop = async (booking) => {
        const bookingId = booking._id || booking.id;
        const res = await bookingService.stopCharging(bookingId, liveData.energyKwh, liveData.cost);
        if (res.success) {
            fetchData();
        }
    };

    if (loading) return <div className="section container text-center">Loading Dashboard...</div>;

    return (
        <div className="section" style={{ paddingTop: '120px', paddingBottom: '100px', backgroundColor: 'var(--gray-50)', minHeight: '100vh' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="mb-1">Hello, {currentUser.vehicleNumber}</h2>
                        <p className="text-muted small">Welcome to your smart EV dashboard</p>
                    </div>
                    <Link to="/book-slot" className="btn-primary-custom">
                        <Zap size={18} className="me-2" /> Book Slot
                    </Link>
                </div>

                {/* Live Status Cards */}
                <div className="row g-4 mb-5">
                    {[
                        { label: 'Voltage', value: `${liveData.voltage} V`, icon: Zap, color: '#0EA5E9' },
                        { label: 'Current', value: `${liveData.current} A`, icon: Activity, color: '#10B981' },
                        { label: 'Energy', value: `${liveData.energyKwh} kWh`, icon: Battery, color: '#F59E0B' },
                        { label: 'Est. Cost', value: `₹${liveData.cost}`, icon: CreditCard, color: '#6366F1' },
                    ].map((stat, i) => (
                        <div className="col-lg-3 col-6" key={i}>
                            <div className="service-card h-100 text-center" style={{ padding: '24px' }}>
                                <div className="mb-3 mx-auto" style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: `${stat.color}15`,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: stat.color
                                }}>
                                    <stat.icon size={24} />
                                </div>
                                <div className="small text-muted mb-1">{stat.label}</div>
                                <div className="h4 mb-0 fw-bold">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4">
                    {/* Main Controls & Status */}
                    <div className="col-lg-8">
                        {activeBooking ? (
                            <div className="service-card border-primary mb-4" style={{ border: '2px solid var(--primary)' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="badge bg-success mb-2">● CHARGING ACTIVE</span>
                                        <h4>Current Session</h4>
                                        <p className="text-muted small mb-0">Started at {new Date(activeBooking.startTime).toLocaleTimeString()}</p>
                                    </div>
                                    <button
                                        onClick={() => handleStop(activeBooking)}
                                        className="btn btn-danger d-flex align-items-center gap-2"
                                        style={{ borderRadius: 'var(--radius-md)', padding: '12px 24px' }}
                                    >
                                        <Square size={18} fill="currentColor" /> Stop Charging
                                    </button>
                                </div>
                            </div>
                        ) : upcomingBooking ? (
                            <div className="service-card mb-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <span className="badge bg-primary mb-2">UPCOMING BOOKING</span>
                                        <h4>Next Scheduled Slot</h4>
                                        <p className="text-muted small mb-0">
                                            Starts in {Math.round((new Date(upcomingBooking.startTime) - new Date()) / (1000 * 60))} mins
                                            ({new Date(upcomingBooking.startTime).toLocaleTimeString()})
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleStart(upcomingBooking._id || upcomingBooking.id)}
                                        className="btn-primary-custom"
                                        style={{ borderRadius: 'var(--radius-md)' }}
                                    >
                                        <Play size={18} fill="currentColor" className="me-2" /> Start Now
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="service-card mb-4 text-center py-5">
                                <div className="mb-3">
                                    <Clock size={48} className="text-muted opacity-25" />
                                </div>
                                <h4>No Active Bookings</h4>
                                <p className="text-muted mb-4">You don't have any charging slots booked for now.</p>
                                <Link to="/book-slot" className="btn-secondary-custom">
                                    Schedule a Slot
                                </Link>
                            </div>
                        )}

                        {/* Recent History */}
                        <div className="service-card mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="mb-0">Recent Bookings</h4>
                                <Link to="/bookings" className="text-primary small fw-bold text-decoration-none">View All</Link>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="small fw-bold">Date</th>
                                            <th className="small fw-bold">Time</th>
                                            <th className="small fw-bold">Duration</th>
                                            <th className="small fw-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentBookings.length > 0 ? recentBookings.map(b => (
                                            <tr key={b._id || b.id}>
                                                <td className="small">{new Date(b.startTime).toLocaleDateString()}</td>
                                                <td className="small">{new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                <td className="small">{b.durationMinutes} mins</td>
                                                <td>
                                                    <span className={`badge ${b.status === 'COMPLETED' ? 'bg-success' : b.status === 'ACTIVE' ? 'bg-primary' : 'bg-warning'}`}>
                                                        {b.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-muted small">No recent bookings</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        <div className="service-card h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="mb-0">Recent Bills</h4>
                                <Link to="/bills" className="text-primary small fw-bold text-decoration-none">View All</Link>
                            </div>
                            {recentBills.length > 0 ? recentBills.map(bill => (
                                <div key={bill._id || bill.id} className="p-3 mb-3 border rounded-3 d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="small fw-bold">₹{bill.amount}</div>
                                        <div className="extra-small text-muted">{new Date(bill.createdAt).toLocaleDateString()} • {bill.unitsKwh} kWh</div>
                                    </div>
                                    <ChevronRight size={16} className="text-muted" />
                                </div>
                            )) : (
                                <div className="text-center py-5 text-muted small">No bills generated yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
