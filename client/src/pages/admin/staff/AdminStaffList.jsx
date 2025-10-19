import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function AdminStaffList() {
  const { backendUrl } = useContext(AppContext);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!backendUrl) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/staff`, {
        params: { q, limit: 20 },
        withCredentials: true,
      });
      if (!data?.success) throw new Error(data?.message || "Fetch failed");
      setRows(data.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  
  }, []);

  const setStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/admin/staff/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (!data?.success) throw new Error(data?.message || "Action failed");
      toast.success(`Marked as ${status}`);
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-rose-900">Staff Directory</h1>
        <Link
          to="/admin/staff/new"
          className="rounded-xl bg-rose-500 text-white px-4 py-2 font-semibold hover:bg-rose-600"
        >
          + Add Staff
        </Link>
      </div>

      <div className="bg-white rounded-2xl border p-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            className="border rounded-xl px-3 py-2 w-full max-w-xs outline-none focus:ring-2 ring-rose-300"
            placeholder="Search by name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={fetchData} className="rounded-xl px-4 py-2 border hover:bg-rose-50">
            Search
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-rose-600">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-rose-600">No staff found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Job Title</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Last Login</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-2 pr-4">{u.name}</td>
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.role}</td>
                    <td className="py-2 pr-4">{u.jobTitle || "-"}</td>
                    <td className="py-2 pr-4">{u.status}</td>
                    <td className="py-2 pr-4">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "-"}</td>
                    <td className="py-2 pr-4 flex gap-2">
                      {u.status === "active" ? (
                        <button
                          onClick={() => setStatus(u.id, "suspended")}
                          className="px-3 py-1 rounded border hover:bg-rose-50"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => setStatus(u.id, "active")}
                          className="px-3 py-1 rounded border hover:bg-rose-50"
                        >
                          Activate
                        </button>
                      )}
                      
                    </td>
                </tr>
            ))}
              </tbody>
            </table>
        </div>
        )}
      </div>
    </div>
  );
}
