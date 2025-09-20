import axios from "axios";

export const makePackagesApi = (baseUrl) => {
  const root = `${baseUrl}/api/packages`;

  return {
    list: (qs = {}) =>
      axios
        .get(`${root}?${new URLSearchParams(qs).toString()}`, { withCredentials: true })
        .then((r) => r.data),
        
    get: (id) => axios.get(`${root}/${id}`, { withCredentials: true }).then((r) => r.data),
    create: (body) => axios.post(root, body, { withCredentials: true }).then((r) => r.data),
    update: (id, body) => axios.put(`${root}/${id}`, body, { withCredentials: true }).then((r) => r.data),
    archive: (id) => axios.patch(`${root}/${id}/archive`, {}, { withCredentials: true }).then((r) => r.data),
    restore: (id) => axios.patch(`${root}/${id}/restore`, {}, { withCredentials: true }).then((r) => r.data),
    remove: (id, hard = false) =>
      axios.delete(`${root}/${id}${hard ? "?hard=true" : ""}`, { withCredentials: true }).then((r) => r.data),
  };
};
