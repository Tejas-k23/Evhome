import React, { useState, useEffect } from 'react';
import {
    ReceiptIndianRupee,
    Search,
    Download,
    CheckCircle2,
    Clock,
    CreditCard,
    TrendingUp,
    Zap,
    User
} from 'lucide-react';
import { adminBillingService } from '../services/adminBillingService';

const Bills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [revenue, setRevenue] = useState(0);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        setLoading(true);
        const data = await adminBillingService.getAll();
        const total = await adminBillingService.getTotalRevenue();
        setBills(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setRevenue(total);
        setLoading(false);
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleTogglePayment = async (bill) => {
        const newStatus = bill.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';
        await adminBillingService.updatePaymentStatus(bill.id, newStatus);
        showToast(`Bill marked as ${newStatus}`);
        fetchBills();
    };

    const filteredBills = bills.filter(b =>
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Revenue Summary Card */}
            <div style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                borderRadius: '24px',
                padding: '32px',
                color: 'white',
                boxShadow: '0 20px 25px -5px rgba(2, 132, 199, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>Total Revenue (PAID)</p>
                        <h1 style={{ margin: 0, fontSize: '48px', color: 'white', fontWeight: '800' }}>₹{revenue.toLocaleString()}</h1>
                    </div>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={32} />
                    </div>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', gap: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.8 }}>Total Bills</p>
                        <p style={{ margin: 0, fontWeight: '700' }}>{bills.length}</p>
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', opacity: 0.8 }}>Avg. Ticket Size</p>
                        <p style={{ margin: 0, fontWeight: '700' }}>₹{(revenue / (bills.filter(b => b.paymentStatus === 'PAID').length || 1)).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '350px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search by Bill or User ID..."
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
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}>
                        <Download size={18} /> Export CSV
                    </button>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading billing data...</div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>BILL ID</th>
                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>USER / BOOKING</th>
                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>UNITS</th>
                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>AMOUNT</th>
                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>STATUS</th>
                                    <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.map((bill) => (
                                    <tr key={bill.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{bill.id}</p>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>{new Date(bill.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} color="#64748B" />
                                                <span style={{ fontSize: '14px', color: '#1E293B', fontWeight: '500' }}>{bill.userId}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <CreditCard size={14} color="#94A3B8" />
                                                <span style={{ fontSize: '12px', color: '#64748B' }}>B-{bill.bookingId}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Zap size={14} color="#F59E0B" />
                                                <span style={{ fontSize: '14px', fontWeight: '600' }}>{bill.unitsKwh} kWh</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>₹{bill.amount.toFixed(2)}</span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                backgroundColor: bill.paymentStatus === 'PAID' ? '#ECFDF5' : '#FFF7ED',
                                                color: bill.paymentStatus === 'PAID' ? '#059669' : '#C2410C'
                                            }}>
                                                {bill.paymentStatus === 'PAID' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                                {bill.paymentStatus}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => handleTogglePayment(bill)}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '10px',
                                                    border: '1px solid #E2E8F0',
                                                    background: 'white',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    color: bill.paymentStatus === 'PAID' ? '#EF4444' : '#10B981'
                                                }}
                                            >
                                                {bill.paymentStatus === 'PAID' ? 'Mark Unpaid' : 'Mark Paid'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: '#1E293B', color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', zIndex: 3000 }}>
                    <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                    <span>{toast}</span>
                </div>
            )}
        </div>
    );
};

export default Bills;
