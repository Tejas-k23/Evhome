const STATIONS_KEY = "evhome_stations";

const initialStations = [
    {
        id: "st-1",
        name: "Nexus Hub - Downtown",
        location: "123 Main St, Central Plaza",
        lat: 18.5204,
        lng: 73.8567,
        socketCount: 4,
        pricePerKwh: 12.5,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "st-2",
        name: "Green Charge - North",
        location: "45 Market Rd, North Wing",
        lat: 18.5500,
        lng: 73.8800,
        socketCount: 2,
        pricePerKwh: 10.0,
        status: "ACTIVE",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
];

const getStations = () => {
    const data = localStorage.getItem(STATIONS_KEY);
    if (!data) {
        localStorage.setItem(STATIONS_KEY, JSON.stringify(initialStations));
        return initialStations;
    }
    return JSON.parse(data);
};

const saveStations = (stations) => {
    localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
};

export const adminStationService = {
    getAll: async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return getStations();
    },

    getById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const stations = getStations();
        return stations.find(s => s.id === id);
    },

    create: async (stationData) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const stations = getStations();
        const newStation = {
            ...stationData,
            id: `st-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        stations.push(newStation);
        saveStations(stations);
        return newStation;
    },

    update: async (id, stationData) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const stations = getStations();
        const index = stations.findIndex(s => s.id === id);
        if (index !== -1) {
            stations[index] = { ...stations[index], ...stationData };
            saveStations(stations);
            return stations[index];
        }
        return null;
    },

    delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const stations = getStations();
        const filtered = stations.filter(s => s.id !== id);
        saveStations(filtered);
        return true;
    }
};
