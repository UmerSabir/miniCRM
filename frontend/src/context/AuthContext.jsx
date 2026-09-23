import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

const decodeJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token") || "";
    return decodeJwt(savedToken) ? savedToken : "";
  });
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token") || "";
    const payload = decodeJwt(savedToken);
    if (!payload) return null;
    return {
      id: payload.id,
      email: localStorage.getItem("userEmail") || "user@mini-crm.local",
      name: localStorage.getItem("userName") || "",
    };
  });
  const loading = false;

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", {
      email,
      password,
    });
    const payload = decodeJwt(res.data.token);

    localStorage.setItem("userEmail", res.data.email || email);
    localStorage.setItem("userName", res.data.name || "");
    setToken(res.data.token);
    setUser({
      id: payload?.id,
      email: res.data.email || email,
      name: res.data.name || "",
    });
  };

  const register = async (name, email, password, confirmPassword) => {
    await API.post("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
