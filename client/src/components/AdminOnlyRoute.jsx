import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function AdminOnlyRoute({ children }) {
  const { user, isLoggedin, loading } = useContext(AppContext) || {};
  if (loading) return null;           
  if (!isLoggedin) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
