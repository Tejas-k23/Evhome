import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    Activity,
    Gauge,
    BatteryCharging,
    ArrowUpRight,
    IndianRupee
} from 'lucide-react';
import { ownerSessionService } from '../services/ownerSessionService';
import { ownerAuthService } from '../services/ownerAuthService';

const SessionsMonitoring = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ACTIVE');
    const owner = ownerAuthService.getCurrentOwner();
    const navigate = useNavigate();
    const updateInterval = useRef(null);

    const fetchSessions = async () => {
        if (!owner) {
            setSessions([]);
            setLoading(false);
            return;
        }
        try {
            const data = await ownerSessionService.getSessionsForOwner();
            setSessions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();

        // Poll for live session updates from the API
        if (owner) {
            updateInterval.current = setInterval(() => {
                fetchSessions();
            }, 3000);
        }

        return () => clearInterval(updateInterval.current);
    }, [owner]);

    const filteredSessions = sessions.filter((session) => (
        filter === 'ACTIVE' ? (session.current > 0) : (session.current === 0 || !session.current)
    ));

    if (loading) return <div className="p-4">Loading sessions...</div>;

    if (!owner) return <div className="p-4 text-muted">Owner account not found. Please log in again.</div>;

    return (
        <div className="sessions-monitoring">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Live Monitoring</h4>
                    <p className="text-muted small mb-0">Real-time data from your IoT-enabled charging points.</p>
                </div>
                <div className="badge bg-success-subtle text-success p-2 px-3 rounded-pill d-flex align-items-center gap-2">
                    <div className="pulse-dot"></div>
                    Live Update Active
                </div>
            </div>

            <div className="row g-4">
                {filteredSessions.length === 0 ? (
                    <div className="col-12">
                        <div className="text-center py-5 bg-white rounded-4 border">
                            <Zap size={48} className="text-muted mb-3" />
                            <h5>No sessions found</h5>
                            <p className="text-muted">Currently there are no live sessions matching this view.</p>
                        </div>
                    </div>
                ) : filteredSessions.map((session) => (
                    <div className="col-md-6 col-lg-4" key={session.id}>
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            border: '1px solid #F1F5F9',
                            padding: '24px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: 0, right: 0,
                                width: '100px',
                                height: '100px',
                                background: 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.1), transparent)',
                                zIndex: 0
                            }}></div>

                            <div className="d-flex justify-content-between align-items-center mb-4" style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '40px', height: '40px', background: '#F0FDF4', color: '#22C55E',
                                    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <BatteryCharging size={24} />
                                </div>
                                <span className="small fw-bold text-muted">ID: #{String(session.id).slice(-6)}</span>
                            </div>

                            <h5 className="fw-800 mb-2" style={{ position: 'relative', zIndex: 1 }}>
                                {session.stationName || 'Active Session'}
                            </h5>
                            <p className="text-muted small mb-4" style={{ position: 'relative', zIndex: 1 }}>
                                {session.userVehicleNumber || 'Vehicle details unavailable'}
                            </p>

                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px' }}>
                                        <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                            <Gauge size={14} /> Voltage
                                        </div>
                                        <div className="fw-800 text-dark" style={{ fontSize: '18px' }}>{session.voltage || 230}V</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px' }}>
                                        <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                            <Activity size={14} /> Current
                                        </div>
                                        <div className="fw-800 text-primary" style={{ fontSize: '18px' }}>{session.current || 0}A</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px' }}>
                                        <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                            <Zap size={14} /> Energy
                                        </div>
                                        <div className="fw-800 text-success" style={{ fontSize: '18px' }}>{session.energyKwh || 0} kWh</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '16px' }}>
                                        <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                                            <IndianRupee size={14} /> Cost
                                        </div>
                                        <div className="fw-800 text-dark" style={{ fontSize: '18px' }}>₹{session.cost || 0}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                <span className="text-muted small">Updated 2s ago</span>
                                <button
                                    onClick={() => navigate('/owner/bookings')}
                                    className="btn btn-sm btn-link text-success fw-bold p-0 text-decoration-none"
                                >
                                    View Details <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background-color: #22C55E;
                    border-radius: 50%;
                    box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
            `}</style>
        </div>
    );
};

export default SessionsMonitoring;
