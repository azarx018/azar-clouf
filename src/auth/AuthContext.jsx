import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthService } from "../services/AuthService.js";
import { CloudService } from "../services/CloudService.js";
import { AUTH_EVENTS } from "../services/ApiClient.js";

const AuthContext = createContext(null);

// status: "checking" | "authenticated" | "unauthenticated" | "check_failed"
export function AuthProvider({ children }) {
  const [status, setStatus] = useState("checking");

  const validateSession = useCallback(async () => {
    if (!AuthService.isAuthenticated()) {
      setStatus("unauthenticated");
      return;
    }
    setStatus("checking");
    try {
      // Any cheap protected endpoint proves the token is still valid.
      await CloudService.getStorageOverview();
      setStatus("authenticated");
    } catch (err) {
      if (err?.code === "unauthorized") {
        // ApiClient already cleared the session and fired UNAUTHORIZED_EVENT.
        setStatus("unauthenticated");
      } else {
        // Couldn't verify (e.g. offline). Don't show the Cloud UI as if
        // authenticated — let the person retry instead.
        setStatus("check_failed");
      }
    }
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  // A 401 on ANY protected request (not just startup) should bounce back to Login.
  useEffect(() => {
    const onUnauthorized = () => setStatus("unauthenticated");
    window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized);
    return () => window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, onUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    await AuthService.login(email, password);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (email, password) => {
    return AuthService.register(email, password);
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ status, login, register, logout, retry: validateSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
