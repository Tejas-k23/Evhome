import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAPBOX_CONFIG } from '../config/mapboxConfig';
import { useAuth } from '../context/authContext';
import { bookingService } from '../services/bookingService';
import { stationService } from '../services/stationService';
import { Calendar, Clock, MapPin, Search, ChevronRight, Power } from 'lucide-react';

const BookSlot = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [stations, setStations] = useState([]);
    const [filteredStations, setFilteredStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(() => {
        const s = location.state?.station;
        if (s) return { ...s, id: s._id || s.id };
        return null;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [viewState, setViewState] = useState({
        longitude: location.state?.station?.lng || MAPBOX_CONFIG.defaultCenter[0],
        latitude: location.state?.station?.lat || MAPBOX_CONFIG.defaultCenter[1],
        zoom: location.state?.station ? 14 : 11
    });

    useEffect(() => {
        const fetchStations = async () => {
            try {
                console.log("Fetching stations...");
                const data = await stationService.getAll();
                console.log("Stations fetched:", data);
                const list = Array.isArray(data) ? data : (data?.stations || []);
                const activeStations = list.filter(s => s.status === 'ACTIVE');
                setStations(activeStations);
                setFilteredStations(activeStations);
                if (activeStations.length === 0) {
                    console.warn("No active stations found.");
                }
            } catch (err) {
                console.error("Failed to fetch stations:", err);
                setError("Could not load charging stations. Please check your internet or try again later.");
            }
        };
        fetchStations();
    }, []);

    useEffect(() => {
        const filtered = stations.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredStations(filtered);

        if (filtered.length > 0 && searchQuery.trim() !== '') {
            setViewState({
                longitude: filtered[0].lng,
                latitude: filtered[0].lat,
                zoom: 12,
                transitionDuration: 1000
            });
        }
    }, [searchQuery, stations]);

    useEffect(() => {
        console.log("BookSlot: Selected station changed:", selectedStation);
    }, [selectedStation]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedStation) {
            setError("Please select a charging station first");
            return;
        }
        if (!startTime || !endTime) {
            setError("Please select both start and end times");
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start <= new Date()) {
            setError("Start time must be in the future");
            return;
        }

        if (end <= start) {
            setError("End time must be after start time");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const stationId = selectedStation._id || selectedStation.id;
            console.log("Attempting booking for station:", stationId, { startTime, endTime });

            if (!stationId) {
                setError("Station ID is missing. Please try selecting the station again.");
                return;
            }

            const res = await bookingService.createBooking(stationId, null, startTime, endTime);
            if (res.success) {
                navigate('/dashboard');
            } else {
                setError(res.message || "Failed to create booking.");
            }
        } catch (err) {
            setError(err.message || "Failed to create booking.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section" style={{ paddingTop: '120px', backgroundColor: 'var(--gray-50)', minHeight: '100vh' }}>
            <div className="container">
                <div className="row g-4">
                    {/* Left Column: Station Search & Selection */}
                    <div className="col-lg-7">
                        <div className="service-card" style={{ padding: '32px', height: '100%' }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="mb-0">Select Charging Station</h3>
                                <span className="badge bg-primary-light text-primary px-3 py-2 rounded-pill">
                                    {filteredStations.length} Stations Found
                                </span>
                            </div>

                            <div className="position-relative mb-4">
                                <Search className="position-absolute translate-middle-y top-50 start-0 ms-3 text-muted" size={18} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by city or station name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ padding: '14px 14px 14px 45px', borderRadius: '12px', border: '1px solid var(--gray-200)' }}
                                />
                            </div>

                            <div style={{ height: '400px', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--gray-200)', marginBottom: '24px' }}>
                                <Map
                                    {...viewState}
                                    onMove={evt => setViewState(evt.viewState)}
                                    mapStyle="mapbox://styles/mapbox/streets-v12"
                                    mapboxAccessToken={MAPBOX_TOKEN}
                                >
                                    <NavigationControl position="top-right" />
                                    {filteredStations.map((station) => (
                                        <Marker
                                            key={station.id}
                                            latitude={station.lat}
                                            longitude={station.lng}
                                            onClick={e => {
                                                e.originalEvent.stopPropagation();
                                                setSelectedStation(station);
                                            }}
                                        >
                                            <div className="premium-pin" style={{
                                                transform: selectedStation?.id === station.id ? 'scale(1.3)' : 'scale(1)',
                                                zIndex: selectedStation?.id === station.id ? 10 : 1
                                            }}>
                                                <div className="pin-ring" style={{
                                                    borderColor: selectedStation?.id === station.id ? 'var(--primary)' : 'var(--gray-400)',
                                                    background: selectedStation?.id === station.id ? 'rgba(14, 165, 233, 0.2)' : 'rgba(100, 116, 139, 0.1)'
                                                }}></div>
                                                <div className="pin-core" style={{
                                                    background: selectedStation?.id === station.id ? 'var(--primary)' : 'var(--gray-500)'
                                                }}>
                                                    <Power size={10} />
                                                </div>
                                            </div>
                                        </Marker>
                                    ))}
                                </Map>
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                                {filteredStations.map(station => (
                                    <div
                                        key={station.id}
                                        onClick={() => {
                                            setSelectedStation(station);
                                            setViewState({ longitude: station.lng, latitude: station.lat, zoom: 14, transitionDuration: 500 });
                                        }}
                                        className={`p-3 border rounded-3 mb-2 d-flex align-items-center justify-content-between cursor-pointer transition-all ${selectedStation?.id === station.id ? 'border-primary bg-primary-light' : 'bg-white hover-bg-light'}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div className={`p-2 rounded-circle ${selectedStation?.id === station.id ? 'bg-primary text-white' : 'bg-light text-muted'}`}>
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{station.name}</h6>
                                                <p className="mb-0 small text-muted">{station.location}</p>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-bold text-primary">₹{station.pricePerKwh}/kWh</div>
                                            <div className="small text-muted">{station.socketCount} Units</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking Details */}
                    <div className="col-lg-5">
                        <div className="service-card" style={{ padding: '32px' }}>
                            <h3 className="mb-4">Confirm Your Booking</h3>

                            {error && (
                                <div className="alert alert-danger mb-4" style={{ borderRadius: '12px' }}>
                                    {error}
                                </div>
                            )}

                            {!selectedStation ? (
                                <div className="text-center py-5 border rounded-3 bg-light mb-4">
                                    <div className="text-muted mb-3"><MapPin size={48} className="mx-auto" opacity={0.3} /></div>
                                    <p className="text-muted mb-0">Please select a station from the map or list to proceed.</p>
                                </div>
                            ) : (
                                <div className="p-4 border rounded-4 mb-4 bg-light" style={{ borderColor: 'var(--primary) !important' }}>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="bg-primary text-white p-2 rounded-circle">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <h5 className="mb-0 fw-bold">{selectedStation.name}</h5>
                                            <div className="small text-muted">{selectedStation.location}</div>
                                            <div className="small text-muted mt-1">ID: {selectedStation._id || selectedStation.id}</div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between small">
                                        <span className="text-muted">Price per kWh</span>
                                        <span className="fw-bold">₹{selectedStation.pricePerKwh}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small mt-2">
                                        <span className="text-muted">Available Units</span>
                                        <span className="fw-bold">{selectedStation.socketCount} Sockets</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleBooking}>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-12">
                                        <label className="form-label small fw-bold d-flex align-items-center gap-2">
                                            <Calendar size={14} /> Start Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            required
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--gray-200)' }}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="form-label small fw-bold d-flex align-items-center gap-2">
                                            <Clock size={14} /> End Date & Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            required
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--gray-200)' }}
                                        />
                                    </div>
                                </div>

                                <div className="alert alert-info small" style={{ borderRadius: '12px', background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.2)', color: 'var(--primary)' }}>
                                    <strong>Note:</strong> Final billing will be calculated based on the actual units consumed during your session.
                                </div>

                                <div className="d-flex gap-3">
                                    <button
                                        type="button"
                                        className="btn-secondary-custom w-100"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary-custom w-100"
                                        disabled={loading || !selectedStation}
                                    >
                                        {loading ? 'Processing...' : 'Confirm Slot'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookSlot;
