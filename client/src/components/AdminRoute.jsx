import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const AdminRoute = ({ element, ...rest }) => {
  const { userData } = useContext(AppContext);

  return (
    <Route
      {...rest}
      element={
        userData?.role === "admin" ? (
          element
        ) : (
          <Navigate to="/" /> // Redirect to login or home page
        )
      }
    />
  );
};

export default AdminRoute;
