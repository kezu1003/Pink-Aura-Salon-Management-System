import axios from "axios";

export function makeApi(backendUrl) {
  const api = axios.create({ baseURL: backendUrl, withCredentials: true });

  const ok = (p) =>
    p.then(r => r.data)
     .catch(err => {
       const message =
         err?.response?.data?.message ||
         err?.message ||
         "Request failed";
       return { success: false, message, _error: err };
     });

  return {
    slots: (params) => ok(api.get("/api/appointments/slots", { params })),
    create: (payload) => ok(api.post("/api/appointments", payload)),
    mine:   (params) => ok(api.get("/api/appointments/mine", { params })),
    adminList: (params) => ok(api.get("/api/appointments", { params })),
    update: (id, payload) => ok(api.patch(`/api/appointments/${id}`, payload)),
    cancel: (id) => ok(api.delete(`/api/appointments/${id}`)),
    markPaid: (id) => ok(api.post(`/api/appointments/${id}/mark-paid`)),
  };
}
