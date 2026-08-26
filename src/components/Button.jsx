import React from "react";
import "./Button.css";

/**
 * Primary UI button.
 * variant: "primary" | "secondary" | "ghost" | "danger"
 */
export default function Button({ children, variant = "primary", icon: Icon, onClick, disabled, type = "button" }) {
  return (
    <button
      type={type}
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={16} />}
      <span>{children}</span>
    </button>
  );
}
