import React, { useState, useEffect } from 'react';
import {
    IndianRupee,
    Download,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    FileText,
    Search,
    Filter
} from 'lucide-react';
import { ownerRevenueService } from '../services/ownerRevenueService';
import { ownerAuthService } from '../services/ownerAuthService';

const RevenueBills = () => {
    const [stats, setStats] = useState({
        todayRevenue: 0,
        monthlyRevenue: 0,
        totalRevenue: 0,
        billCount: 0,
        paidBillCount: 0
    });
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const owner = ownerAuthService.getCurrentOwner();

    useEffect(() => {
        const fetchRevenueData = async () => {
            if (!owner) {
                setBills([]);
                setLoading(false);
                return;
            }
            try {
                const data = await ownerRevenueService.getRevenueStats();
                setStats({
                    ...data,
                    billCount: data.count || data.bills?.length || 0
                });
                setBills(Array.isArray(data.bills) ? data.bills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenueData();
    }, [owner]);

    const handleViewBill = (bill) => {
        alert(`Viewing Bill #${bill.id.split('-')[1] || bill.id}\nStation: ${bill.stationId}\nAmount: ₹${bill.amount}\nStatus: ${bill.paymentStatus}`);
    };

    const handleDownloadCSV = () => {
        // Simple simulation of CSV download
        alert("Downloading Revenue Report (CSV)...");
    };

    if (loading) return <div className="p-4">Loading revenue data...</div>;

    if (!owner) return <div className="p-4 text-muted">Owner account not found. Please log in again.</div>;

    return (
        <div className="revenue-bills">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Revenue & Billing</h4>
                    <p className="text-muted small mb-0">Track your earnings and generated bills.</p>
                </div>
                <button
                    onClick={handleDownloadCSV}
                    className="btn btn-outline-success d-flex align-items-center gap-2"
                    style={{ borderRadius: '12px', fontWeight: '600' }}
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)', color: 'white' }}>
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IndianRupee size={24} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '6px' }}>TOTAL</span>
                        </div>
                        <h6 className="mb-1" style={{ opacity: 0.8 }}>Overall Revenue</h6>
                        <h2 className="fw-800 mb-0">₹{stats.totalRevenue.toLocaleString()}</h2>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div style={{ width: '48px', height: '48px', background: '#F0FDF4', color: '#22C55E', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={24} />
                            </div>
                            <span className="text-success small fw-bold"><TrendingUp size={14} /> +8.2%</span>
                        </div>
                        <h6 className="text-muted small mb-1">This Month</h6>
                        <h3 className="fw-800 mb-0">₹{stats.monthlyRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                        <div className="d-flex justify-content-between align-items-start mb-4">
                            <div style={{ width: '48px', height: '48px', background: '#EFF6FF', color: '#3B82F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={24} />
                            </div>
                        </div>
                        <h6 className="text-muted small mb-1">Total Bills</h6>
                        <h3 className="fw-800 mb-0">{stats.billCount}</h3>
                        <p className="small text-muted mb-0">{stats.paidBillCount} Paid • {stats.billCount - stats.paidBillCount} Unpaid</p>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Billing History</h5>
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-light d-flex align-items-center gap-1"><Filter size={14} /> Filter</button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3 text-muted small fw-600">BILL ID</th>
                                <th className="py-3 text-muted small fw-600">STATION</th>
                                <th className="py-3 text-muted small fw-600">DATE</th>
                                <th className="py-3 text-muted small fw-600">UNITS</th>
                                <th className="py-3 text-muted small fw-600">AMOUNT</th>
                                <th className="py-3 text-muted small fw-600">STATUS</th>
                                <th className="pe-4 py-3 text-muted small fw-600 text-end">VIEW</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No bills generated yet</td></tr>
                            ) : bills.map((bill) => (
                                <tr key={bill.id}>
                                    <td className="px-4 fw-bold">#{bill.id.split('-')[1]}</td>
                                    <td>Station_{bill.stationId.split('-')[1]}</td>
                                    <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                                    <td>{bill.unitsKwh} kWh</td>
                                    <td className="fw-bold">₹{bill.amount}</td>
                                    <td>
                                        <span className={`badge ${bill.paymentStatus === 'PAID' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`} style={{ borderRadius: '6px' }}>
                                            {bill.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="pe-4 text-end">
                                        <button className="btn btn-sm btn-light" onClick={() => handleViewBill(bill)}><ArrowUpRight size={14} /></button>
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

export default RevenueBills;
