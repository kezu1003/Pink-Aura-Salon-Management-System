import api from "./axios.js";

const base = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const AdsAPI = {
  list: async ({ page = 1, limit = 12, status = null } = {}) => {
    const params = { page, limit };
    if (status !== null) params.status = String(status);
    const { data } = await api.get("/api/ads", { params });
    return data;
    },
  get: async (id) => (await api.get(`/api/ads/${id}`)).data,
  create: async (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => form.append(k, v));
    const { data } = await api.post("/api/ads", form);
    return data;
  },
  update: async (id, payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => form.append(k, v));
    const { data } = await api.put(`/api/ads/${id}`, form);
    return data;
  },
  remove: async (id) => (await api.delete(`/api/ads/${id}`)).data,
  imageUrl: (filename) => `${base}/uploads/ads/${filename}`,
};
