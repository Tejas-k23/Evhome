import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    MapPin,
    CalendarCheck,
    Zap,
    IndianRupee,
    TrendingUp,
    Users,
    ArrowUpRight
} from 'lucide-react';
import { ownerAuthService } from '../services/ownerAuthService';
import { ownerStationService } from '../services/ownerStationService';
import { ownerBookingService } from '../services/ownerBookingService';
import { ownerRevenueService } from '../services/ownerRevenueService';

const OwnerDashboard = () => {
    const [stats, setStats] = useState({
        stations: 0,
        bookings: 0,
        activeSessions: 0,
        revenue: { todayRevenue: 0, monthlyRevenue: 0 }
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const owner = ownerAuthService.getCurrentOwner();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!owner) return;
            try {
                const [myStations, myBookings, revStats] = await Promise.all([
                    ownerStationService.getMyStations(owner.id),
                    ownerBookingService.getBookingsForOwner(owner.id),
                    ownerRevenueService.getRevenueStats(owner.id)
                ]);

                setStats({
                    stations: myStations.length,
                    bookings: myBookings.length,
                    activeSessions: myBookings.filter(b => b.status === "ACTIVE").length,
                    revenue: revStats
                });

                setRecentBookings(myBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [owner]);

    if (loading) return <div>Loading dashboard...</div>;

    const cards = [
        { title: 'My Stations', value: stats.stations, icon: <MapPin />, color: '#3B82F6', bg: '#EFF6FF' },
        { title: 'Total Bookings', value: stats.bookings, icon: <CalendarCheck />, color: '#F59E0B', bg: '#FFFBEB' },
        { title: 'Active Sessions', value: stats.activeSessions, icon: <Zap />, color: '#10B981', bg: '#ECFDF5' },
        { title: 'Today\'s Revenue', value: `₹${stats.revenue.todayRevenue}`, icon: <IndianRupee />, color: '#8B5CF6', bg: '#F5F3FF' },
    ];

    return (
        <div className="owner-dashboard">
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold mb-1">Welcome back, {owner?.name}!</h4>
                    <p className="text-muted small mb-0">Here's what's happening at your stations today.</p>
                </div>
                <div style={{ background: 'white', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '14px', fontWeight: '500' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="row g-4 mb-5">
                {cards.map((card, i) => (
                    <div className="col-md-3" key={i}>
                        <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '20px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            border: '1px solid #F1F5F9'
                        }}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: card.bg,
                                    color: card.color,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {card.icon}
                                </div>
                                <span className="badge" style={{ background: '#ECFDF5', color: '#10B981', fontWeight: '600' }}>Active <TrendingUp size={12} /></span>
                            </div>
                            <h6 className="text-muted small mb-1">{card.title}</h6>
                            <h3 className="fw-bold mb-0">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Recent Bookings</h5>
                            <button
                                onClick={() => navigate('/owner/bookings')}
                                style={{ background: 'none', border: 'none', color: '#22C55E', fontWeight: '600', fontSize: '14px' }}
                            >
                                View All
                            </button>
                        </div>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="text-muted small fw-600">ID</th>
                                        <th className="text-muted small fw-600">Station</th>
                                        <th className="text-muted small fw-600">Date</th>
                                        <th className="text-muted small fw-600">Status</th>
                                        <th className="text-muted small fw-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">No recent bookings</td></tr>
                                    ) : recentBookings.map((b) => (
                                        <tr key={b.id}>
                                            <td className="fw-500">#{b.id.split('-')[1] || b.id}</td>
                                            <td>{b.stationName || 'Downtown Hub'}</td>
                                            <td>{new Date(b.startTime).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${b.status === 'COMPLETED' ? 'bg-success-subtle text-success' :
                                                    b.status === 'ACTIVE' ? 'bg-primary-subtle text-primary' :
                                                        b.status === 'CANCELLED' ? 'bg-danger-subtle text-danger' :
                                                            'bg-warning-subtle text-warning'
                                                    }`} style={{ borderRadius: '8px' }}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-light"
                                                    style={{ borderRadius: '8px' }}
                                                    onClick={() => navigate('/owner/bookings')}
                                                >
                                                    <ArrowUpRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9', height: '100%' }}>
                        <h5 className="fw-bold mb-4">Revenue Overview</h5>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted small">Monthly Target</span>
                                <span className="fw-bold small">₹{stats.revenue.monthlyRevenue} / ₹50,000</span>
                            </div>
                            <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${Math.min((stats.revenue.monthlyRevenue / 50000) * 100, 100)}%` }}></div>
                            </div>
                        </div>

                        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px' }}>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div style={{ width: '10px', height: '10px', background: '#3B82F6', borderRadius: '2px' }}></div>
                                <span className="text-muted small">Total Earnings</span>
                                <span className="ms-auto fw-bold">₹{stats.revenue.totalRevenue}</span>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width: '10px', height: '10px', background: '#22C55E', borderRadius: '2px' }}></div>
                                <span className="text-muted small">Settlements</span>
                                <span className="ms-auto fw-bold">₹{stats.revenue.totalRevenue}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
