import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authAPI
        .me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // const login = async (email, password) => {
  //   const res = await authAPI.login({ email, password });
  //   localStorage.setItem('token', res.data.token);
  //   setUser(res.data.user);
  //   return res.data.user;
  // };

  const login = async (email, password) => {
    console.log("1. Login function called");

    try {
      const res = await authAPI.login({ email, password });

      console.log("2. Login response:", res.status, res.data);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      console.log("3. Token saved:", !!localStorage.getItem("token"));
      console.log("4. User:", res.data.user);

      return res.data.user;
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.status,
        error.response?.data || error.message,
      );
      throw error;
    }
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
