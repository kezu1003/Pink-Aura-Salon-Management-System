import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";

export function useAdminApi() {
  const { backendUrl } = useContext(AppContext);
  const http = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
  });

  return {
    listStaff: (params) => http.get("/api/admin/staff", { params }),
    createStaff: (payload) => http.post("/api/admin/staff", payload),
    updateStaff: (id, payload) => http.put(`/api/admin/staff/${id}`, payload),
    setStatus: (id, status) => http.patch(`/api/admin/staff/${id}/status`, { status }),
  };
}
