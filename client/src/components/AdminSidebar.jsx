// src/components/AdminSidebar.jsx
import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

const Group = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-2">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-3 py-2 font-semibold">
        {title} {open ? "▾" : "▸"}
      </button>
      {open && <div className="pl-3">{children}</div>}
    </div>
  );
};

const Item = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block px-3 py-2 rounded hover:bg-white/10 ${isActive ? "bg-white/15" : ""}`
    }
  >
    {label}
  </NavLink>
);

export default function AdminSidebar() {
  const { hasRole } = useContext(AppContext);

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-pink-200 to-pink-100 border-r border-pink-300">
      <div className="px-4 py-4 text-xl font-bold">Admin</div>

      <Group title="Dashboard">
        <Item to="/admin" label="Overview" />
      </Group>

      {/* Products */}
      <Group title="Catalog">
        <Item to="/admin/products" label="Products" />
        <Item to="/admin/products/new" label="Add Product" />
      </Group>

      <Group title="Appointments">
        <Item to="/admin/appointments" label="All Appointments" />
        <Item to="/admin/calendar" label="Calendar View" />
      </Group>

      <Group title="Services & Packages">
        <Item to="/admin/services" label="Services" />
        <Item to="/admin/packages" label="Packages" />
      </Group>

      <Group title="Reviews & Feedback">
        <Item to="/admin/reviews" label="Manage Reviews" />
      </Group>

      {hasRole("admin") && (
        <Group title="Staff">
          <Item to="/admin/staff" label="Staff Directory" />
        </Group>
      )}

      <Group title="Marketing">
          <Item to="/admin/ads" label="Advertisements" />
      </Group>

      <Group title="Reports">
          <Item to="/admin/reports" label="Appointment Reports" />
          <Item to="/admin/reports/service" label="Service Report" />
      </Group>

      <Group title="System">
        <Item to="/admin/settings" label="Settings" />
      </Group>
    </aside>
  );
}
