import React, { useState, useEffect } from 'react';
import {
    Search,
    User,
    Car,
    Phone,
    History,
    ReceiptIndianRupee,
    ChevronRight,
    X
} from 'lucide-react';
import { adminUserService } from '../services/adminUserService';
import { adminBookingService } from '../services/adminBookingService';
import { adminBillingService } from '../services/adminBillingService';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState({ bookings: [], bills: [] });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await adminUserService.getAll();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);

        try {
            const [bookings, bills] = await Promise.all([
                adminBookingService.getAll().catch(() => []),
                adminBillingService.getAll().catch(() => [])
            ]);

            const bookingsArr = Array.isArray(bookings) ? bookings : [];
            const billsArr = Array.isArray(bills) ? bills : [];
            const userId = user._id || user.id;

            setUserDetails({
                bookings: bookingsArr.filter(b => (b.userId || b.user) === userId),
                bills: billsArr.filter(b => (b.userId || b.user) === userId)
            });
        } catch (error) {
            console.error("Failed to fetch user details:", error);
            setUserDetails({ bookings: [], bills: [] });
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.mobileNumber.includes(searchTerm) ||
        u.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
                <input
                    type="text"
                    placeholder="Search by name, phone or vehicle..."
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

            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading users...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>USER DETAILS</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>VEHICLE NUMBER</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>CONTACT</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>JOINED DATE</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', textAlign: 'right' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontWeight: '600' }}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{user.name}</p>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>ID: {user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Car size={14} color="#64748B" /> {user.vehicleNumber}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={14} color="#64748B" /> {user.mobileNumber}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleViewUser(user)}
                                            style={{ background: 'none', border: 'none', color: '#0EA5E9', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            View Details <ChevronRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* User Details Modal */}
            {isModalOpen && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>User Profile</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Profile Overview */}
                            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: '#F8FAFC', border: '2px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#64748B', fontWeight: '700' }}>
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <h2 style={{ fontSize: '24px', color: '#1E293B', marginBottom: '8px' }}>{selectedUser.name}</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vehicle</p>
                                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedUser.vehicleNumber}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mobile</p>
                                            <p style={{ margin: 0, fontWeight: '600' }}>{selectedUser.mobileNumber}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Active</p>
                                            <p style={{ margin: 0, fontWeight: '600' }}>{new Date(selectedUser.lastActiveAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748B' }}>Total Bookings</p>
                                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>{userDetails.bookings.length}</p>
                                </div>
                                <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748B' }}>Total Energy</p>
                                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>{userDetails.bills.reduce((sum, b) => sum + b.unitsKwh, 0).toFixed(1)} kWh</p>
                                </div>
                                <div style={{ padding: '20px', background: '#F0FDF4', borderRadius: '16px', border: '1px solid #DCFCE7' }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#166534' }}>Total Spent</p>
                                    <p style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#166534' }}>₹{userDetails.bills.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Tabs / Tables */}
                            <div>
                                <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E2E8F0', marginBottom: '20px' }}>
                                    <button style={{ padding: '12px 0', borderBottom: '2px solid #0EA5E9', background: 'none', border: 'none', color: '#0EA5E9', fontWeight: '600', cursor: 'pointer' }}>Booking History</button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {userDetails.bookings.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>No bookings found.</p>
                                    ) : userDetails.bookings.map(booking => (
                                        <div key={booking.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                                                    <History size={20} />
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px' }}>Station ID: {booking.stationId}</p>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{new Date(booking.startTime).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                backgroundColor: booking.status === 'COMPLETED' ? '#ECFDF5' : '#FEF3C7',
                                                color: booking.status === 'COMPLETED' ? '#059669' : '#D97706'
                                            }}>{booking.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
