/**
 * Public station service for listing and searching stations (no auth required).
 * Used by user-facing pages like BookSlot and Home.
 */
import { API_URL } from '../config/apiConfig';

export const stationService = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/stations`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch stations');
        }
        return data.stations || data;
    },

    getById: async (id) => {
        const response = await fetch(`${API_URL}/stations/${id}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Station not found');
        }
        return data.station;
    },

    search: async (query) => {
        const response = await fetch(`${API_URL}/stations/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Search failed');
        }
        return data.stations || data;
    },
};
