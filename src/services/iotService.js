/**
 * IoT Simulator Service
 */

const pricePerKwh = 10;

export const iotService = {
    generateLiveStatus: (currentSession = null) => {
        const voltage = Math.floor(Math.random() * (250 - 210 + 1)) + 210;

        let current = 0;
        let energyKwh = 0;
        let cost = 0;

        if (currentSession && currentSession.status === 'ACTIVE') {
            current = parseFloat((Math.random() * (16 - 8) + 8).toFixed(2));
            // Simulate energy increase: Current * Voltage / 1000 * 3 seconds in hours
            const increment = (current * voltage / 1000) * (3 / 3600);
            energyKwh = (currentSession.energyKwh || 0) + increment;
            cost = energyKwh * pricePerKwh;
        }

        return {
            voltage: voltage.toFixed(1),
            current: current.toFixed(2),
            energyKwh: energyKwh.toFixed(3),
            cost: cost.toFixed(2)
        };
    }
};
