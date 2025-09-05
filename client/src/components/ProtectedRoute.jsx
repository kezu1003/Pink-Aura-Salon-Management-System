// client/src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, allow = "any" }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-gray-500">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  if (allow === "staffOrSupplier") {
    const ok = user.role === "Staff" || user.role === "Supplier";
    return ok ? children : <Navigate to="/unauthorized" replace />;
  }

  return children;
}
