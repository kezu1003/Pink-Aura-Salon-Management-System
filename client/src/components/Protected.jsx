import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Navigate } from "react-router-dom";

export default function RequireRole({ roles, children }) {
  const { isLoggedin, role } = useContext(AppContext);

  if (!isLoggedin) {
    return <Navigate to="/login" replace />;
  }
  if (!roles.includes(role)) {
    // simple 403; you can route to a dedicated page if you want
    return <div className="p-8 text-center text-red-600">403 • You don’t have access to this page.</div>;
  }
  return children;
}
