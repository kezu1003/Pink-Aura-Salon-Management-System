import http from "./http";
export const checkout = (payload) => http.post("/api/checkout", payload).then(r => r.data);
