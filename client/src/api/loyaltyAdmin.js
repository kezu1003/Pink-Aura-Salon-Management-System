import api from "./axios";

export const listTiers = () => api.get("/api/admin/loyalty/tiers");
export const createTier = (payload) => api.post("/api/admin/loyalty/tiers", payload);
export const updateTier = (id, payload) => api.put(`/api/admin/loyalty/tiers/${id}`, payload);
export const deleteTier = (id) => api.delete(`/api/admin/loyalty/tiers/${id}`);

export const searchAccounts = (q = "") => api.get("/api/admin/loyalty/accounts", { params: { q } });
export const adjustPoints = (id, payload) => api.post(`/api/admin/loyalty/accounts/${id}/adjust`, payload);
