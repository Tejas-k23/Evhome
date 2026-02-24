import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAPBOX_CONFIG } from '../../config/mapboxConfig';
import {
    Plus,
    Search,
    MapPin,
    Edit2,
    Trash2,
    Power,
    Check,
    X,
    AlertTriangle
} from 'lucide-react';
import { adminStationService } from '../services/adminStationService';

const Stations = () => {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [deletingStationId, setDeletingStationId] = useState(null);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        socketCount: 1,
        pricePerKwh: 0,
        status: 'ACTIVE',
        lat: MAPBOX_CONFIG.defaultCenter[1],
        lng: MAPBOX_CONFIG.defaultCenter[0]
    });

    const [viewState, setViewState] = useState({
        longitude: MAPBOX_CONFIG.defaultCenter[0],
        latitude: MAPBOX_CONFIG.defaultCenter[1],
        zoom: MAPBOX_CONFIG.defaultZoom
    });

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        setLoading(true);
        const data = await adminStationService.getAll();
        setStations(data);
        setLoading(false);
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleOpenModal = (station = null) => {
        if (station) {
            setEditingStation(station);
            const lat = station.lat || MAPBOX_CONFIG.defaultCenter[1];
            const lng = station.lng || MAPBOX_CONFIG.defaultCenter[0];
            setFormData({
                name: station.name,
                location: station.location,
                socketCount: station.socketCount,
                pricePerKwh: station.pricePerKwh,
                status: station.status,
                lat,
                lng
            });
            setViewState({
                longitude: lng,
                latitude: lat,
                zoom: 14
            });
        } else {
            setEditingStation(null);
            setFormData({
                name: '',
                location: '',
                socketCount: 1,
                pricePerKwh: 10,
                status: 'ACTIVE',
                lat: MAPBOX_CONFIG.defaultCenter[1],
                lng: MAPBOX_CONFIG.defaultCenter[0]
            });
            setViewState({
                longitude: MAPBOX_CONFIG.defaultCenter[0],
                latitude: MAPBOX_CONFIG.defaultCenter[1],
                zoom: MAPBOX_CONFIG.defaultZoom
            });
        }
        setIsModalOpen(true);
    };

    const handleMapClick = (e) => {
        const { lng, lat } = e.lngLat;
        setFormData({ ...formData, lat, lng });
        setViewState({
            ...viewState,
            longitude: lng,
            latitude: lat,
            zoom: 14,
            transitionDuration: 1000
        });
    };

    // Auto-center map when location is entered
    const handleLocationBlur = async () => {
        if (!formData.location || formData.location.trim() === '') return;

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(formData.location)}.json?access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                setFormData(prev => ({ ...prev, lat, lng }));
                setViewState({
                    longitude: lng,
                    latitude: lat,
                    zoom: 14,
                    transitionDuration: 1000
                });
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure coordinates are valid numbers before submitting
        const lat = parseFloat(formData.lat);
        const lng = parseFloat(formData.lng);

        if (isNaN(lat) || isNaN(lng)) {
            showToast("Invalid coordinates. Please select a location on the map.");
            return;
        }

        const submissionData = {
            ...formData,
            lat,
            lng,
            socketCount: parseInt(formData.socketCount) || 1,
            pricePerKwh: parseFloat(formData.pricePerKwh) || 0
        };

        try {
            if (editingStation) {
                await adminStationService.update(editingStation.id, submissionData);
                showToast("Station updated successfully!");
            } else {
                await adminStationService.create(submissionData);
                showToast("Station added successfully!");
            }
            setIsModalOpen(false);
            fetchStations();
        } catch (error) {
            console.error("Error saving station:", error);
            showToast("Error saving station");
        }
    };

    const handleDelete = async () => {
        if (deletingStationId) {
            await adminStationService.delete(deletingStationId);
            showToast("Station deleted successfully!");
            setIsConfirmOpen(false);
            setDeletingStationId(null);
            fetchStations();
        }
    };

    const toggleStatus = async (station) => {
        const newStatus = station.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await adminStationService.update(station.id, { status: newStatus });
        showToast(`Station ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
        fetchStations();
    };

    const filteredStations = stations.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ position: 'relative', minWidth: '300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search stations..."
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
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        background: '#0EA5E9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={20} /> Add Station
                </button>
            </div>

            {/* Stations Table */}
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading stations...</div>
                ) : filteredStations.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <div style={{ color: '#E2E8F0', marginBottom: '16px' }}><MapPin size={48} style={{ margin: '0 auto' }} /></div>
                        <h3 style={{ color: '#1E293B', marginBottom: '8px' }}>No stations yet</h3>
                        <p style={{ color: '#64748B', maxWidth: '300px', margin: '0 auto' }}>Add your first charging station to start managing sessions.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>STATION NAME</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>LOCATION</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>SOCKETS</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>PRICE</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>STATUS</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '600', color: '#64748B', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStations.map((station) => (
                                <tr key={station.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{station.name}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748B' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MapPin size={14} /> {station.location}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B' }}>{station.socketCount} Units</td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#1E293B' }}>₹{station.pricePerKwh}/kWh</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            backgroundColor: station.status === 'ACTIVE' ? '#ECFDF5' : '#F1F5F9',
                                            color: station.status === 'ACTIVE' ? '#059669' : '#64748B'
                                        }}>
                                            {station.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                            <button
                                                onClick={() => toggleStatus(station)}
                                                title={station.status === 'ACTIVE' ? "Deactivate" : "Activate"}
                                                style={{ background: 'none', border: 'none', color: station.status === 'ACTIVE' ? '#F59E0B' : '#10B981', cursor: 'pointer' }}
                                            >
                                                <Power size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(station)}
                                                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setDeletingStationId(station.id); setIsConfirmOpen(true); }}
                                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal - Add/Edit */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{editingStation ? 'Edit Station' : 'Add New Station'}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Station Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Location (Address)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            onBlur={handleLocationBlur}
                                            placeholder="Enter city or address"
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Sockets</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                value={formData.socketCount}
                                                onChange={(e) => setFormData({ ...formData, socketCount: parseInt(e.target.value) })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Price/kWh (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.1"
                                                value={formData.pricePerKwh}
                                                onChange={(e) => setFormData({ ...formData, pricePerKwh: parseFloat(e.target.value) })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Latitude</label>
                                            <input
                                                type="text"
                                                readOnly
                                                value={typeof formData.lat === 'number' && !isNaN(formData.lat) ? formData.lat.toFixed(6) : 'Select on map'}
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Longitude</label>
                                            <input
                                                type="text"
                                                readOnly
                                                value={typeof formData.lng === 'number' && !isNaN(formData.lng) ? formData.lng.toFixed(6) : 'Select on map'}
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600' }}>Select Location on Map</label>
                                    <div style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                        <Map
                                            {...viewState}
                                            onMove={evt => setViewState(evt.viewState)}
                                            onClick={handleMapClick}
                                            mapStyle="mapbox://styles/mapbox/streets-v12"
                                            mapboxAccessToken={MAPBOX_TOKEN}
                                        >
                                            <NavigationControl position="top-right" />
                                            <Marker
                                                latitude={formData.lat}
                                                longitude={formData.lng}
                                                draggable
                                                onDragEnd={(e) => {
                                                    const { lng, lat } = e.lngLat;
                                                    setFormData({ ...formData, lat, lng });
                                                    setViewState({
                                                        ...viewState,
                                                        longitude: lng,
                                                        latitude: lat,
                                                        transitionDuration: 500
                                                    });
                                                }}
                                            >
                                                <div className="premium-pin" style={{ cursor: 'grab' }}>
                                                    <div className="pin-ring" style={{ borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}></div>
                                                    <div className="pin-core" style={{ backgroundColor: '#EF4444' }}>
                                                        <MapPin size={10} color="white" />
                                                    </div>
                                                    {formData.name && (
                                                        <div className="station-marker-label" style={{
                                                            position: 'absolute',
                                                            bottom: '100%',
                                                            left: '50%',
                                                            transform: 'translateX(-50%) translateY(-8px)'
                                                        }}>
                                                            {formData.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </Marker>
                                        </Map>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#64748B' }}>Click on the map or drag the pin to set the exact location.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#0EA5E9', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Save Station</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2100 }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#FEF2F2', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <AlertTriangle size={32} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Delete Station?</h3>
                        <p style={{ color: '#64748B', marginBottom: '24px' }}>This action cannot be undone. All related booking history will be archived.</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setIsConfirmOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600', cursor: 'pointer' }}>Keep it</button>
                            <button onClick={handleDelete} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#EF4444', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: '#1E293B', color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', zIndex: 3000 }}>
                    <Check size={18} style={{ color: '#10B981' }} />
                    <span>{toast}</span>
                </div>
            )}
        </div>
    );
};

export default Stations;
