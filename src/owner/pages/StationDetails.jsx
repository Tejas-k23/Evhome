import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    Copy,
    Cpu,
    KeyRound,
    LayoutGrid,
    LoaderCircle,
    MapPin,
    Router,
    ShieldCheck,
    Wifi
} from 'lucide-react';
import { ownerStationService } from '../services/ownerStationService';

const emptyWifiNetwork = (priority) => ({
    ssid: '',
    password: '',
    priority
});

const getStationId = (station) => station?.id || station?._id;

const StationDetails = () => {
    const { stationId } = useParams();
    const navigate = useNavigate();
    const [station, setStation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('iot');
    const [sockets, setSockets] = useState([]);
    const [socketLoading, setSocketLoading] = useState(false);
    const [wifiNetworks, setWifiNetworks] = useState([emptyWifiNetwork(1)]);
    const [wifiLoading, setWifiLoading] = useState(false);
    const [wifiSaving, setWifiSaving] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiKeyLoading, setApiKeyLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadStation = async () => {
            setLoading(true);
            try {
                const stationData = await ownerStationService.getStationById(stationId);
                if (!isMounted) return;

                setStation(stationData);
                setApiKey(stationData?.iotApiKey || '');
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadStation();

        return () => {
            isMounted = false;
        };
    }, [stationId]);

    useEffect(() => {
        if (!station) return;

        const resolvedStationId = getStationId(station);

        const loadTabData = async () => {
            if (activeTab === 'sockets') {
                setSocketLoading(true);
                try {
                    const data = await ownerStationService.getSocketsByStation(resolvedStationId);
                    setSockets(data);
                } catch (error) {
                    alert(error.message);
                } finally {
                    setSocketLoading(false);
                }
            }

            if (activeTab === 'iot') {
                setWifiLoading(true);
                try {
                    const data = await ownerStationService.getStationWifi(resolvedStationId);
                    setWifiNetworks(
                        data.length > 0
                            ? data.map((network, index) => ({
                                ssid: network.ssid || '',
                                password: network.password || '',
                                priority: network.priority || index + 1
                            }))
                            : [emptyWifiNetwork(1)]
                    );
                } catch (error) {
                    alert(error.message);
                } finally {
                    setWifiLoading(false);
                }
            }
        };

        loadTabData();
    }, [activeTab, station]);

    const socketStats = useMemo(() => ({
        total: sockets.length,
        available: sockets.filter((socket) => socket.status === 'AVAILABLE').length,
        charging: sockets.filter((socket) => socket.status === 'CHARGING').length
    }), [sockets]);

    const handleGenerateApiKey = async () => {
        if (!station) return;

        setApiKeyLoading(true);
        setCopied(false);
        try {
            const newApiKey = await ownerStationService.regenerateApiKey(getStationId(station));
            setApiKey(newApiKey || '');
            setStation((current) => current ? { ...current, iotApiKey: newApiKey } : current);
        } catch (error) {
            alert(error.message);
        } finally {
            setApiKeyLoading(false);
        }
    };

    const handleCopyApiKey = async () => {
        if (!apiKey) return;

        try {
            await navigator.clipboard.writeText(apiKey);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            alert('Unable to copy the API key. Please copy it manually.');
        }
    };

    const handleWifiFieldChange = (index, field, value) => {
        setWifiNetworks((current) => current.map((network, networkIndex) => (
            networkIndex === index ? { ...network, [field]: value } : network
        )));
    };

    const addWifiNetwork = () => {
        setWifiNetworks((current) => (
            current.length >= 3 ? current : [...current, emptyWifiNetwork(current.length + 1)]
        ));
    };

    const removeWifiNetwork = (index) => {
        setWifiNetworks((current) => {
            const next = current.filter((_, networkIndex) => networkIndex !== index);

            if (next.length === 0) {
                return [emptyWifiNetwork(1)];
            }

            return next.map((network, networkIndex) => ({
                ...network,
                priority: networkIndex + 1
            }));
        });
    };

    const handleSaveWifi = async (event) => {
        event.preventDefault();
        if (!station) return;

        const cleanedNetworks = wifiNetworks
            .map((network, index) => ({
                ssid: network.ssid.trim(),
                password: network.password.trim(),
                priority: index + 1
            }))
            .filter((network) => network.ssid && network.password);

        setWifiSaving(true);
        try {
            const savedNetworks = await ownerStationService.updateStationWifi(getStationId(station), cleanedNetworks);
            setWifiNetworks(
                savedNetworks.length > 0
                    ? savedNetworks.map((network, index) => ({
                        ssid: network.ssid || '',
                        password: network.password || '',
                        priority: network.priority || index + 1
                    }))
                    : [emptyWifiNetwork(1)]
            );
        } catch (error) {
            alert(error.message);
        } finally {
            setWifiSaving(false);
        }
    };

    const toggleSocketStatus = async (socketId, currentStatus) => {
        const newStatus = currentStatus === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
        try {
            await ownerStationService.updateSocketStatus(socketId, newStatus);
            setSockets((current) => current.map((socket) => (
                (socket.id || socket._id) === socketId ? { ...socket, status: newStatus } : socket
            )));
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) {
        return <div className="p-4">Loading station details...</div>;
    }

    if (!station) {
        return (
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0' }}>
                <h4 className="fw-bold mb-2">Station not found</h4>
                <p className="text-muted mb-4">We could not find a station for this owner account.</p>
                <button onClick={() => navigate('/owner/stations')} className="btn btn-success rounded-3 px-4">
                    Back to My Stations
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <ShieldCheck size={16} /> },
        { id: 'sockets', label: 'Sockets', icon: <LayoutGrid size={16} /> },
        { id: 'iot', label: 'IoT Settings', icon: <Cpu size={16} /> }
    ];

    return (
        <div className="station-details">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <button
                        onClick={() => navigate('/owner/stations')}
                        className="btn btn-link text-decoration-none px-0 mb-3"
                        style={{ color: '#22C55E', fontWeight: 700 }}
                    >
                        <ArrowLeft size={16} className="me-2" />
                        Back to My Stations
                    </button>
                    <h3 className="fw-bold mb-1">{station.name}</h3>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                        <MapPin size={14} />
                        <span>{station.location}</span>
                        <span className={`badge ${station.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                            {station.status}
                        </span>
                    </div>
                </div>

                <div className="d-flex gap-3 flex-wrap">
                    <div style={{ background: 'white', borderRadius: '18px', padding: '16px 20px', border: '1px solid #E2E8F0', minWidth: '140px' }}>
                        <div className="text-muted small mb-1">Sockets</div>
                        <div className="fw-bold fs-5">{station.socketCount}</div>
                    </div>
                    <div style={{ background: 'white', borderRadius: '18px', padding: '16px 20px', border: '1px solid #E2E8F0', minWidth: '140px' }}>
                        <div className="text-muted small mb-1">Price</div>
                        <div className="fw-bold fs-5">Rs. {station.pricePerKwh}/kWh</div>
                    </div>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn ${activeTab === tab.id ? 'btn-success' : 'btn-light'} d-flex align-items-center gap-2 rounded-pill px-4 py-2`}
                        style={{ border: activeTab === tab.id ? 'none' : '1px solid #E2E8F0' }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="row g-4">
                    <div className="col-lg-8">
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '28px' }}>
                            <h5 className="fw-bold mb-4">Station Summary</h5>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="p-3 rounded-4" style={{ background: '#F8FAFC' }}>
                                        <div className="text-muted small mb-1">Station ID</div>
                                        <div className="fw-semibold">{getStationId(station)}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 rounded-4" style={{ background: '#F8FAFC' }}>
                                        <div className="text-muted small mb-1">API Key Status</div>
                                        <div className="fw-semibold">{apiKey ? 'Generated' : 'Not generated yet'}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 rounded-4" style={{ background: '#F8FAFC' }}>
                                        <div className="text-muted small mb-1">Location</div>
                                        <div className="fw-semibold">{station.location}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 rounded-4" style={{ background: '#F8FAFC' }}>
                                        <div className="text-muted small mb-1">Status</div>
                                        <div className="fw-semibold">{station.status}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div style={{ background: 'linear-gradient(135deg, #0F172A, #1D4ED8)', color: 'white', borderRadius: '24px', padding: '28px' }}>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <KeyRound size={24} />
                                <h5 className="fw-bold mb-0">Quick IoT Setup</h5>
                            </div>
                            <p className="mb-3" style={{ color: 'rgba(255,255,255,0.82)' }}>
                                Generate the station key from the IoT Settings tab, then use it inside your ESP32 firmware.
                            </p>
                            <button className="btn btn-light rounded-pill px-4" onClick={() => setActiveTab('iot')}>
                                Open IoT Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sockets' && (
                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '28px' }}>
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                        <div>
                            <h5 className="fw-bold mb-1">Socket Management</h5>
                            <p className="text-muted small mb-0">Review socket state for this charging station.</p>
                        </div>
                        <div className="d-flex gap-3 flex-wrap">
                            <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">Available: {socketStats.available}</span>
                            <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">Charging: {socketStats.charging}</span>
                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">Total: {socketStats.total}</span>
                        </div>
                    </div>

                    {socketLoading ? (
                        <div className="text-center py-5 text-muted">Loading sockets...</div>
                    ) : (
                        <div className="row g-3">
                            {sockets.map((socket) => (
                                <div className="col-md-6 col-xl-4" key={socket.id || socket._id}>
                                    <div style={{
                                        padding: '18px',
                                        borderRadius: '20px',
                                        border: '1px solid #E2E8F0',
                                        background: socket.status === 'AVAILABLE' ? '#F0FDF4' :
                                            socket.status === 'CHARGING' ? '#EFF6FF' : '#FFF7ED'
                                    }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <div className="fw-bold">Socket #{socket.socketNumber}</div>
                                                <div className="small text-muted">{socket.status}</div>
                                            </div>
                                            <LayoutGrid size={18} className="text-muted" />
                                        </div>
                                        <button
                                            onClick={() => toggleSocketStatus(socket.id || socket._id, socket.status)}
                                            disabled={socket.status === 'CHARGING'}
                                            className={`btn btn-sm ${socket.status === 'AVAILABLE' ? 'btn-outline-danger' : 'btn-outline-success'} rounded-pill px-3`}
                                        >
                                            {socket.status === 'AVAILABLE' ? 'Disable Socket' : 'Enable Socket'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'iot' && (
                <div className="row g-4">
                    <div className="col-lg-7">
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '28px' }}>
                            <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                                <div>
                                    <h5 className="fw-bold mb-1">Generate IoT API Key</h5>
                                    <p className="text-muted small mb-0">
                                        Use this key in your device firmware so the station can send readings securely.
                                    </p>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-success">
                                    <ShieldCheck size={18} />
                                    <span className="small fw-semibold">Owner secured</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-4 mb-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                <div className="text-muted small mb-2">Current API Key</div>
                                <div
                                    style={{
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all',
                                        color: apiKey ? '#0F172A' : '#64748B',
                                        minHeight: '24px'
                                    }}
                                >
                                    {apiKey || 'No key generated for this station yet.'}
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-3">
                                <button
                                    onClick={handleGenerateApiKey}
                                    className="btn btn-success rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                                    disabled={apiKeyLoading}
                                >
                                    {apiKeyLoading ? <LoaderCircle size={16} className="spin" /> : <KeyRound size={16} />}
                                    {apiKey ? 'Regenerate API Key' : 'Generate API Key'}
                                </button>
                                <button
                                    onClick={handleCopyApiKey}
                                    className="btn btn-outline-secondary rounded-pill px-4 py-2 d-flex align-items-center gap-2"
                                    disabled={!apiKey}
                                >
                                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied' : 'Copy Key'}
                                </button>
                            </div>

                            <div className="alert alert-warning mt-4 mb-0 rounded-4 border-0" style={{ background: '#FFF7ED', color: '#9A3412' }}>
                                Regenerating the key invalidates the previous one. Update your ESP32 code after generating a new key.
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '28px' }}>
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <Wifi size={18} className="text-success" />
                                <h5 className="fw-bold mb-0">WiFi Settings</h5>
                            </div>
                            <p className="text-muted small mb-4">Configure up to 3 fallback WiFi networks for the station.</p>

                            {wifiLoading ? (
                                <div className="text-center py-4 text-muted">Loading WiFi settings...</div>
                            ) : (
                                <form onSubmit={handleSaveWifi}>
                                    {wifiNetworks.map((network, index) => (
                                        <div key={`${network.priority}-${index}`} className="mb-3 p-3 rounded-4" style={{ background: '#F8FAFC' }}>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="fw-semibold">Network {index + 1}</span>
                                                {wifiNetworks.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeWifiNetwork(index)}
                                                        className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small fw-semibold text-muted">SSID</label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    value={network.ssid}
                                                    onChange={(event) => handleWifiFieldChange(index, 'ssid', event.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label small fw-semibold text-muted">Password</label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    value={network.password}
                                                    onChange={(event) => handleWifiFieldChange(index, 'password', event.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="d-flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={addWifiNetwork}
                                            className="btn btn-outline-success rounded-pill px-4"
                                            disabled={wifiNetworks.length >= 3}
                                        >
                                            Add WiFi
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-success rounded-pill px-4"
                                            disabled={wifiSaving}
                                        >
                                            {wifiSaving ? 'Saving...' : 'Save WiFi Settings'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div style={{ background: 'linear-gradient(135deg, #DCFCE7, #DBEAFE)', borderRadius: '24px', padding: '24px', marginTop: '24px' }}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Router size={18} className="text-success" />
                                <h6 className="fw-bold mb-0">Setup Path</h6>
                            </div>
                            <div className="small text-muted">
                                Login as Station Owner -&gt; My Stations -&gt; Open your station -&gt; IoT Settings -&gt; Generate API Key
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StationDetails;
