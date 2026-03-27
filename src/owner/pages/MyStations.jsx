import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit2,
    Power,
    MapPin,
    MoreVertical,
    Settings,
    CheckCircle,
    XCircle,
    LayoutGrid
} from 'lucide-react';
import { ownerStationService } from '../services/ownerStationService';
import { ownerAuthService } from '../services/ownerAuthService';

const MyStations = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        socketCount: 1,
        pricePerKwh: 0,
        status: 'ACTIVE'
    });
    const [isSocketModalOpen, setIsSocketModalOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [sockets, setSockets] = useState([]);
    const [socketLoading, setSocketLoading] = useState(false);

    const owner = ownerAuthService.getCurrentOwner();
    const getStationId = (station) => station.id || station._id;

    const fetchStations = async () => {
        if (!owner) return;
        setLoading(true);
        try {
            const data = await ownerStationService.getMyStations();
            setStations(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStations();
    }, [owner]);

    const handleOpenModal = (station = null) => {
        if (station) {
            setEditingStation(station);
            setFormData({
                name: station.name,
                location: station.location,
                socketCount: station.socketCount,
                pricePerKwh: station.pricePerKwh,
                status: station.status
            });
        } else {
            setEditingStation(null);
            setFormData({
                name: '',
                location: '',
                socketCount: 1,
                pricePerKwh: 0,
                status: 'ACTIVE'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStation) {
                await ownerStationService.updateStation(getStationId(editingStation), formData);
            } else {
                await ownerStationService.createStation(formData);
            }
            setIsModalOpen(false);
            fetchStations();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleManageSockets = async (station) => {
        setSelectedStation(station);
        setSocketLoading(true);
        setIsSocketModalOpen(true);
        try {
            const data = await ownerStationService.getSocketsByStation(getStationId(station));
            setSockets(data);
        } catch (err) {
            alert(err.message);
        } finally {
            setSocketLoading(false);
        }
    };

    const toggleSocketStatus = async (socketId, currentStatus) => {
        const newStatus = currentStatus === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
        try {
            await ownerStationService.updateSocketStatus(socketId, newStatus);
            // Refresh local sockets state
            setSockets(prev => prev.map(s => (s.id || s._id) === socketId ? { ...s, status: newStatus } : s));
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleStatus = async (station) => {
        const newStatus = station.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await ownerStationService.updateStation(getStationId(station), { status: newStatus });
            fetchStations();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-4">Loading stations...</div>;

    return (
        <div className="my-stations">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">My Charging Stations</h4>
                    <p className="text-muted small mb-0">Manage and monitor your charging points.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-success d-flex align-items-center gap-2"
                    style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: '600' }}
                >
                    <Plus size={20} /> Add New Station
                </button>
            </div>

            <div className="row g-4">
                {stations.length === 0 ? (
                    <div className="col-12">
                        <div className="text-center py-5 bg-white rounded-4 border">
                            <MapPin size={48} className="text-muted mb-3" />
                            <h5>No stations found</h5>
                            <p className="text-muted">Start by adding your first charging station.</p>
                            <button onClick={() => handleOpenModal()} className="btn btn-outline-success">Add Station</button>
                        </div>
                    </div>
                ) : stations.map((station) => (
                    <div className="col-lg-6 col-xl-4" key={getStationId(station)}>
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            border: '1px solid #F1F5F9',
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid #F1F5F9'
                            }}>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: '#F0FDF4',
                                        color: '#22C55E',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Power size={24} />
                                    </div>
                                    <div className="dropdown">
                                        <button className="btn btn-link text-muted p-0" type="button" data-bs-toggle="dropdown">
                                            <MoreVertical size={20} />
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3">
                                            <li><button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => handleOpenModal(station)}><Edit2 size={16} /> Edit Station</button></li>
                                            <li><button className="dropdown-item d-flex align-items-center gap-2 py-2" onClick={() => toggleStatus(station)}>
                                                {station.status === 'ACTIVE' ? <XCircle size={16} className="text-danger" /> : <CheckCircle size={16} className="text-success" />}
                                                {station.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                            </button></li>
                                        </ul>
                                    </div>
                                </div>
                                <h5 className="fw-bold mb-1">{station.name}</h5>
                                <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                                    <MapPin size={14} />
                                    {station.location}
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className={`badge ${station.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`} style={{ borderRadius: '8px', padding: '6px 12px' }}>
                                        {station.status}
                                    </span>
                                    <span className="fw-bold text-success">₹{station.pricePerKwh}/kWh</span>
                                </div>
                            </div>
                            <div style={{ padding: '16px 24px', background: '#F8FAFC' }} className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small fw-500">
                                    <LayoutGrid size={14} className="me-1" /> {station.socketCount} Sockets
                                </span>
                                <div className="d-flex gap-2">
                                    <button
                                        onClick={() => navigate(`/owner/stations/${getStationId(station)}`)}
                                        className="btn btn-sm btn-success"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <Settings size={14} className="me-1" /> Open Station
                                    </button>
                                    <button
                                        onClick={() => handleManageSockets(station)}
                                        className="btn btn-sm btn-outline-secondary"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        Sockets
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal - Simple implementation with conditional rendering */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '20px'
                }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '500px' }}>
                        <h4 className="fw-bold mb-4">{editingStation ? 'Edit Station' : 'Add New Station'}</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Station Name</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Location</label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-muted">Sockets</label>
                                    <input
                                        type="number"
                                        className="form-control rounded-3"
                                        min="1" max="20"
                                        value={formData.socketCount}
                                        onChange={(e) => setFormData({ ...formData, socketCount: parseInt(e.target.value) })}
                                        required
                                        disabled={editingStation} // Avoid socket mismatch if editing
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label small fw-bold text-muted">Price (₹/kWh)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-control rounded-3"
                                        value={formData.pricePerKwh}
                                        onChange={(e) => setFormData({ ...formData, pricePerKwh: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="d-flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-light flex-grow-1 py-2 rounded-3">Cancel</button>
                                <button type="submit" className="btn btn-success flex-grow-1 py-2 rounded-3">Save Station</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Socket Management Modal */}
            {isSocketModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '20px'
                }}>
                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '600px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold mb-0">Manage Sockets - {selectedStation?.name}</h4>
                            <button onClick={() => setIsSocketModalOpen(false)} className="btn-close"></button>
                        </div>

                        {socketLoading ? (
                            <div className="text-center py-4">Loading sockets...</div>
                        ) : (
                            <div className="row g-3">
                                {sockets.map((socket) => (
                                    <div className="col-md-6" key={socket.id || socket._id}>
                                        <div style={{
                                            padding: '16px',
                                            borderRadius: '16px',
                                            border: '1px solid #E2E8F0',
                                            background: socket.status === 'AVAILABLE' ? '#F0FDF4' :
                                                socket.status === 'CHARGING' ? '#EFF6FF' : '#FFF1F2'
                                        }}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="fw-bold d-block">Socket #{socket.socketNumber}</span>
                                                    <span className={`small ${socket.status === 'AVAILABLE' ? 'text-success' :
                                                        socket.status === 'CHARGING' ? 'text-primary' : 'text-danger'
                                                        } fw-600`}>{socket.status}</span>
                                                </div>
                                                <button
                                                    onClick={() => toggleSocketStatus(socket.id || socket._id, socket.status)}
                                                    disabled={socket.status === 'CHARGING'}
                                                    className={`btn btn-sm ${socket.status === 'AVAILABLE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                    style={{ borderRadius: '8px' }}
                                                >
                                                    {socket.status === 'AVAILABLE' ? 'Disable' : 'Enable'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 pt-3 border-top text-end">
                            <button onClick={() => setIsSocketModalOpen(false)} className="btn btn-success px-4 rounded-3">Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyStations;
