import http from "./http";

export const fetchProducts = (params = {}) => http.get("/api/products", { params }).then(r => r.data);
export const fetchProduct  = (id) => http.get(`/api/products/${id}`).then(r => r.data);

// Admin
export const createProduct = (payload) => http.post("/api/products", payload).then(r => r.data);
export const updateProduct = (id, payload) => http.patch(`/api/products/${id}`, payload).then(r => r.data);
export const deleteProduct = (id) => http.delete(`/api/products/${id}`).then(r => r.data);
export const patchStock    = (id, payload) => http.patch(`/api/products/${id}/stock`, payload).then(r => r.data);
