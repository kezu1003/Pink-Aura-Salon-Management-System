import api from "./axios";

// Customer: my rewards summary
export const getMyLoyalty = () => api.get("/api/loyalty/me");

// Customer: my transactions 
export const getMyLoyaltyTxns = (params = {}) =>
  api.get("/api/loyalty/me/txns", { params });

//  preview redeem at checkout
export const previewRedeem = (payload) =>
  api.post("/api/loyalty/redeem/preview", payload);
