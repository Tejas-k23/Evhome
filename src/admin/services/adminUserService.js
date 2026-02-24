const USERS_KEY = "evhome_users";

const initialUsers = [
    {
        id: "u-1",
        name: "John Doe",
        vehicleNumber: "GJ01-EV-1234",
        mobileNumber: "9876543210",
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date().toISOString()
    },
    {
        id: "u-2",
        name: "Jane Smith",
        vehicleNumber: "MH02-AB-5678",
        mobileNumber: "8765432109",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "u-3",
        name: "Robert Wilson",
        vehicleNumber: "KA05-XY-9012",
        mobileNumber: "7654321098",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastActiveAt: new Date().toISOString()
    }
];

const getUsers = () => {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        return initialUsers;
    }
    return JSON.parse(data);
};

export const adminUserService = {
    getAll: async () => {
        await new Promise(resolve => setTimeout(resolve, 350));
        return getUsers();
    },

    getById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const users = getUsers();
        return users.find(u => u.id === id);
    }
};
