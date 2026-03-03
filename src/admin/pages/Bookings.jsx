import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    MapPin,
    User,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    MoreVertical,
    Zap,
    Ticket,
    X
} from 'lucide-react';
import { adminBookingService } from '../services/adminBookingService';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminBookingService.getAll();
            setBookings(data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
        } catch (err) {
            console.error("Fetch bookings error:", err);
            setError("Failed to fetch bookings. Please check your connection or admin key.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setActionLoading(true);
        await adminBookingService.updateStatus(id, status);
        await fetchBookings();
        if (selectedBooking && selectedBooking.id === id) {
            const updated = await adminBookingService.getById(id);
            setSelectedBooking(updated);
        }
        setActionLoading(false);
    };

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return { bg: '#ECFDF5', text: '#059669' };
            case 'ACTIVE': return { bg: '#EFF6FF', text: '#2563EB' };
            case 'BOOKED': return { bg: '#FEF3C7', text: '#D97706' };
            case 'CANCELLED': return { bg: '#FEF2F2', text: '#DC2626' };
            default: return { bg: '#F1F5F9', text: '#64748B' };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ position: 'relative', minWidth: '300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search by Booking ID or User ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            outline: 'none',
                            fontSize: '14px'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} color="#64748B" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            outline: 'none',
                            background: 'white',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">All Status</option>
                        <option value="BOOKED">Booked</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Bookings List */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading bookings...</div>
                ) : error ? (
                    <div style={{ padding: '60px', textAlign: 'center', background: '#FEF2F2', borderRadius: '20px', border: '1px solid #FEE2E2' }}>
                        <XCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ color: '#991B1B', marginBottom: '8px' }}>Something went wrong</h3>
                        <p style={{ color: '#B91C1C', marginBottom: '24px' }}>{error}</p>
                        <button
                            onClick={fetchBookings}
                            style={{ padding: '10px 20px', borderRadius: '10px', background: '#EF4444', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                        <Ticket size={48} color="#E2E8F0" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ color: '#1E293B', marginBottom: '8px' }}>No bookings found</h3>
                        <p style={{ color: '#64748B' }}>No results match your current search or filters.</p>
                    </div>
                ) : filteredBookings.map((booking) => (
                    <div key={booking.id} style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '24px'
                    }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', minWidth: '250px' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                background: getStatusColor(booking.status).bg,
                                color: getStatusColor(booking.status).text,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Zap size={24} />
                            </div>
                            <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748B', fontWeight: '500' }}>#{booking.id}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h4 style={{ margin: 0, fontSize: '16px', color: '#1E293B' }}>{booking.userId}</h4>
                                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>•</span>
                                    <span style={{ fontSize: '14px', color: '#64748B' }}>{booking.stationId === 'st-1' ? "Nexus Hub" : "Green Charge"}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '40px', flex: 1, minWidth: '300px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '13px', marginBottom: '4px' }}>
                                    <Calendar size={14} /> Date
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                    {new Date(booking.startTime).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '13px', marginBottom: '4px' }}>
                                    <Clock size={14} /> Time
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#334155' }}>
                                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '13px', marginBottom: '4px' }}>
                                    Status
                                </div>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    backgroundColor: getStatusColor(booking.status).bg,
                                    color: getStatusColor(booking.status).text
                                }}>{booking.status}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {booking.status === 'BOOKED' && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus(booking.id, 'ACTIVE')}
                                        disabled={actionLoading}
                                        style={{ padding: '10px 16px', borderRadius: '10px', background: '#3B82F6', color: 'white', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Start Session
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                                        disabled={actionLoading}
                                        style={{ padding: '10px 16px', borderRadius: '10px', background: 'white', color: '#EF4444', border: '1px solid #FEE2E2', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                            {booking.status === 'ACTIVE' && (
                                <button
                                    onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                                    disabled={actionLoading}
                                    style={{ padding: '10px 16px', borderRadius: '10px', background: '#10B981', color: 'white', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Mark Completed
                                </button>
                            )}
                            <button
                                onClick={() => { setSelectedBooking(booking); setIsDetailOpen(true); }}
                                style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }}
                            >
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Details Modal */}
            {isDetailOpen && selectedBooking && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Booking Details</h3>
                            <button onClick={() => setIsDetailOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ textAlign: 'center', padding: '20px', background: '#F8FAFC', borderRadius: '16px' }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B' }}>Booking ID</p>
                                <h2 style={{ margin: 0, fontSize: '24px', color: '#1E293B' }}>{selectedBooking.id}</h2>
                                <div style={{ marginTop: '12px', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: getStatusColor(selectedBooking.status).bg, color: getStatusColor(selectedBooking.status).text }}>
                                    {selectedBooking.status}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>USER</label>
                                    <p style={{ margin: 0, fontWeight: '600' }}>{selectedBooking.userId}</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>STATION</label>
                                    <p style={{ margin: 0, fontWeight: '600' }}>{selectedBooking.stationId}</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>START TIME</label>
                                    <p style={{ margin: 0, fontSize: '14px' }}>{new Date(selectedBooking.startTime).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>END TIME</label>
                                    <p style={{ margin: 0, fontSize: '14px' }}>{new Date(selectedBooking.endTime).toLocaleString()}</p>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '24px' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#1E293B' }}>Actions</h4>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {selectedBooking.status !== 'CANCELLED' && selectedBooking.status !== 'COMPLETED' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedBooking.id, 'CANCELLED')}
                                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #EF4444', color: '#EF4444', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                    {selectedBooking.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => handleUpdateStatus(selectedBooking.id, 'COMPLETED')}
                                            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#10B981', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                                        >
                                            Force Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
