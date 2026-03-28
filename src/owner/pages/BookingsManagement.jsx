import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    User,
    Power,
    CheckCircle,
    XCircle,
    Play,
    StopCircle,
    Filter,
    Search
} from 'lucide-react';
import { ownerBookingService } from '../services/ownerBookingService';
import { ownerSessionService } from '../services/ownerSessionService';
import { ownerAuthService } from '../services/ownerAuthService';

const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const owner = ownerAuthService.getCurrentOwner();
    const ownerId = owner?.id || owner?._id || null;
    const getShortId = (value) => {
        const safeValue = String(value || '');
        return safeValue.includes('-') ? safeValue.split('-')[1] : safeValue.slice(-6) || 'N/A';
    };

    const fetchBookings = async () => {
        if (!owner) {
            setBookings([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const data = await ownerBookingService.getBookingsForOwner();
            setBookings(data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [ownerId]);

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            await ownerBookingService.updateBookingStatus(bookingId, status);
            // Redundant call removed - backend /start already handles activation
            fetchBookings();
        } catch (err) {
            alert(err.message);
        }
    };

    const stopCharging = async (booking) => {
        try {
            await ownerSessionService.stopSession(booking.id);
            fetchBookings();
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredBookings = filterStatus === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filterStatus);

    if (loading) return <div className="p-4">Loading bookings...</div>;

    if (!owner) {
        return <div className="p-4 text-muted">Owner account not found. Please log in again.</div>;
    }

    return (
        <div className="bookings-management">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Bookings Management</h4>
                    <p className="text-muted small mb-0">Track and manage charging requests from users.</p>
                </div>
                <div className="d-flex gap-3">
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-white border-end-0 rounded-start-3"><Search size={16} className="text-muted" /></span>
                        <input type="text" className="form-control border-start-0 rounded-end-3" placeholder="Search by ID or User..." />
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-header bg-white border-bottom p-3">
                    <div className="d-flex gap-2">
                        {['ALL', 'BOOKED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`btn btn-sm ${filterStatus === s ? 'btn-success' : 'btn-light'} px-3 rounded-pill`}
                                style={{ fontSize: '12px', fontWeight: '600' }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 text-muted small fw-600">BOOKING ID</th>
                                <th className="py-3 text-muted small fw-600">USER</th>
                                <th className="py-3 text-muted small fw-600">DATE & TIME</th>
                                <th className="py-3 text-muted small fw-600">STATUS</th>
                                <th className="py-3 text-muted small fw-600">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-5 text-muted">No bookings found matching your filter</td></tr>
                            ) : filteredBookings.map((b) => (
                                <tr key={b.id}>
                                    <td className="px-4">
                                        <div className="fw-bold text-dark">#{getShortId(b.id)}</div>
                                        <div className="small text-muted">{b.stationName || b.stationId || 'Unknown station'}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: '32px', height: '32px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={16} className="text-muted" />
                                            </div>
                                            <span className="fw-500">User_{getShortId(b.userId)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <div className="d-flex align-items-center gap-1 small fw-500">
                                                <Calendar size={12} /> {new Date(b.startTime).toLocaleDateString()}
                                            </div>
                                            <div className="d-flex align-items-center gap-1 small text-muted mt-1">
                                                <Clock size={12} /> {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${b.status === 'COMPLETED' ? 'bg-success-subtle text-success' :
                                            b.status === 'ACTIVE' ? 'bg-primary-subtle text-primary' :
                                                b.status === 'CANCELLED' ? 'bg-danger-subtle text-danger' :
                                                    'bg-warning-subtle text-warning'
                                            }`} style={{ borderRadius: '8px', padding: '6px 12px' }}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="pe-4">
                                        <div className="d-flex gap-2">
                                            {b.status === 'BOOKED' && (
                                                <>
                                                    <button onClick={() => handleStatusUpdate(b.id, 'ACTIVE')} className="btn btn-sm btn-success d-flex align-items-center gap-1" style={{ borderRadius: '8px' }}>
                                                        <Play size={14} /> Start
                                                    </button>
                                                    <button onClick={() => handleStatusUpdate(b.id, 'CANCELLED')} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" style={{ borderRadius: '8px' }}>
                                                        <XCircle size={14} /> Cancel
                                                    </button>
                                                </>
                                            )}
                                            {b.status === 'ACTIVE' && (
                                                <button onClick={() => stopCharging(b)} className="btn btn-sm btn-danger d-flex align-items-center gap-1" style={{ borderRadius: '8px' }}>
                                                    <StopCircle size={14} /> Stop
                                                </button>
                                            )}
                                            {b.status === 'COMPLETED' && (
                                                <button className="btn btn-sm btn-light text-muted" style={{ borderRadius: '8px' }} disabled>Finished</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookingsManagement;
