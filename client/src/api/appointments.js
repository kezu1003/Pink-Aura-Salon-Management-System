export function makeApi(baseUrl) {
  const root = `${baseUrl}/api/appointments`;

  const get = async (url) => {
    const res = await fetch(url, { credentials: "include" });
    return res.json();
  };

  const post = async (url, body) => {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    return res.json();
  };

  const patch = async (url, body) => {
    const res = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    return res.json();
  };

  const del = async (url) => {
    const res = await fetch(url, { method: "DELETE", credentials: "include" });
    return res.json();
  };

  return {
    // slots for a day
    slots: ({ serviceId, date, staffId }) =>
      get(`${root}/slots?${new URLSearchParams({ serviceId, date, ...(staffId ? { staffId } : {}) }).toString()}`),

    // create appointment
    create: (body) => post(root, body),

    // customer
    mine: () => get(`${root}/mine`),
    update: (id, body) => patch(`${root}/${id}`, body),
    cancel: (id) => del(`${root}/${id}`),

    // admin
    listAdmin: (qs = {}) =>
      get(`${root}?${new URLSearchParams(qs).toString()}`),
    adminGrouped: (by = "date") =>
      get(`${root}/grouped?by=${encodeURIComponent(by)}`),
    markPaid: (id) => post(`${root}/${id}/mark-paid`),

    // staff
    staffSchedule: () => get(`${baseUrl}/api/staff/schedule`),
    staffStart: (id) => post(`${baseUrl}/api/staff/appointments/${id}/start`),
    staffComplete: (id) => post(`${baseUrl}/api/staff/appointments/${id}/complete`),
  };
}
