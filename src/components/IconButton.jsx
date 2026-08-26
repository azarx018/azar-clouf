import React from "react";
import "./IconButton.css";

export default function IconButton({ icon: Icon, label, onClick, variant = "default" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-btn icon-btn--${variant}`}
      onClick={onClick}
    >
      <Icon size={18} />
    </button>
  );
}
