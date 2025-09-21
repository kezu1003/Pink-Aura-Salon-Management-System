import axios from "axios";
const unwrap = async (promise) => {
  try {
    const res = await promise;
    return res.data;
  } catch (e) {
    const status = e?.response?.status || 0;
    const data = e?.response?.data || {};
    const message = data?.message || e.message || "Request failed";
    return { success: false, status, message };
  }
};

export const makePackagesApi = (baseUrl) => {
  const root = `${baseUrl}/api/packages`;

  return {
    list: (qs = {}) =>
      unwrap(
        axios.get(`${root}?${new URLSearchParams(qs).toString()}`, {
          withCredentials: true,
        })
      ),
    get: (id) =>
      unwrap(axios.get(`${root}/${id}`, { withCredentials: true })),
    create: (body) =>
      unwrap(axios.post(root, body, { withCredentials: true })),
    update: (id, body) =>
      unwrap(axios.put(`${root}/${id}`, body, { withCredentials: true })),
    archive: (id) =>
      unwrap(axios.patch(`${root}/${id}/archive`, {}, { withCredentials: true })),
    restore: (id) =>
      unwrap(axios.patch(`${root}/${id}/restore`, {}, { withCredentials: true })),
    remove: (id, hard = false) =>
      unwrap(
        axios.delete(`${root}/${id}${hard ? "?hard=true" : ""}`, {
          withCredentials: true,
        })
      ),
  };
};
