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
        return ownerFetch('/owner/stations');
    },

    createStation: async (stationData) => {
        return ownerFetch('/owner/stations', {
            method: 'POST',
            body: JSON.stringify(stationData),
        });
    },

    updateStation: async (stationId, stationData) => {
        return ownerFetch(`/owner/stations/${stationId}`, {
            method: 'PUT',
            body: JSON.stringify(stationData),
        });
    },

    getSocketsByStation: async (stationId) => {
        return ownerFetch(`/owner/stations/${stationId}/sockets`);
    },

    updateSocketStatus: async (socketId, status) => {
        return ownerFetch(`/owner/sockets/${socketId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },

    getStationWifi: async (stationId) => {
        return ownerFetch(`/owner/stations/${stationId}/wifi`);
    },

    updateStationWifi: async (stationId, wifiNetworks) => {
        return ownerFetch(`/owner/stations/${stationId}/wifi`, {
            method: 'PUT',
            body: JSON.stringify({ wifiNetworks }),
        });
    },

    regenerateApiKey: async (stationId) => {
        return ownerFetch(`/owner/stations/${stationId}/api-key`, {
            method: 'POST',
        });
    }
};
