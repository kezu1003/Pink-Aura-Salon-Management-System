import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";

const JOB_TITLES = [
  "Facial Artist",
  "Hair dresser",
  "Nail Artist",
  "Makeup Artist",
  "Event Stylist",
];

export default function AdminStaffNew() {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",      
    jobTitle: JOB_TITLES[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [reveal, setReveal] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    (form.role === "admin" || (form.role === "staff" && form.jobTitle));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!backendUrl) return toast.error("backendUrl missing in AppContext");
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        jobTitle: form.role === "staff" ? form.jobTitle : "",
      };

      const { data } = await axios.post(`${backendUrl}/api/admin/staff`, body, {
        withCredentials: true,
      });

      if (!data?.success) throw new Error(data?.message || "Create failed");

      toast.success("Staff created");
      navigate("/admin/staff");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6 border border-rose-200/40">
        <h1 className="text-2xl font-semibold text-rose-900 mb-1">Add Staff</h1>
        

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-rose-900 mb-1">Full Name</label>
            <input
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-rose-300"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Jane Doe"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-rose-900 mb-1">Email</label>
            <input
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-rose-300"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="jane@company.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-rose-900 mb-1"> Password</label>
            <div className="flex rounded-xl border overflow-hidden">
              <input
                className="w-full px-3 py-2 outline-none"
                type={reveal ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Min 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                className="px-3 text-sm text-rose-700 hover:bg-rose-50"
              >
                {reveal ? "Hide" : "Show"}
              </button>
            </div>
            
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-rose-900 mb-1">Role</label>
            <select
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-rose-300"
              name="role"
              value={form.role}
              onChange={onChange}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Job Title */}
          {form.role === "staff" && (
            <div>
              <label className="block text-sm font-medium text-rose-900 mb-1">Job Title</label>
              <select
                className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ring-rose-300"
                name="jobTitle"
                value={form.jobTitle}
                onChange={onChange}
              >
                {JOB_TITLES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={`rounded-xl px-5 py-2 font-semibold text-white shadow
                ${submitting ? "bg-rose-300" : "bg-rose-500 hover:bg-rose-600"}`}
            >
              {submitting ? "Creating..." : "Create Staff"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/staff")}
              className="rounded-xl px-4 py-2 border hover:bg-rose-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
