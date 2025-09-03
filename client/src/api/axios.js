import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (location.hostname === "localhost" ? "http://localhost:4000" : "");

console.log("[API] baseURL =", baseURL); // <- keep until it's working

const api = axios.create({
  baseURL,
  withCredentials: true, // cookies for auth
});

export default api;
