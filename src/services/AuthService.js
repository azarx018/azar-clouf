import { apiFetch } from "./ApiClient.js";
import { SESSION_STORAGE_KEY } from "../config.js";

/**
 * AuthService centralizes login/register/session logic so no page or
 * component duplicates it. It never logs the token or password, and only
 * ever stores the session token (never credentials or backend secrets).
 */
export const AuthService = {
  async login(email, password) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    // Backend contract: { token }. Do not guess other shapes.
    if (data?.token) {
      this._setToken(data.token);
    }
    return data;
  },

  async register(email, password) {
    // Backend contract: { id, email } — registration does not return a
    // session token, so callers should navigate to Login afterward.
    return apiFetch("/api/auth/register", {
      method: "POST",
      body: { email, password },
    });
  },

  logout() {
    this.clearSession();
  },

  getToken() {
    try {
      return localStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  clearSession() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  },

  _setToken(token) {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, token);
    } catch {
      // ignore
    }
  },
};
