/**
 * Admin User Service
 * Manages users via backend admin API.
 */
import { apiFetch } from '../../config/apiConfig';

export const adminUserService = {
    getAll: async () => {
        return apiFetch('/admin/users');
    },

    getById: async (id) => {
        const users = await apiFetch('/admin/users');
        return users.find(u => u._id === id || u.id === id) || null;
    },

    deleteUser: async (id) => {
        return apiFetch(`/admin/users/${id}`, {
            method: 'DELETE',
        });
    }
};
