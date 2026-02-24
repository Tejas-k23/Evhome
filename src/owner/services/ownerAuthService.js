const OWNERS_KEY = "evhome_owners";
const OWNER_TOKEN_KEY = "evhome_owner_token";
const OWNER_ID_KEY = "evhome_owner_id";

const initialOwners = [
    {
        id: "owner-1",
        name: "John Doe",
        mobileNumber: "9876543210",
        email: "owner@evhome.com",
        createdAt: new Date().toISOString()
    }
];

const getOwners = () => {
    const data = localStorage.getItem(OWNERS_KEY);
    if (!data) {
        localStorage.setItem(OWNERS_KEY, JSON.stringify(initialOwners));
        return initialOwners;
    }
    return JSON.parse(data);
};

export const ownerAuthService = {
    login: async (mobileNumber, otp) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Demo OTP: 123456
        if (otp !== "123456") {
            throw new Error("Invalid OTP");
        }

        const owners = getOwners();
        const owner = owners.find(o => o.mobileNumber === mobileNumber);

        if (!owner && mobileNumber === "9876543210") {
            // Special case for demo if not found but matches initial
            const demoOwner = initialOwners[0];
            localStorage.setItem(OWNER_TOKEN_KEY, "demo-owner-token-123");
            localStorage.setItem(OWNER_ID_KEY, demoOwner.id);
            return demoOwner;
        } else if (owner) {
            localStorage.setItem(OWNER_TOKEN_KEY, `token-${owner.id}`);
            localStorage.setItem(OWNER_ID_KEY, owner.id);
            return owner;
        } else {
            // Create new owner for demo if doesn't exist? 
            // For now, let's just allow the demo owner
            throw new Error("Owner not registered. Use demo number: 9876543210");
        }
    },

    loginWithEmail: async (email, password) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (email === "owner@evhome.com" && password === "Owner@123") {
            const owner = initialOwners[0];
            localStorage.setItem(OWNER_TOKEN_KEY, "demo-owner-token-123");
            localStorage.setItem(OWNER_ID_KEY, owner.id);
            return owner;
        }
        throw new Error("Invalid email or password");
    },

    logout: () => {
        localStorage.removeItem(OWNER_TOKEN_KEY);
        localStorage.removeItem(OWNER_ID_KEY);
    },

    getCurrentOwner: () => {
        const ownerId = localStorage.getItem(OWNER_ID_KEY);
        if (!ownerId) return null;
        const owners = getOwners();
        return owners.find(o => o.id === ownerId) || null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(OWNER_TOKEN_KEY);
    }
};
