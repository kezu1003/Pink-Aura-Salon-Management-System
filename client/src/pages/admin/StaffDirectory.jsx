import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

export default function StaffDirectory() {
  const { backendUrl } = useContext(AppContext);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/staff`, {
        params: { q, limit: 20 },
        withCredentials: true,
      });
      if (data.success) setRows(data.data);
      else toast.error(data.message);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(`${backendUrl}/api/admin/staff/${id}/status`, { status });
      if (data.success) {
        toast.success("Status updated");
        fetchStaff();
      } else {
        toast.error(data.message);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email"
          className="border rounded px-3 py-2 w-64"
        />
        <button onClick={fetchStaff} className="px-3 py-2 rounded bg-pink-500 text-white">
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-pink-100">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Last Login</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.role}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3">{r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : "—"}</td>
                <td className="p-3 space-x-2">
                  {r.status === "active" ? (
                    <button onClick={() => setStatus(r.id, "suspended")} className="px-2 py-1 rounded bg-yellow-500 text-white">
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => setStatus(r.id, "active")} className="px-2 py-1 rounded bg-green-600 text-white">
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={6}>No staff found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
