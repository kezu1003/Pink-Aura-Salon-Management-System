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
  Megaphone,
  Bell,
} from "lucide-react";

const Group = ({ title, children, expanded }) => {
  const [open, setOpen] = useState(true);

  if (!expanded) {
    return <div className="mb-2">{children}</div>;
  }

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 font-semibold text-sm text-[#4D423A] hover:bg-[#FBAA99] hover:text-[#FFFFFF] rounded-md transition-colors"
      >
        <span>{title}</span>
        <span className="text-xs">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="pl-3">{children}</div>}
    </div>
  );
};

const Item = ({ to, label, icon: Icon, expanded }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-[#FBAA99] text-[#FFFFFF]"
          : "text-[#4D423A] hover:bg-[#FEF4F1] hover:text-[#000000]"
      } ${expanded ? "justify-start" : "justify-center"}`
    }
  >
    {Icon && <Icon size={18} color={expanded ? "#4D423A" : "#000000"} />}
    {expanded && <span className="text-sm">{label}</span>}
  </NavLink>
);

export default function AdminSidebar({ expanded, onClose }) {
  const { hasRole } = useContext(AppContext);

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-[#000000]/30 z-30 lg:hidden ${
          expanded ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full bg-[#FEF4F1] border-r border-[#4D423A]/20 shadow-sm transition-all duration-300 ease-in-out ${
          expanded ? "w-64" : "w-16"
        } ${!expanded ? "-translate-x-full lg:translate-x-0" : "translate-x-0"}`}
      >
        <div className="px-4 py-4 font-bold text-xl text-[#4D423A]">
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

          <Group title="Advertisement Management" expanded={expanded}>
            <Item to="/admin/advertisements" label="Advertisements" icon={Megaphone} expanded={expanded} />
          </Group>

          <Group title="Reviews & Feedback" expanded={expanded}>
            <Item to="/admin/reviews" label="Manage Reviews" icon={Star} expanded={expanded} />
          </Group>

          <Group title="Course Management" expanded={expanded}>
            <Item to="/courses" label="Courses" icon={Settings} expanded={expanded} />
          </Group>

          <Group title="Enrollments" expanded={expanded}>
            <Item to="/enrollments" label="Enrollments" icon={Settings} expanded={expanded} />
          </Group>

          <Group title="Events Management" expanded={expanded}>
            <Item to="/events" label="Events" icon={Settings} expanded={expanded} />
          </Group>

          {hasRole("admin") && (
            <Group title="Staff" expanded={expanded}>
              <Item to="/admin/staff" label="Staff Directory" icon={Users} expanded={expanded} />
              <Item to="/admin/staff-notices" label="Staff Notices" icon={Bell} expanded={expanded} />
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
              label="Product Report"
              icon={FileText}
              expanded={expanded}
            />
            <Item
              to="/admin/reviews/reports"
              label="Review Report"
              icon={FileText}
              expanded={expanded}
            />
          </Group>

          <Group title="Email Management" expanded={expanded}>
            <Item to="/admin/messages" label="Emails" icon={Megaphone} expanded={expanded} />
          </Group>

        </nav>
      </aside>
    </>
  );
}