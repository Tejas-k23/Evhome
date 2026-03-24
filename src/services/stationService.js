/**
 * Public station service for listing and searching stations (no auth required).
 * Used by user-facing pages like BookSlot and Home.
 */
import { API_URL } from '../config/apiConfig';

const safeParse = async (response, context) => {
    try {
        return await response.json();
    } catch {
        throw new Error(`Unexpected non-JSON response from ${context} (status ${response.status})`);
    }
};

export const stationService = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/stations`);
        const data = await safeParse(response, '/stations');
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch stations');
        }
        const stations = data.stations || (Array.isArray(data) ? data : []);
        if (!Array.isArray(stations)) return [];
        return stations.map(s => ({ ...s, id: s._id || s.id }));
    },

    getById: async (id) => {
        const response = await fetch(`${API_URL}/stations/${id}`);
        const data = await safeParse(response, `/stations/${id}`);
        if (!response.ok) {
            throw new Error(data.message || 'Station not found');
        }
        const station = data.station;
        return { ...station, id: station._id || station.id };
    },

    search: async (query) => {
        const response = await fetch(`${API_URL}/stations/search?q=${encodeURIComponent(query)}`);
        const data = await safeParse(response, '/stations/search');
        if (!response.ok) {
            throw new Error(data.message || 'Search failed');
        }
        const stations = data.stations || data;
        return stations.map(s => ({ ...s, id: s._id || s.id }));
    },
};
