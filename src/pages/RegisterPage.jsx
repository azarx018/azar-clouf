import React, { useState } from "react";
import { Cloud, Eye, EyeOff } from "lucide-react";
import Button from "../components/Button.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { getFriendlyErrorMessage } from "../services/errorMessages.js";
import "./LoginPage.css";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function RegisterPage({ onNavigateLogin }) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!email || !isValidEmail(email)) return "Please enter a valid email address.";
    if (!password) return "Please enter a password.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords don't match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Backend contract: register returns { id, email }, no session token.
      // Frontend validation above is only for UX — the backend remains authoritative.
      await register(email, password);
      setSuccess(true);
      setTimeout(() => onNavigateLogin?.(), 1200);
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
        <p className="auth-subtitle">Create your account to get started.</p>

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
              disabled={loading || success}
            />
          </label>

          <label className="auth-field">
            <span className="auth-field__label">Password</span>
            <div className="auth-field__input-row">
              <input
                className="auth-field__input"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading || success}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="auth-field">
            <span className="auth-field__label">Confirm password</span>
            <input
              className="auth-field__input"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || success}
            />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}
          {success && <div className="auth-success">Account created! Redirecting to sign in...</div>}

          <Button type="submit" disabled={loading || success}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <button className="auth-switch" onClick={onNavigateLogin}>
          Already have an account? <span>Sign in</span>
        </button>
      </div>
    </div>
  );
}
