import React, { useState, useEffect } from 'react';
import {
    Users,
    MapPin,
    CalendarCheck,
    Zap,
    DollarSign,
    TrendingUp,
    ArrowRight
} from 'lucide-react';
import { adminUserService } from '../services/adminUserService';
import { adminStationService } from '../services/adminStationService';
import { adminBookingService } from '../services/adminBookingService';
import { adminBillingService } from '../services/adminBillingService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStations: 0,
        activeBookings: 0,
        completedSessions: 0,
        totalRevenue: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [users, stations, bookings, revenue, bills] = await Promise.all([
                    adminUserService.getAll(),
                    adminStationService.getAll(),
                    adminBookingService.getAll(),
                    adminBillingService.getTotalRevenue(),
                    adminBillingService.getAll()
                ]);

                setStats({
                    totalUsers: users.length,
                    totalStations: stations.length,
                    activeBookings: bookings.filter(b => b.status === "ACTIVE").length,
                    completedSessions: bookings.filter(b => b.status === "COMPLETED").length,
                    totalRevenue: revenue
                });

                setRecentBookings(bookings.slice(0, 5));
                setRecentUsers(users.slice(0, 5));
            } catch (error) {
                console.error("Dashboard data fetch error:", error);
                setError("Failed to load dashboard data. Please check your connection or admin key.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const StatCard = ({ title, value, icon, color, trend }) => (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
                {trend && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontSize: '12px', fontWeight: '600' }}>
                        <TrendingUp size={14} />
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <h3 style={{ fontSize: '14px', color: '#64748B', fontWeight: '500', margin: '0 0 4px 0' }}>{title}</h3>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#1E293B', margin: 0 }}>{value}</p>
            </div>
        </div>
    );

    if (loading) return <div style={{ color: '#64748B' }}>Loading dashboard data...</div>;

    if (error) return (
        <div style={{ padding: '60px', textAlign: 'center', background: '#FEF2F2', borderRadius: '20px', border: '1px solid #FEE2E2', margin: '20px' }}>
            <Zap size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#991B1B', marginBottom: '8px' }}>Dashboard Error</h3>
            <p style={{ color: '#B91C1C', marginBottom: '24px' }}>{error}</p>
            <button
                onClick={() => window.location.reload()}
                style={{ padding: '10px 20px', borderRadius: '10px', background: '#EF4444', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}
            >
                Retry Loading
            </button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px'
            }}>
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<Users size={24} />}
                    color="#8B5CF6"
                    trend="+12%"
                />
                <StatCard
                    title="Charging Stations"
                    value={stats.totalStations}
                    icon={<MapPin size={24} />}
                    color="#3B82F6"
                />
                <StatCard
                    title="Active Bookings"
                    value={stats.activeBookings}
                    icon={<CalendarCheck size={24} />}
                    color="#0EA5E9"
                />
                <StatCard
                    title="Completed Sessions"
                    value={stats.completedSessions}
                    icon={<Zap size={24} />}
                    color="#10B981"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign size={24} />}
                    color="#F59E0B"
                    trend="+8.5%"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
                {/* Recent Bookings */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>Recent Bookings</h3>
                        <button style={{ color: '#0EA5E9', background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View all <ArrowRight size={16} />
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #F1F5F9', textAlign: 'left' }}>
                                    <th style={{ padding: '12px 0', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>User ID</th>
                                    <th style={{ padding: '12px 0', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Station</th>
                                    <th style={{ padding: '12px 0', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Status</th>
                                    <th style={{ padding: '12px 0', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((booking) => (
                                    <tr key={booking.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                                        <td style={{ padding: '16px 0', fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>{booking.userId}</td>
                                        <td style={{ padding: '16px 0', fontSize: '14px', color: '#64748B' }}>{booking.stationId === 'st-1' ? "Nexus Hub" : "Green Charge"}</td>
                                        <td style={{ padding: '16px 0' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                backgroundColor:
                                                    booking.status === 'COMPLETED' ? '#ECFDF5' :
                                                        booking.status === 'ACTIVE' ? '#EFF6FF' :
                                                            booking.status === 'BOOKED' ? '#FEF3C7' : '#FEF2F2',
                                                color:
                                                    booking.status === 'COMPLETED' ? '#059669' :
                                                        booking.status === 'ACTIVE' ? '#2563EB' :
                                                            booking.status === 'BOOKED' ? '#D97706' : '#DC2626'
                                            }}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 0', fontSize: '14px', color: '#64748B' }}>
                                            {new Date(booking.startTime).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Users */}
                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B' }}>New Users</h3>
                        <button style={{ color: '#0EA5E9', background: 'none', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View all <ArrowRight size={16} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentUsers.map((user) => (
                            <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '12px', background: '#F8FAFC' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#E2E8F0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#64748B',
                                        fontWeight: '600'
                                    }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{user.name}</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{user.vehicleNumber}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
