import api from "./axios";

export const ReviewsAPI = {
  listPublic: (params) => api.get("/api/reviews", { params }),
  listMine:  (params) => api.get("/api/reviews/mine", { params }),
  create:    (payload) => api.post("/api/reviews", payload),
  update:    (id, payload) => api.patch(`/api/reviews/${id}`, payload),
  remove:    (id, { hard=false } = {}) => api.delete(`/api/reviews/${id}`, { params: { hard } }),

  adminList: (params) => api.get("/api/reviews/admin", { params }),
  adminSetStatus: (id, status) => api.patch(`/api/reviews/admin/${id}/status`, { status }),

  upload: async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await api.post("/api/reviews/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
