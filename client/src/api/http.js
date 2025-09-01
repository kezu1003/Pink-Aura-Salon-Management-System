import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000",
  withCredentials: true
});

export default http;
