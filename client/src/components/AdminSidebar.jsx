import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Calendar,
  Users,
  ClipboardList,
  Star,
  FileText,
  Settings,
  CreditCard,
} from "lucide-react";

const Group = ({ title, children, expanded }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 font-semibold text-sm ${
          expanded ? "text-slate-700" : "justify-center"
        }`}
      >
        {expanded && <span>{title}</span>}
        {expanded && <span className="text-xs">{open ? "▾" : "▸"}</span>}
      </button>
      {open && <div className={expanded ? "pl-3" : ""}>{children}</div>}
    </div>
  );
};

const Item = ({ to, label, icon: Icon, expanded }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded transition-colors ${
        isActive
          ? "bg-pink-500 text-white"
          : "text-slate-700 hover:bg-pink-100 hover:text-pink-700"
      } ${expanded ? "justify-start" : "justify-center"}`
    }
  >
    {Icon && <Icon size={18} />}
    {expanded && <span className="text-sm">{label}</span>}
  </NavLink>
);

export default function AdminSidebar({ expanded, onClose }) {
  const { hasRole } = useContext(AppContext);

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 lg:hidden ${
          expanded ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full bg-gradient-to-b from-pink-200 to-pink-100 border-r border-pink-300 shadow-lg transition-all duration-300 ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        <div className="px-4 py-4 font-bold text-xl text-pink-700">
          {expanded ? "Admin" : "A"}
        </div>

        <nav className="px-2 space-y-1 text-sm">
          <Group title="Dashboard" expanded={expanded}>
            <Item to="/admin" label="Overview" icon={LayoutDashboard} expanded={expanded} />
          </Group>

          <Group title="Catalog" expanded={expanded}>
            <Item to="/admin/products" label="Products" icon={ShoppingBag} expanded={expanded} />
            <Item to="/admin/products/new" label="Add Product" icon={Package} expanded={expanded} />
          </Group>

          <Group title="Sales" expanded={expanded}>
            <Item to="/admin/orders" label="Orders" icon={ClipboardList} expanded={expanded} />
            <Item
              to="/admin/transactions"
              label="Transactions"
              icon={CreditCard}
              expanded={expanded}
            />
          </Group>

          <Group title="Appointments" expanded={expanded}>
            <Item
              to="/admin/appointments"
              label="All Appointments"
              icon={ClipboardList}
              expanded={expanded}
            />
            <Item
              to="/admin/calendar"
              label="Calendar View"
              icon={Calendar}
              expanded={expanded}
            />
          </Group>

          <Group title="Services & Packages" expanded={expanded}>
            <Item to="/admin/services" label="Services" icon={ClipboardList} expanded={expanded} />
            <Item to="/admin/packages" label="Packages" icon={Package} expanded={expanded} />
          </Group>

          <Group title="Reviews & Feedback" expanded={expanded}>
            <Item to="/admin/reviews" label="Manage Reviews" icon={Star} expanded={expanded} />
          </Group>

          {hasRole("admin") && (
            <Group title="Staff" expanded={expanded}>
              <Item to="/admin/staff" label="Staff Directory" icon={Users} expanded={expanded} />
            </Group>
          )}

          <Group title="Reports" expanded={expanded}>
            <Item
              to="/admin/reports"
              label="Appointment Reports"
              icon={FileText}
              expanded={expanded}
            />
            <Item
              to="/admin/reports/service"
              label="Service Report"
              icon={FileText}
              expanded={expanded}
            />

            <Item
              to="/admin/products/reports"
              label="product Report"
              icon={FileText}
              expanded={expanded}
            />

          </Group>

          <Group title="System" expanded={expanded}>
            <Item to="/admin/settings" label="Settings" icon={Settings} expanded={expanded} />
          </Group>

          <Group title="System" expanded={expanded}>
            <Item to="/courses" label="courses" icon={Settings} expanded={expanded} />
          </Group>
        </nav>
      </aside>
    </>
  );
}
