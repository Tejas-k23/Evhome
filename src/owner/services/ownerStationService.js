/**
 * Owner Station Service
 * Manages owner's stations via backend API.
 */
import { API_URL } from '../../config/apiConfig';

const getOwnerToken = () => localStorage.getItem('evhome_owner_token');

const ownerFetch = async (endpoint, options = {}) => {
    const token = getOwnerToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Owner API request failed');
    }
    return data;
};

export const ownerStationService = {
    getMyStations: async () => {
        const data = await ownerFetch('/owner/stations');
        return data.stations || [];
    },

    createStation: async (stationData) => {
        const data = await ownerFetch('/owner/stations', {
            method: 'POST',
            body: JSON.stringify(stationData),
        });
        return data.station || data;
    },

    updateStation: async (stationId, stationData) => {
        const data = await ownerFetch(`/owner/stations/${stationId}`, {
            method: 'PUT',
            body: JSON.stringify(stationData),
        });
        return data.station || data;
    },

    getSocketsByStation: async (stationId) => {
        const data = await ownerFetch(`/owner/stations/${stationId}/sockets`);
        return data.sockets || [];
    },

    updateSocketStatus: async (socketId, status) => {
        return ownerFetch(`/owner/sockets/${socketId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },

    getStationWifi: async (stationId) => {
        const data = await ownerFetch(`/owner/stations/${stationId}/wifi`);
        return data.wifiNetworks || [];
    },

    updateStationWifi: async (stationId, wifiNetworks) => {
        const data = await ownerFetch(`/owner/stations/${stationId}/wifi`, {
            method: 'PUT',
            body: JSON.stringify({ wifiNetworks }),
        });
        return data.wifiNetworks || [];
    },

    regenerateApiKey: async (stationId) => {
        const data = await ownerFetch(`/owner/stations/${stationId}/api-key`, {
            method: 'POST',
        });
        return data.iotApiKey;
    },

    getStationById: async (stationId) => {
        const stations = await ownerStationService.getMyStations();
        return stations.find((station) => (station.id || station._id) === stationId) || null;
    }
};
