import React, { createContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!user;

  useEffect(() => {
    
    (async () => {
      try {
        const { data } = await api.get("/api/staff/me");
        if (data?.user) setUser(data.user);
      } catch {
        
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({ user, setUser, isLoggedIn, loading }),
    [user, isLoggedIn, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
