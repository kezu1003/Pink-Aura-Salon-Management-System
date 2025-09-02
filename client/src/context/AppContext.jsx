import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(false);

  //  RBAC additions
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      } else {
        setIsLoggedin(false);
      }
    } catch (error) {
      setIsLoggedin(false);
      // don't toast on first load to avoid noise
    }
  };

  const getUserData = async () => {
    try {
      // use /me which includes role & permissions
      const { data } = await axios.get(backendUrl + "/api/auth/me");
      if (data.success) {
        setUserData(data.user);
        setRole(data.user.role);
        setPermissions(data.user.permissions || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  // helpers
  const hasRole = (...roles) => roles.includes(role);
  const hasPerm = (perm) => permissions.includes(perm);

  const value = {
    backendUrl,
    isLoggedin, setIsLoggedin,
    userData, setUserData,
    getUserData,
    role, permissions,
    hasRole, hasPerm,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
