const STATIONS_KEY = "evhome_stations";
const SOCKETS_KEY = "evhome_sockets";

const getStations = () => {
    const data = localStorage.getItem(STATIONS_KEY);
    return data ? JSON.parse(data) : [];
};

const saveStations = (stations) => {
    localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
};

const getSockets = () => {
    const data = localStorage.getItem(SOCKETS_KEY);
    return data ? JSON.parse(data) : [];
};

const saveSockets = (sockets) => {
    localStorage.setItem(SOCKETS_KEY, JSON.stringify(sockets));
};

export const ownerStationService = {
    getMyStations: async (ownerId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const stations = getStations();
        // Seed if empty and this is the demo owner
        if (stations.length === 0 && ownerId === "owner-1") {
            const seedStations = [
                {
                    id: "st-1",
                    ownerId: "owner-1",
                    name: "Downtown Charging Hub",
                    location: "123 Main St, City Center",
                    socketCount: 4,
                    pricePerKwh: 15.5,
                    status: "ACTIVE",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "st-2",
                    ownerId: "owner-1",
                    name: "Suburban Power Point",
                    location: "456 Oak Ave, Suburbia",
                    socketCount: 2,
                    pricePerKwh: 12.0,
                    status: "ACTIVE",
                    createdAt: new Date().toISOString()
                }
            ];
            saveStations(seedStations);
            return seedStations;
        }
        return stations.filter(s => s.ownerId === ownerId);
    },

    createStation: async (ownerId, stationData) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const stations = getStations();
        const newStation = {
            ...stationData,
            id: `st-${Date.now()}`,
            ownerId,
            createdAt: new Date().toISOString()
        };
        stations.push(newStation);
        saveStations(stations);

        // Auto-generate sockets
        const sockets = getSockets();
        for (let i = 1; i <= newStation.socketCount; i++) {
            sockets.push({
                id: `sock-${Date.now()}-${i}`,
                stationId: newStation.id,
                socketNumber: i,
                status: "AVAILABLE"
            });
        }
        saveSockets(sockets);

        return newStation;
    },

    updateStation: async (stationId, stationData) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const stations = getStations();
        const index = stations.findIndex(s => s.id === stationId);
        if (index !== -1) {
            stations[index] = { ...stations[index], ...stationData };
            saveStations(stations);
            return stations[index];
        }
        throw new Error("Station not found");
    },

    getSocketsByStation: async (stationId) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const sockets = getSockets();
        const stationSockets = sockets.filter(s => s.stationId === stationId);

        if (stationSockets.length === 0) {
            // Seed sockets if they don't exist for this station
            const stations = getStations();
            const station = stations.find(s => s.id === stationId);
            if (station) {
                const newSockets = [];
                for (let i = 1; i <= station.socketCount; i++) {
                    newSockets.push({
                        id: `sock-${stationId}-${i}`,
                        stationId: stationId,
                        socketNumber: i,
                        status: "AVAILABLE"
                    });
                }
                const allSockets = [...sockets, ...newSockets];
                saveSockets(allSockets);
                return newSockets;
            }
        }
        return stationSockets;
    },

    updateSocketStatus: async (socketId, status) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const sockets = getSockets();
        const index = sockets.findIndex(s => s.id === socketId);
        if (index !== -1) {
            sockets[index].status = status;
            saveSockets(sockets);
            return sockets[index];
        }
        throw new Error("Socket not found");
    }
};
