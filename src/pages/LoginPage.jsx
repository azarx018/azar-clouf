import React, { useState } from "react";
import { Cloud, Eye, EyeOff } from "lucide-react";
import Button from "../components/Button.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import "./LoginPage.css";

export default function LoginPage({ onNavigateRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // AuthProvider flips status to "authenticated"; App.jsx renders the Cloud UI.
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Cloud size={28} />
          <span>AzarCloud</span>
        </div>
        <p className="auth-subtitle">Your personal cloud. Sign in to continue.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-field__label">Email</span>
            <input
              className="auth-field__input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </label>

          <label className="auth-field">
            <span className="auth-field__label">Password</span>
            <div className="auth-field__input-row">
              <input
                className="auth-field__input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <button className="auth-switch" onClick={onNavigateRegister}>
          Don't have an account? <span>Create one</span>
        </button>
      </div>
    </div>
  );
}
